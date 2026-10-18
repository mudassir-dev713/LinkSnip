// CSV export of a link's daily click analytics (owner only).
// GET /api/export/analytics/[shortUrl]?period=7d
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Click from '@/models/Click';
import ShortUrl from '@/models/ShortUrl';
import { dbConnect } from '@/lib/dbConnect';
import { requireUser } from '@/lib/apiAuth';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';

const PERIODS = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };

function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req, { params }) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const identity = getRateLimitIdentity(req, session.user.id);
  const rl = await checkRateLimit({ identity, key: 'export-analytics', limit: 10, windowMs: 60 * 1000 });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const { shortUrl: urlId } = await params;
  if (!urlId || !mongoose.Types.ObjectId.isValid(urlId)) {
    return NextResponse.json({ error: 'Invalid URL ID' }, { status: 400 });
  }

  await dbConnect();
  const link = await ShortUrl.findOne({ _id: urlId, user: session.user.id })
    .select('shortUrl fullUrl title')
    .lean();
  if (!link) {
    return NextResponse.json({ error: 'URL not found or unauthorized' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '7d';
  const days = PERIODS[period] || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await Click.aggregate([
    { $match: { urlId: new mongoose.Types.ObjectId(urlId), createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        clicks: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$ip' },
        botClicks: { $sum: { $cond: ['$isBot', 1, 0] } },
      },
    },
    { $addFields: { uniqueVisitors: { $size: '$uniqueVisitors' } } },
    { $sort: { _id: 1 } },
  ]);

  const header = ['date', 'clicks', 'uniqueVisitors', 'botClicks', 'shortUrl', 'fullUrl', 'title'];
  const csv = [
    header.join(','),
    ...rows.map((r) =>
      [
        r._id,
        r.clicks,
        r.uniqueVisitors,
        r.botClicks,
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${link.shortUrl}`,
        link.fullUrl,
        link.title || 'Untitled',
      ]
        .map(csvEscape)
        .join(',')
    ),
  ].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="linksnip-analytics-${link.shortUrl}-${period}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
