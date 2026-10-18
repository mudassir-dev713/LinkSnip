import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';
import { isSafeRedirectUrl } from '@/lib/validation';

const MAX_RULES = 20;

function cleanString(value, max = 100) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  return v.length === 0 ? null : v.slice(0, max);
}

function cleanUrlList(list, { requireKey } = {}) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, MAX_RULES)
    .map((item) => ({
      country: requireKey === 'country' ? cleanString(item?.country, 2)?.toUpperCase() : undefined,
      device: requireKey === 'device' ? cleanString(item?.device, 16)?.toLowerCase() : undefined,
      url: item?.url && isSafeRedirectUrl(item.url) ? item.url : undefined,
      weight: Math.min(100, Math.max(0, Number(item?.weight) || 50)),
    }))
    .filter((item) => item.url && (requireKey === undefined || item[requireKey]));
}

function cleanSchedule(windows) {
  if (!Array.isArray(windows)) return [];
  return windows
    .slice(0, MAX_RULES)
    .map((w) => {
      const start = w?.start ? new Date(w.start) : null;
      const end = w?.end ? new Date(w.end) : null;
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return null;
      }
      return { start, end };
    })
    .filter(Boolean);
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'smart-links',
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  await dbConnect();

  try {
    const { shortUrl } = params;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const {
      utmSource,
      utmMedium,
      utmCampaign,
      abTesting,
      geoRedirects,
      deviceRedirects,
      oneTimeLink,
      password,
      scheduledActiveTimes,
      qrCodeBranding,
    } = body;

    // Find the link and ensure it belongs to the user
    const link = await ShortUrl.findOne({
      shortUrl: shortUrl,
      user: session.user.id,
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    link.utmSource = cleanString(utmSource, 100);
    link.utmMedium = cleanString(utmMedium, 100);
    link.utmCampaign = cleanString(utmCampaign, 100);
    link.abTesting = cleanUrlList(abTesting);
    link.geoRedirects = cleanUrlList(geoRedirects, { requireKey: 'country' });
    link.deviceRedirects = cleanUrlList(deviceRedirects, { requireKey: 'device' });
    link.oneTimeLink = Boolean(oneTimeLink);
    link.scheduledActiveTimes = cleanSchedule(scheduledActiveTimes);
    link.qrCodeBranding = cleanString(qrCodeBranding, 200);

    // Only touch the password when the client actually sent the field —
    // an empty string clears it, a missing field keeps the current one.
    if (typeof password === 'string') {
      if (password.length === 0) {
        link.password = null;
      } else if (password.length < 2) {
        return NextResponse.json(
          { error: 'Password must be at least 2 characters' },
          { status: 400 }
        );
      } else if (password.length > 256) {
        return NextResponse.json(
          { error: 'Password must be at most 256 characters' },
          { status: 400 }
        );
      } else {
        link.password = await bcrypt.hash(password, 12);
      }
    }

    await link.save();

    return NextResponse.json({
      success: true,
      message: 'Smart link settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving smart link settings:', error);
    return NextResponse.json({ error: 'Failed to save smart link settings' }, { status: 500 });
  }
}
