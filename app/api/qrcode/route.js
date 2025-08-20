// app/api/qrcode/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode'; //
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      url,
      size = 256,
      margin = 4,
      color = '#000000',
      bgColor = '#ffffff',
      errorCorrection = 'M',
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL or text is required' },
        { status: 400 }
      );
    }

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin,
      color: {
        dark: color,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    });

    // ✅ optional: save to Mongo
    await dbConnect();
    const qrDoc = await QrCode.create({
      url,
      size,
      margin,
      color,
      bgColor,
      errorCorrection,
      qrCode: qrDataUrl,
    });

    return NextResponse.json({ qr: qrDoc });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
