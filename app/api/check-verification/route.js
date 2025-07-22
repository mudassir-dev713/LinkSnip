// /app/api/check-verification/route.js or .ts
import { NextResponse } from 'next/server';
import User from '@/models/User'; // your user model
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ verified: false });
  }

  await dbConnect();

  const user = await User.findOne({ email });

  return NextResponse.json({ verified: user?.isVerified || false });
}
