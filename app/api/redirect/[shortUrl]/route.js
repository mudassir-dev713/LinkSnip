import { NextResponse } from 'next/server';
import Click from '@/models/Click';
import { userAgentFromString } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';

async function getCountryByIP(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return data.country_name || 'Unknown';
  } catch (error) {
    console.error('IP lookup failed:', error);
    return 'Unknown';
  }
}

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const shorturl = await params;
    const urlDoc = await ShortUrl.findOne({ shortUrl: shorturl.shortUrl });

    if (!urlDoc) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    // Check if link has expired
    if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Link expired' },
        { status: 410 }
      );
    }

    await ShortUrl.updateOne({ _id: urlDoc._id }, { $inc: { clicks: 1 } });

    const headers = req.headers;
    const ip =
      headers.get('x-forwarded-for')?.split(',')[0] ||
      headers.get('x-real-ip') ||
      'unknown';
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

    const country = await getCountryByIP(ip);

    const click = await Click.create({
      urlId: urlDoc._id,
      ip,
      browser: userAgent.browser.name || 'Unknown',
      deviceType,
      isBot: userAgent.isBot,
      referrer,
      country,
      hour: new Date().getHours(),
    });

    // Check retargeting rules
    let redirectUrl = urlDoc.fullUrl;
    if (urlDoc.retargetingRules && urlDoc.retargetingRules.length > 0) {
      for (const rule of urlDoc.retargetingRules) {
        let matches = false;
        
        switch (rule.condition) {
          case 'device':
            matches = deviceType.toLowerCase() === rule.value.toLowerCase();
            break;
          case 'country':
            matches = country.toLowerCase() === rule.value.toLowerCase();
            break;
          case 'browser':
            matches = (userAgent.browser.name || '').toLowerCase().includes(rule.value.toLowerCase());
            break;
          case 'referrer':
            matches = (referrer || '').toLowerCase().includes(rule.value.toLowerCase());
            break;
          // Time-based rules would need more complex logic
        }
        
        if (matches) {
          redirectUrl = rule.redirectUrl;
          break;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      click,
      redirectUrl 
    });
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record click' },
      { status: 500 }
    );
  }
}