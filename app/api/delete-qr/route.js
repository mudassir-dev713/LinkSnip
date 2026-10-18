import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';
import { getAuthScope, ownershipFilter, sanitizeIdList } from '@/lib/apiAuth';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

export async function DELETE(req) {
  try {
    const scope = await getAuthScope();
    const identity = getRateLimitIdentity(req, scope?.userId);
    const rl = await checkRateLimit({ identity, key: 'delete-qr', limit: 30, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const filter = ownershipFilter(scope);
    if (!filter) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json().catch(() => ({}));
    const safeIds = sanitizeIdList([id]);
    if (!id || !safeIds) {
      return NextResponse.json(
        { error: 'QR code id is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const deleted = await QrCode.findOneAndDelete({
      _id: safeIds[0],
      ...filter,
    });
    if (!deleted) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: safeIds[0] });
  } catch (err) {
    console.error('Error deleting QR code:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
