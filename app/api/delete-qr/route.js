import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';

export async function DELETE(req) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'QR code id is required' },
        { status: 400 }
      );
    }

    const deleted = await QrCode.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting QR code:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
