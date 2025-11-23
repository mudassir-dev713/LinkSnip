// app/api/qrcode/route.ts
import { NextResponse } from 'next/server';
import QRCode from 'qrcode'; //
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { generateAnonId } from '@/utils/helper';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

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

    await dbConnect();
    const session = await getServerSession(authOptions);
    let qrDoc;
    if (session?.user?.id) {
      qrDoc = await QrCode.create({
        user: session?.user?.id,
        url,
        size,
        margin,
        color,
        bgColor,
        errorCorrection,
        qrCode: qrDataUrl,
      });
    } else {
      const cookieStore = await cookies();
      let anonId = cookieStore.get('anonId')?.value;

      let setNewCookie = false;
      if (!anonId) {
        anonId = generateAnonId();
        setNewCookie = true;
      }

      qrDoc = await QrCode.create({
        url,
        size,
        margin,
        color,
        bgColor,
        errorCorrection,
        qrCode: qrDataUrl,
        anonId: anonId,
      });
    }

    return NextResponse.json({ qr: qrDoc });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
