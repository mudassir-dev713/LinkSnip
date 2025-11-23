import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id || !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    await dbConnect();
    const updated = await ShortUrl.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'URL not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Status updated', url: updated });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
