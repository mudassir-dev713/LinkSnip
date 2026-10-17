// app/api/qrcode/route.js
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { dbConnect } from '@/lib/dbConnect';
import QrCode from '@/models/QrCode';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { generateAnonId } from '@/utils/helper';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';
import { validateQrInput } from '@/lib/validation';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const rl = await checkRateLimit({
      identity: getRateLimitIdentity(request, session?.user?.id),
      key: 'qrcode',
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const body = await request.json().catch(() => null);
    const { url, size = 256, margin = 4, color = '#000000', bgColor = '#ffffff', errorCorrection = 'M' } = body || {};

    if (!url || typeof url !== 'string' || url.length > 2048) {
      return NextResponse.json(
        { error: 'URL or text is required (max 2048 chars)' },
        { status: 400 }
      );
    }

    const check = validateQrInput({ size, margin, color, bgColor, errorCorrection });
    if (!check.ok) {
      return NextResponse.json({ error: 'Invalid QR options', errors: check.errors }, { status: 400 });
    }

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: Number(size),
      margin: Number(margin),
      color: {
        dark: color,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    });

    await dbConnect();
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

      const response = NextResponse.json({ qr: qrDoc });
      if (setNewCookie) {
        response.cookies.set('anonId', anonId, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }
      return response;
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
