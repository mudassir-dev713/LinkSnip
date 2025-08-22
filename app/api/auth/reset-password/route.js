// app/api/auth/request-password-reset/route.js
import { dbConnect } from '@/lib/dbConnect';
import { sendResetPasswordEmail } from '@/lib/email/sendResetPasswordEmail';
import User from '@/models/User';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min expiry
    await user.save();

    // Reset URL
    const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL}/update-password/${resetToken}`;

    // TODO: Send email with resetURL here
    await sendResetPasswordEmail(email, resetURL);

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
