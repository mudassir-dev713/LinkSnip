import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import ShortUrl from '@/models/ShortUrl';
import QrCode from '@/models/QrCode';
import LinkHistory from '@/models/LinkHistory';
import Team from '@/models/Team';
import Click from '@/models/Click';
import Folder from '@/models/Folder';
import { requireUser } from '@/lib/apiAuth';
import {
  checkRateLimit,
  getRateLimitIdentity,
  rateLimitedResponse,
} from '@/lib/rateLimit';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Enter your password to confirm'),
});

export async function DELETE(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'user-account-delete',
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json().catch(() => null);
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Cascade: clicks hang off links, so capture link ids first.
    const linkIds = await ShortUrl.find({ user: user._id })
      .select('_id')
      .lean();
    const ids = linkIds.map((l) => l._id);

    await Promise.all([
      ids.length ? Click.deleteMany({ urlId: { $in: ids } }) : null,
      ShortUrl.deleteMany({ user: user._id }),
      QrCode.deleteMany({ user: user._id }),
      LinkHistory.deleteMany({ user: user._id }),
      Folder.deleteMany({ user: user._id }),
      // Teams owned by the user; also drop teams where they were only a member.
      Team.deleteMany({ $or: [{ userId: user._id }, { 'members.userId': user._id }] }),
      User.deleteOne({ _id: user._id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
