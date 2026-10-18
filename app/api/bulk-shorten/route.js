import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { generateNanoId } from '@/utils/helper';
import { validateUrl, validateTitle } from '@/lib/validation';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';
import { BULK_MAX_BATCH } from '@/lib/constants';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'bulk-shorten',
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  await dbConnect();

  try {
    const body = await request.json().catch(() => null);
    const { urls } = body || {};

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    const total = urls.length;
    const urlList = urls.slice(0, BULK_MAX_BATCH);
    const results = [];
    const docs = [];
    const usedAliases = new Set();

    for (const [index, entry] of urlList.entries()) {
      // Accept plain strings or { url, alias } objects (CSV import).
      const url = typeof entry === 'string' ? entry : entry?.url;
      const alias =
        typeof entry === 'object' && typeof entry?.alias === 'string'
          ? entry.alias.trim().toLowerCase().slice(0, 60)
          : null;

      const check = validateUrl(url);
      if (!check.ok) {
        results.push({
          original: url,
          short: null,
          status: 'error',
          error: check.error,
        });
        continue;
      }

      // Aliases from imported files are validated and de-duplicated.
      let safeAlias = null;
      if (alias) {
        if (!/^[a-z0-9_-]+$/.test(alias) || usedAliases.has(alias)) {
          results.push({
            original: check.url,
            short: null,
            status: 'error',
            error: alias
              ? `Alias "${alias}" is invalid or duplicated — skipped`
              : 'Invalid alias',
          });
          continue;
        }
        usedAliases.add(alias);
        safeAlias = alias;
      }

      const titleCheck = validateTitle(`Bulk URL ${index + 1}`);
      if (titleCheck) {
        results.push({ original: url, short: null, status: 'error', error: titleCheck });
        continue;
      }

      docs.push({
        fullUrl: check.url,
        shortUrl: safeAlias || generateNanoId(8),
        user: session.user.id,
        title: `Bulk URL ${index + 1}`,
        _aliasRequested: safeAlias,
      });
    }

    if (docs.length > 0) {
      // Single round-trip instead of one save per URL. Alias collisions
      // (E11000) abort the batch op but insertedDocs keeps the survivors.
      let created = [];
      try {
        created = await ShortUrl.insertMany(docs, { ordered: false });
      } catch (err) {
        created = err?.insertedDocs || [];
        const failedIndexes = new Set(
          (err?.writeErrors || []).map((e) => e.index ?? e?.op?.index).filter((i) => Number.isFinite(i))
        );
        docs.forEach((doc, index) => {
          if (failedIndexes.has(index)) {
            results.push({
              original: doc.fullUrl,
              short: null,
              status: 'error',
              error: doc._aliasRequested
                ? `Alias "${doc._aliasRequested}" is already taken`
                : 'Could not save this URL',
            });
          }
        });
      }
      for (const doc of created) {
        results.push({
          original: doc.fullUrl,
          short: `${process.env.NEXT_PUBLIC_BASE_URL}/${doc.shortUrl}`,
          status: 'success',
          id: doc._id,
        });
      }
    }

    // truncated tells the client the batch cap was hit so it can say so.
    return NextResponse.json({ results, total, processed: urlList.length, truncated: total > BULK_MAX_BATCH });
  } catch (error) {
    console.error('Error in bulk shortening:', error);
    return NextResponse.json({ error: 'Failed to process URLs' }, { status: 500 });
  }
}
