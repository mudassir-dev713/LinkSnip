import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import ShortUrl from '@/models/ShortUrl';
import { dbConnect } from '@/lib/dbConnect';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

// Strip the password hash from each document; expose only a boolean.
const toSafeUrl = (doc) => {
  const o = doc.toObject();
  const { password, ...rest } = o;
  return { ...rest, hasPassword: !!password };
};

const MAX_LIMIT = 200;

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session?.user?.id),
    key: 'get-urls',
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  await dbConnect();
  const anonId = (await cookies()).get('anonId');
  if (!session && !anonId) {
    return NextResponse.json({ error: 'User not Found' }, { status: 401 });
  }

  // Optional filtering: ?search=<title|url|alias>&tag=<tag>
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();
  const tag = searchParams.get('tag')?.trim().toLowerCase();

  const query =
    session?.user?.id ? { user: session.user.id } : { anonId: anonId.value };

  if (search) {
    const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    query.$or = [{ title: rx }, { fullUrl: rx }, { shortUrl: rx }];
  }
  if (tag) {
    query.tags = tag;
  }

  const docs = await ShortUrl.find(query)
    .sort({ createdAt: -1 })
    .limit(MAX_LIMIT);
  const urls = docs.map(toSafeUrl);

  const res = NextResponse.json({ urls }, { status: 200 });
  return res;
}
