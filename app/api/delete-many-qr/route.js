import { NextResponse } from 'next/server';
import QrCode from '@/models/QrCode';
import { dbConnect } from '@/lib/dbConnect';
import { getAuthScope, ownershipFilter, sanitizeIdList } from '@/lib/apiAuth';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

const MAX_BATCH = 100;

export async function DELETE(req) {
  try {
    const scope = await getAuthScope();
    const identity = getRateLimitIdentity(req, scope?.userId);
    const rl = await checkRateLimit({ identity, key: 'delete-many-qr', limit: 30, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const filter = ownershipFilter(scope);
    if (!filter) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await req.json().catch(() => ({}));
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Array of ids is required' },
        { status: 400 }
      );
    }
    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `At most ${MAX_BATCH} ids per request` },
        { status: 400 }
      );
    }

    const safeIds = sanitizeIdList(ids);
    if (!safeIds) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
    }

    await dbConnect();
    const result = await QrCode.deleteMany({
      _id: { $in: safeIds },
      ...filter,
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      ids: safeIds,
    });
  } catch (err) {
    console.error('Error bulk deleting QR codes:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
