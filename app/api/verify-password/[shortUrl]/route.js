import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const body = await req.json();
    const { password } = body;
    const shortUrl = await params;
    console.log('Verifying password for short URL:', shortUrl);
    const urlDoc = await ShortUrl.findOne({
      shortUrl: shortUrl.shortUrl,
    });
    if (!urlDoc || !urlDoc.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid link or not password protected' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, urlDoc.password);
    if (!isMatch) {
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
