import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import LinkArchive from '@/models/LinkArchive';
import { requireUser } from '@/lib/apiAuth';
import { validateUrl } from '@/lib/validation';
import {
  checkRateLimit,
  getRateLimitIdentity,
  rateLimitedResponse,
} from '@/lib/rateLimit';

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB read cap
const EXCERPT_LENGTH = 1500;

/** Strip tags/scripts/styles down to readable plain text. */
function htmlToExcerpt(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, EXCERPT_LENGTH);
}

function extractMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(
    /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i
  );
  const decode = (s = '') =>
    s
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  return {
    title: titleMatch ? decode(titleMatch[1]).slice(0, 200) : null,
    description: descMatch ? decode(descMatch[1]).slice(0, 500) : null,
  };
}

/** Read a response body as text with a hard byte cap. */
async function readCappedText(res) {
  const reader = res.body?.getReader();
  if (!reader) return '';
  let received = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    chunks.push(value);
    if (received >= MAX_HTML_BYTES) {
      try {
        await reader.cancel();
      } catch {}
      break;
    }
  }
  const merged = new Uint8Array(Math.min(received, MAX_HTML_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset + chunk.byteLength > merged.byteLength) {
      merged.set(chunk.subarray(0, merged.byteLength - offset), offset);
      offset = merged.byteLength;
      break;
    }
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}

export async function GET(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const linkId = searchParams.get('linkId');
  if (!linkId || !mongoose.Types.ObjectId.isValid(linkId)) {
    return NextResponse.json({ error: 'Invalid link id' }, { status: 400 });
  }

  await dbConnect();
  const link = await ShortUrl.exists({ _id: linkId, user: session.user.id });
  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  const archive = await LinkArchive.findOne({ urlId: linkId }).lean();
  return NextResponse.json({ archive: archive || null });
}

export async function POST(request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Archiving performs an outbound fetch — keep the quota tight.
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'archive',
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json().catch(() => null);
  const linkId = body?.linkId;
  if (!linkId || !mongoose.Types.ObjectId.isValid(linkId)) {
    return NextResponse.json({ error: 'Invalid link id' }, { status: 400 });
  }

  await dbConnect();
  const link = await ShortUrl.findOne({ _id: linkId, user: session.user.id })
    .select('fullUrl')
    .lean();
  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  const check = validateUrl(link.fullUrl);
  if (!check.ok) {
    return NextResponse.json(
      { error: 'Link destination is not archivable' },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(check.url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'LinkSnip-Archive/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        cache: 'no-store',
      });
    } finally {
      clearTimeout(timer);
    }

    const html = await readCappedText(res);
    const { title, description } = extractMeta(html);
    const excerpt = htmlToExcerpt(html);

    const archive = await LinkArchive.findOneAndUpdate(
      { urlId: linkId },
      {
        urlId: linkId,
        originalUrl: check.url,
        title,
        description,
        excerpt,
        status: res.ok ? 'ok' : 'error',
        error: res.ok ? null : `Destination responded with ${res.status}`,
        archivedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ archive });
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'The destination took too long to respond'
        : 'Could not reach the destination';

    const archive = await LinkArchive.findOneAndUpdate(
      { urlId: linkId },
      {
        urlId: linkId,
        originalUrl: check.url,
        status: 'error',
        error: message,
        archivedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ archive }, { status: 200 });
  }
}
