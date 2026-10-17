// File: app/api/url-info/[shortUrl]/route.js
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitedResponse } from '@/lib/rateLimit';

export async function GET(req, { params }) {
  try {
    const rl = await checkRateLimit({ identity: `ip:${getClientIp(req)}`, key: 'url-info', limit: 60, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    await dbConnect();
    const shortUrl = await params;
    const data = await ShortUrl.findOne({ shortUrl: shortUrl.shortUrl })
      .select('fullUrl title createdAt status password')
      .lean();

    if (!data) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    return NextResponse.json({
      fullUrl: data.password ? null : data.fullUrl,
      title: data.title,
      createdAt: data.createdAt,
      status: data.status,
      password: data.password ? true : null,
    });
  } catch (err) {
    console.error('Error in URL Info API:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
