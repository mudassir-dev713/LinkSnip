import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';
export async function GET(request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const anonId = (await cookies()).get('anonId');
  if (!session && !anonId) {
    return NextResponse.json({ error: 'User not Found' }, { status: 401 });
  }
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
  return NextResponse.json({ qr }, { status: 200 });
}
