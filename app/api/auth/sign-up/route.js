import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import User from '@/models/User';
import { dbConnect } from '@/lib/dbConnect';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { signupSchema } from '@/schema/SignUpSchema';

export async function POST(request) {
  try {
    const body = await request.json();
    //  Validate request body using Zod
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.format();
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 400 }
      );
    }
    const { username, email, password } = parsed.data;

    // Connect to MongoDB
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { message: 'User already exists and is verified.' },
          { status: 409 }
        );
      }

      //  Resend verification email if user  unverified
      const token = randomBytes(32).toString('hex');
      existingUser.verificationToken = token;
      existingUser.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24;
      await existingUser.save();

      await sendVerificationEmail(email, token);
      return NextResponse.json(
        {
          message:
            'User already exists but is not verified. Verification email resent.',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //  Generate verification token
    const token = randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 1000 * 60 * 60 * 24;

    //  Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: tokenExpires,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    await newUser.save();

    //  Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        message:
          'User registered successfully. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
