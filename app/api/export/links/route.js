// CSV export of the caller's links.
// GET /api/export/links — session or anonId scoped.
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { getAuthScope } from '@/lib/apiAuth';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const HEADERS = ['shortUrl', 'fullUrl', 'title', 'tags', 'clicks', 'status', 'hasPassword', 'expiresAt', 'createdAt'];

export async function GET(req) {
  const scope = await getAuthScope();
  const identity = getRateLimitIdentity(req, scope?.userId);
  const rl = await checkRateLimit({ identity, key: 'export-links', limit: 10, windowMs: 60 * 1000 });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const filter =
    scope?.type === 'user' ? { user: scope.userId } :
    scope?.type === 'anon' ? { anonId: scope.anonId } : null;
  if (!filter) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const docs = await ShortUrl.find(filter)
    .sort({ createdAt: -1 })
    .limit(5000)
    .select('shortUrl fullUrl title tags clicks status password expiresAt createdAt')
    .lean();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const rows = docs.map((d) =>
    [
      `${baseUrl}/${d.shortUrl}`,
      d.fullUrl,
      d.title || 'Untitled',
      (d.tags || []).join('|'),
      d.clicks ?? 0,
      d.status,
      d.password ? 'yes' : 'no',
      d.expiresAt ? new Date(d.expiresAt).toISOString() : '',
      new Date(d.createdAt).toISOString(),
    ]
      .map(csvEscape)
      .join(',')
  );

  const csv = [HEADERS.join(','), ...rows].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="linksnip-links-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
