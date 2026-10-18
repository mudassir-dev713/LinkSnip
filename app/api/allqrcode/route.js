import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

export async function GET(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const anonId = (await cookies()).get('anonId');
  if (!session && !anonId) {
    return NextResponse.json({ error: 'User not Found' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session?.user?.id),
    key: 'allqrcode',
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  let qr = [];

  if (session?.user?.id) {
    const userId = session.user.id;

    qr = await QrCode.find({ user: userId }).sort({
      createdAt: -1,
    });
  }
  if (!session?.user?.id && anonId.value) {
    const userId = anonId.value;

    qr = await QrCode.find({ anonId: userId }).sort({
      createdAt: -1,
    });
  }
  const res = NextResponse.json({ qr }, { status: 200 });
  res.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate');
  return res;
}
