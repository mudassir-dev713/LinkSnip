import { NextResponse } from 'next/server';
import Click from '@/models/Click';
import { userAgentFromString } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';
import { extractIp, hashIp, lookupCountry } from '@/lib/ipUtils';
import { resolveRedirectUrl, getLinkAvailabilityError } from '@/lib/redirectEngine';

export async function POST(req, { params }) {
  try {
    const rl = await checkRateLimit({ identity: getRateLimitIdentity(req), key: 'redirect', limit: 120, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    await dbConnect();
    const shorturl = await params;
    const urlDoc = await ShortUrl.findOne({ shortUrl: shorturl.shortUrl });

    if (!urlDoc) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    // Shared gates: expiry, manual status, one-time use, schedule windows.
    const unavailable = getLinkAvailabilityError(urlDoc);
    if (unavailable) {
      return NextResponse.json(
        { success: false, error: unavailable },
        { status: 410 }
      );
    }

    const headers = req.headers;
    const rawIp = extractIp(req);
    const ip = hashIp(rawIp);
    const ua = headers.get('user-agent') || '';
    const userAgent = userAgentFromString(ua);

    let referrer = headers.get('referer');
    let host = headers.get('host') || '';
    if (!referrer || (referrer && referrer.includes(host))) {
      referrer = 'Direct';
    }

    let deviceType = 'Desktop';
    if (userAgent.device.type === 'mobile') deviceType = 'Mobile';
    else if (userAgent.device.type === 'tablet') deviceType = 'Tablet';

    // Offline geo lookup — no external API call per click.
    const { country, countryCode } = lookupCountry(rawIp);
    const hour = new Date().getHours();

    const ctx = {
      deviceType,
      browser: userAgent.browser.name || 'Unknown',
      referrer,
      country,
      countryCode,
      userAgent: ua,
      hour,
    };

    const { url: redirectUrl, matchedBy } = resolveRedirectUrl(urlDoc, ctx);

    const click = await Click.create({
      urlId: urlDoc._id,
      ip,
      browser: ctx.browser,
      deviceType,
      isBot: userAgent.isBot,
      referrer,
      country,
      hour,
      matchedBy,
      destination: redirectUrl,
    });

    // One-time links die after their first verified (non-bot) click.
    const updates = { $inc: { clicks: 1 } };
    if (urlDoc.oneTimeLink && !urlDoc.usedAt && !userAgent.isBot) {
      updates.$set = { usedAt: new Date() };
    }
    await ShortUrl.updateOne({ _id: urlDoc._id }, updates);

    return NextResponse.json(
      { success: true, click, redirectUrl, matchedBy },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record click' },
      { status: 500 }
    );
  }
}
