import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { NextResponse } from 'next/server';
import Click from '@/models/Click';
import { getAuthScope, ownershipFilter, sanitizeIdList } from '@/lib/apiAuth';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

export async function DELETE(req) {
  try {
    const scope = await getAuthScope();
    const identity = getRateLimitIdentity(req, scope?.userId);
    const rl = await checkRateLimit({ identity, key: 'delete-url', limit: 30, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const filter = ownershipFilter(scope);
    if (!filter) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const ids = body?.ids ?? body?.id;
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return NextResponse.json({ error: 'No ID(s) provided' }, { status: 400 });
    }

    const idArray = Array.isArray(ids) ? ids : [ids];
    const safeIds = sanitizeIdList(idArray);
    if (!safeIds) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await dbConnect();
    // Only ids actually owned by the caller are collected, so the follow-up
    // click cleanup and the returned count can never touch other users' data.
    const owned = await ShortUrl.find({ _id: { $in: safeIds }, ...filter })
      .select('_id')
      .lean();
    const ownedIds = owned.map((doc) => doc._id);

    if (ownedIds.length === 0) {
      return NextResponse.json({ deletedCount: 0, ids: [] });
    }

    const [result] = await Promise.all([
      ShortUrl.deleteMany({ _id: { $in: ownedIds } }),
      Click.deleteMany({ urlId: { $in: ownedIds } }),
    ]);

    return NextResponse.json({
      deletedCount: result.deletedCount,
      ids: safeIds,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
