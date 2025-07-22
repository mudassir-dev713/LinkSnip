import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { NextResponse } from 'next/server';

export async function DELETE(req) {
  try {
    const { ids } = await req.json();

    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return NextResponse.json({ error: 'No ID(s) provided' }, { status: 400 });
    }

    await dbConnect();

    // If only one ID (string), convert to array
    const idArray = Array.isArray(ids) ? ids : [ids];

    const result = await ShortUrl.deleteMany({ _id: { $in: idArray } });

    return NextResponse.json({
      message: `${result.deletedCount} URL(s) deleted`,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
