import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { requireUser } from '@/lib/apiAuth';
import {
  checkRateLimit,
  getRateLimitIdentity,
  rateLimitedResponse,
} from '@/lib/rateLimit';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export async function POST(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Password changes are sensitive — strict per-account limit.
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'user-password',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json(
        { error: 'New password must be different from the current one' },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
