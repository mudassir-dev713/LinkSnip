import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { url } from 'node:inspector';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    const { password } = body;
    const shortUrl = await params;
    const urlDoc = await ShortUrl.findOne({
      shortUrl: shortUrl.shortUrl,
    });
    if (!urlDoc || !urlDoc.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid link or not password protected' },
        { status: 400 }
      );
    }
    if (!(password === urlDoc.password)) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, fullUrl: urlDoc.fullUrl });
  } catch (err) {
    console.error('Password verification error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
