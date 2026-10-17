import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitedResponse } from '@/lib/rateLimit';
import { getLinkAvailabilityError } from '@/lib/redirectEngine';

const MAX_PASSWORD_LENGTH = 256;

export async function POST(req, { params }) {
  try {
    const rl = await checkRateLimit({ identity: `ip:${getClientIp(req)}`, key: 'verify-password', limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    await dbConnect();
    const body = await req.json().catch(() => null);
    const password = body?.password;
    if (typeof password !== 'string' || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    const shortUrl = await params;
    const urlDoc = await ShortUrl.findOne({ shortUrl: shortUrl.shortUrl });
    if (!urlDoc || !urlDoc.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid link or not password protected' },
        { status: 400 }
      );
    }

    // Keep brute-force attempts from hopping to another link with the same IP.
    const rlLink = await checkRateLimit({ identity: `ip:${getClientIp(req)}`, key: `verify-password:${shortUrl.shortUrl}`, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rlLink.allowed) return rateLimitedResponse(rlLink.resetAt);

    const unavailable = getLinkAvailabilityError(urlDoc);
    if (unavailable) {
      return NextResponse.json(
        { success: false, error: unavailable },
        { status: 410 }
      );
    }

    const isValid = await bcrypt.compare(password, urlDoc.password);
    if (!isValid) {
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
