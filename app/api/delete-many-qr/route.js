import { NextResponse } from 'next/server';
import QrCode from '@/models/QrCode';
import { dbConnect } from '@/lib/dbConnect';

export async function DELETE(req) {
  try {
    await dbConnect();
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Array of ids is required' },
        { status: 400 }
      );
    }

    const result = await QrCode.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      ids,
    });
  } catch (err) {
    console.error('Error bulk deleting QR codes:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
