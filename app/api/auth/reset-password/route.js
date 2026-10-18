// app/api/auth/request-password-reset/route.js
import { dbConnect } from '@/lib/dbConnect';
import { sendResetPasswordEmail } from '@/lib/email/sendResetPasswordEmail';
import User from '@/models/User';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitedResponse } from '@/lib/rateLimit';
import { resetSchema } from '@/schema/zodSchemas';

export async function POST(request) {
  try {
    const rl = await checkRateLimit({ identity: `ip:${getClientIp(request)}`, key: 'reset-password', limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const body = await request.json().catch(() => null);
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    const email = parsed.data.email.toLowerCase().trim();

    await dbConnect();

    const user = await User.findOne({ email });

    // Always answer with the same message so the endpoint can't be used to
    // probe which emails have accounts (user enumeration).
    if (user) {
      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min expiry
      await user.save();

      // Reset URL
      const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL}/update-password/${resetToken}`;

      await sendResetPasswordEmail(email, resetURL);
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
