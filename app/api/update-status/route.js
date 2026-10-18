import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { NextResponse } from 'next/server';
import { getAuthScope, ownershipFilter, sanitizeUrlDoc } from '@/lib/apiAuth';
import { isValidMongoId } from '@/lib/validation';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

export async function PATCH(req) {
  try {
    const scope = await getAuthScope();
    const identity = getRateLimitIdentity(req, scope?.userId);
    const rl = await checkRateLimit({ identity, key: 'update-status', limit: 60, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const filter = ownershipFilter(scope);
    if (!filter) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await req.json().catch(() => ({}));
    if (!isValidMongoId(id) || !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    await dbConnect();
    const updated = await ShortUrl.findOneAndUpdate(
      { _id: id, ...filter },
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'URL not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Status updated',
      url: sanitizeUrlDoc(updated),
    });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
