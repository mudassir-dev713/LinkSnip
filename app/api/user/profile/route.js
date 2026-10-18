import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import { requireUser } from '@/lib/apiAuth';
import {
  checkRateLimit,
  getRateLimitIdentity,
  rateLimitedResponse,
} from '@/lib/rateLimit';

const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
});

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id).select(
    'username email isVerified createdAt'
  );
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  });
}

export async function PATCH(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'user-profile',
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    );
  }
  const { username } = parsed.data;

  try {
    await dbConnect();

    const existing = await User.findOne({ username });
    if (existing && existing._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'That username is already taken' },
        { status: 409 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { username },
      { new: true }
    ).select('username email isVerified');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ username: user.username });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
