import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import Folder from '@/models/Folder';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { validateAlias, validateUrl, isSafeRedirectUrl } from '@/lib/validation';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

const MAX_AB_VARIANTS = 5;

const sanitizeUtm = (value) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, 128) : null;

/**
 * Validate the A/B variants payload. Returns { error } or { variants }.
 * An empty array is a valid "clear all variants" signal.
 */
function sanitizeAbTesting(input) {
  if (!Array.isArray(input)) return { error: 'abTesting must be an array' };
  if (input.length > MAX_AB_VARIANTS) {
    return { error: `At most ${MAX_AB_VARIANTS} A/B variants are allowed` };
  }
  const variants = [];
  for (const [index, raw] of input.entries()) {
    const url = typeof raw?.url === 'string' ? raw.url.trim() : '';
    const check = validateUrl(url);
    if (!check.ok) {
      return { error: `Variant ${index + 1}: ${check.error || 'Invalid URL'}` };
    }
    if (!isSafeRedirectUrl(check.url)) {
      return { error: `Variant ${index + 1}: URL must start with http(s)://` };
    }
    const weight = Number(raw?.weight);
    if (!Number.isFinite(weight) || weight < 1 || weight > 100) {
      return { error: `Variant ${index + 1}: weight must be between 1 and 100` };
    }
    variants.push({ url: check.url, weight: Math.round(weight) });
  }
  return { variants };
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'edit',
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  await dbConnect();

  const { shorturl } = await params;
  const body = await request.json();
  const {
    fullUrl,
    title,
    password,
    shortUrl: customAlias,
    folder,
    utmSource,
    utmMedium,
    utmCampaign,
    abTesting,
  } = body;

  // -------------------
  // Validation
  // -------------------
  const errors = {};

  // Every field is optional — only validate what was provided.
  if (fullUrl !== undefined) {
    const check = validateUrl(fullUrl);
    if (!check.ok) {
      errors.fullUrl = check.error;
    }
  }

  if (title !== undefined && title !== null && title.length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }

  if (customAlias) {
    if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
      errors.shortUrl = 'Alias can only contain letters, numbers, -, and _';
    } else {
      const aliasError = validateAlias(customAlias);
      if (aliasError) {
        errors.shortUrl = aliasError;
      } else {
        // Check uniqueness (exclude current doc from check)
        const exists = await ShortUrl.findOne({
          shortUrl: customAlias,
          _id: { $ne: shorturl },
        });
        if (exists) {
          errors.shortUrl =
            'Custom alias already exists. Please choose another one.';
        }
      }
    }
  }
  if (password && password.length < 2) {
    errors.password = 'Password must be at least 2 characters';
  }

  let folderId = undefined;
  if (folder !== undefined) {
    if (folder === null || folder === '') {
      folderId = null;
    } else if (mongoose.Types.ObjectId.isValid(folder)) {
      const owned = await Folder.exists({ _id: folder, user: session.user.id });
      if (!owned) {
        errors.folder = 'Folder not found';
      } else {
        folderId = folder;
      }
    } else {
      errors.folder = 'Invalid folder';
    }
  }

  let abVariants = undefined;
  if (abTesting !== undefined) {
    const result = sanitizeAbTesting(abTesting);
    if (result.error) errors.abTesting = result.error;
    else abVariants = result.variants;
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    // Ensure the document belongs to the logged-in user
    const urlDoc = await ShortUrl.findOne({
      _id: shorturl,
      user: session.user.id,
    });
    if (!urlDoc) {
      return NextResponse.json(
        { error: 'URL not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update only provided fields
    if (fullUrl !== undefined) urlDoc.fullUrl = validateUrl(fullUrl).url;
    if (typeof title !== 'undefined') urlDoc.title = title;
    if (typeof password !== 'undefined') {
      // Hash the new password; empty string clears it.
      urlDoc.password = password ? await bcrypt.hash(password, 12) : null;
    }
    if (typeof customAlias !== 'undefined') urlDoc.shortUrl = customAlias;
    if (folderId !== undefined) urlDoc.folder = folderId;
    if (utmSource !== undefined) urlDoc.utmSource = sanitizeUtm(utmSource);
    if (utmMedium !== undefined) urlDoc.utmMedium = sanitizeUtm(utmMedium);
    if (utmCampaign !== undefined) urlDoc.utmCampaign = sanitizeUtm(utmCampaign);
    if (abVariants !== undefined) urlDoc.abTesting = abVariants;

    await urlDoc.save();

    // Never return the stored hash — respond with a safe projection.
    return NextResponse.json({
      message: 'Short URL updated.',
      data: {
        _id: urlDoc._id,
        fullUrl: urlDoc.fullUrl,
        shortUrl: urlDoc.shortUrl,
        title: urlDoc.title,
        status: urlDoc.status,
        expiresAt: urlDoc.expiresAt,
        hasPassword: !!urlDoc.password,
        folder: urlDoc.folder || null,
        utmSource: urlDoc.utmSource || null,
        utmMedium: urlDoc.utmMedium || null,
        utmCampaign: urlDoc.utmCampaign || null,
        abTesting: urlDoc.abTesting || [],
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update short URL.' },
      { status: 500 }
    );
  }
}
