import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { dbConnect } from '@/lib/dbConnect';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import {
  createShortUrlWithoutUser,
  createShortUrlWithUser,
} from '@/utils/createShortUrl';
import { generateAnonId } from '@/utils/helper';
import Folder from '@/models/Folder';
import {
  checkRateLimit,
  getRateLimitIdentity,
  rateLimitedResponse,
  rateLimitHeaders,
} from '@/lib/rateLimit';
import {
  validateUrl,
  validateAlias,
  validateTitle,
  validateTags,
} from '@/lib/validation';

// Free plan cap: anonymous users are subject to this too via cookie cleanup.
const MAX_EXPIRATION_HOURS = 24 * 365;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const identity = getRateLimitIdentity(req, session?.user?.id);
    const limit = session?.user?.id ? 60 : 10; // logged-in users get a higher quota
    const rl = await checkRateLimit({ identity, key: 'shorten', limit, windowMs: 60 * 1000 });
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt, limit);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { password, customAlias, title, expirationHours, tags } = body;
    const { folderId, utmSource, utmMedium, utmCampaign } = body;

    const urlCheck = validateUrl(body.url);
    if (!urlCheck.ok) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }
    const formattedUrl = urlCheck.url;

    if (customAlias) {
      const aliasError = validateAlias(customAlias);
      if (aliasError) {
        return NextResponse.json({ error: aliasError }, { status: 400 });
      }
    }
    if (title !== undefined && title !== null) {
      const titleError = validateTitle(title);
      if (titleError) {
        return NextResponse.json({ error: titleError }, { status: 400 });
      }
    }
    let safeTags = [];
    if (tags !== undefined) {
      const tagCheck = validateTags(tags);
      if (!tagCheck.ok) {
        return NextResponse.json({ error: tagCheck.error }, { status: 400 });
      }
      safeTags = tagCheck.tags;
    }

    let safeExpirationHours = null;
    if (expirationHours !== undefined && expirationHours !== null && expirationHours !== '') {
      safeExpirationHours = parseInt(expirationHours, 10);
      if (!Number.isFinite(safeExpirationHours) || safeExpirationHours <= 0) {
        return NextResponse.json({ error: 'expirationHours must be a positive number' }, { status: 400 });
      }
      safeExpirationHours = Math.min(safeExpirationHours, MAX_EXPIRATION_HOURS);
    }

    await dbConnect();
    let shorturl;
    let anonId = null;
    let setNewCookie = false;

    // Folder + UTM extras (logged-in only). Folder must be the caller's.
    const extras = {};
    const safeUtm = (value) =>
      typeof value === 'string' && value.trim()
        ? value.trim().slice(0, 128)
        : null;
    const utm = {
      utmSource: safeUtm(utmSource),
      utmMedium: safeUtm(utmMedium),
      utmCampaign: safeUtm(utmCampaign),
    };
    if (session?.user?.id) {
      if (folderId) {
        if (!mongoose.Types.ObjectId.isValid(folderId)) {
          return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
        }
        const folder = await Folder.findOne({ _id: folderId, user: session.user.id });
        if (!folder) {
          return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }
        extras.folder = folder._id;
      }
      for (const [key, value] of Object.entries(utm)) {
        if (value) extras[key] = value;
      }
    }

    if (session?.user?.id) {
      try {
        shorturl = await createShortUrlWithUser(
          formattedUrl,
          session.user.id,
          customAlias,
          password,
          title,
          safeTags,
          extras
        );
      } catch (err) {
        if (
          err.message.includes('Custom alias already exists') ||
          err.code === 11000
        ) {
          return NextResponse.json(
            { error: 'Custom alias already exists. Please choose another one.' },
            { status: 409 }
          );
        }
        throw err;
      }
    } else {
      if (password || customAlias) {
        return NextResponse.json(
          { error: 'You must be logged in to use password or custom alias.' },
          { status: 403 }
        );
      }

      const cookieStore = await cookies();
      anonId = cookieStore.get('anonId')?.value;

      if (!anonId) {
        anonId = generateAnonId();
        setNewCookie = true;
      }
      shorturl = await createShortUrlWithoutUser(formattedUrl, anonId, title);
    }

    if (safeExpirationHours) {
      shorturl.expiresAt = new Date(Date.now() + safeExpirationHours * 60 * 60 * 1000);
      await shorturl.save();
    }
    if (safeTags.length > 0) {
      shorturl.tags = safeTags;
      await shorturl.save();
    }

    const payload = {
      _id: shorturl._id,
      message: 'Short URL created successfully',
      shortUrl: process.env.NEXT_PUBLIC_BASE_URL + '/' + shorturl.shortUrl,
      fullUrl: formattedUrl,
      createdAt: shorturl.createdAt,
      updatedAt: shorturl.updatedAt,
      title: shorturl.title,
      user: null,
      hasPassword: !!shorturl.password,
      status: shorturl.status || 'active',
      expiresAt: shorturl.expiresAt || null,
      tags: shorturl.tags || [],
      folder: shorturl.folder || null,
      utmSource: shorturl.utmSource || null,
      utmMedium: shorturl.utmMedium || null,
      utmCampaign: shorturl.utmCampaign || null,
    };

    const response = NextResponse.json(payload, {
      headers: rateLimitHeaders(rl, limit),
    });

    if (!session?.user?.id && setNewCookie) {
      response.cookies.set('anonId', anonId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
