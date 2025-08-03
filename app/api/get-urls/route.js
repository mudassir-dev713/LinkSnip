import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import ShortUrl from '@/models/ShortUrl';
import { dbConnect } from '@/lib/dbConnect';
export async function GET(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const anonId = (await cookies()).get('anonId');
  if (!session && !anonId) {
    return NextResponse.json({ error: 'User not Found' }, { status: 401 });
  }
  let urls = [];
  if (session?.user?.id) {
    const userId = session.user.id;

    urls = await ShortUrl.find({ user: userId }).sort({
      createdAt: -1,
    });
  }
  if (!session?.user?.id && anonId.value) {
    const userId = anonId.value;

    urls = await ShortUrl.find({ anonId: userId }).sort({
      createdAt: -1,
    });
  }
  return NextResponse.json({ urls }, { status: 200 });
}
