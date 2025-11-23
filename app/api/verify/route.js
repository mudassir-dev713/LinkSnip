import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await dbConnect();

    const token = new URL(req.url).searchParams.get('token');
    if (!token) {
      return NextResponse.redirect(new URL('/verify?status=expired', req.url));
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/verify?status=expired', req.url));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.redirect(new URL('/verify?status=success', req.url));
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
