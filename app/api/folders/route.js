import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { dbConnect } from '@/lib/dbConnect';
import Folder from '@/models/Folder';
import ShortUrl from '@/models/ShortUrl';
import { requireUser } from '@/lib/apiAuth';
import {
  checkRateLimit,
  getRateLimitIdentity,
  rateLimitedResponse,
} from '@/lib/rateLimit';

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Folder name is required')
  .max(40, 'Folder name must be at most 40 characters');

export async function GET(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const [folders, counts] = await Promise.all([
    Folder.find({ user: session.user.id }).sort({ name: 1 }).lean(),
    ShortUrl.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(session.user.id) } },
      { $group: { _id: '$folder', count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(
    counts.map((c) => [String(c._id || 'none'), c.count])
  );

  return NextResponse.json({
    folders: folders.map((f) => ({
      _id: f._id,
      name: f.name,
      linkCount: countMap.get(String(f._id)) || 0,
    })),
    unfiledCount: countMap.get('none') || 0,
  });
}

export async function POST(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'folders-create',
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json().catch(() => null);
  const parsed = nameSchema.safeParse(body?.name);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const existing = await Folder.findOne({
      user: session.user.id,
      name: parsed.data,
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A folder with that name already exists' },
        { status: 409 }
      );
    }
    const folder = await Folder.create({
      name: parsed.data,
      user: session.user.id,
    });
    return NextResponse.json({ folder: { _id: folder._id, name: folder.name, linkCount: 0 } });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'A folder with that name already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const parsed = nameSchema.safeParse(body?.name);
  if (!id || !mongoose.Types.ObjectId.isValid(id) || !parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    await dbConnect();
    const folder = await Folder.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { name: parsed.data },
      { new: true }
    );
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    return NextResponse.json({ folder: { _id: folder._id, name: folder.name } });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'A folder with that name already exists' },
        { status: 409 }
      );
    }
    console.error('Error renaming folder:', error);
    return NextResponse.json({ error: 'Failed to rename folder' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    await dbConnect();
    const folder = await Folder.findOneAndDelete({ _id: id, user: session.user.id });
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    // Links survive; they simply become unfiled.
    await ShortUrl.updateMany(
      { user: session.user.id, folder: folder._id },
      { $set: { folder: null } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
