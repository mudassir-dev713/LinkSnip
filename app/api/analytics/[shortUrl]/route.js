import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Click from '@/models/Click';
import { dbConnect } from '@/lib/dbConnect';

function getDateRange(period) {
  const now = new Date();
  const ranges = {
    '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
  };
  return ranges[period] || ranges['7d'];
}

function getDateFormat(period) {
  const formats = {
    '24h': '%Y-%m-%d %H:00',
    '7d': '%Y-%m-%d',
    '30d': '%Y-%m-%d',
    '90d': '%Y-%m-%d',
  };
  return formats[period] || formats['7d'];
}

function generateDateSeries(period) {
  const now = new Date();
  const series = [];

  if (period === '24h') {
    // Generate exactly 24 hours
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = date.getHours();
      series.push({
        _id: date.toISOString().slice(0, 13) + ':00',
        clicks: 0,
        label: `${hour.toString().padStart(2, '0')}:00`,
        shortLabel: hour.toString().padStart(2, '0'),
        hour: hour,
        timestamp: date.getTime(),
      });
    }
  } else {
    // Generate complete day series
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const monthDay = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });

      series.push({
        _id: date.toISOString().slice(0, 10),
        clicks: 0,
        label:
          period === '7d'
            ? `${weekday}, ${month} ${monthDay}`
            : `${month} ${monthDay}`,
        shortLabel: period === '7d' ? weekday : monthDay.toString(),
        date: date.toISOString().slice(0, 10),
        timestamp: date.getTime(),
      });
    }
  }

  return series;
}

export async function GET(req, { params }) {
  const { shortUrl } = await params;
  const urlId = shortUrl;
  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '7d';

  if (!urlId || !mongoose.Types.ObjectId.isValid(urlId)) {
    return NextResponse.json({ error: 'Invalid URL ID' }, { status: 400 });
  }

  await dbConnect();
  const objId = new mongoose.Types.ObjectId(urlId);
  const dateRange = getDateRange(period);
  const dateFormat = getDateFormat(period);

  try {
    const [
      totalClicks,
      periodClicks,
      uniqueIps,
      countries,
      browsers,
      peakHour,
      clicksByDate,
      deviceBreakdown,
      topReferrers,
      botTraffic,
      hourlyDistribution,
    ] = await Promise.all([
      // Total clicks (all time)
      Click.countDocuments({ urlId: objId }),

      // Period-specific clicks
      Click.countDocuments({
        urlId: objId,
        createdAt: { $gte: dateRange },
      }),

      // Unique visitors in period
      Click.distinct('ip', {
        urlId: objId,
        createdAt: { $gte: dateRange },
        isBot: { $ne: true },
      }),

      // Countries in period
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }, // Increased for globe visualization
      ]),

      // Browsers in period
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Peak hour analysis
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // Clicks by date/hour - ensure complete series
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: {
              $dateToString: { format: dateFormat, date: '$createdAt' },
            },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Device breakdown
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      ]),

      // Top referrers
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        { $group: { _id: '$referrer', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
        { $limit: 5 },
      ]),

      // Bot traffic
      Click.countDocuments({
        urlId: objId,
        createdAt: { $gte: dateRange },
        isBot: true,
      }),

      // Hourly distribution (for all periods)
      Click.aggregate([
        { $match: { urlId: objId, createdAt: { $gte: dateRange } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Generate complete date series and merge with actual data
    const completeDateSeries = generateDateSeries(period);
    const clicksMap = new Map(
      clicksByDate.map((item) => [item._id, item.clicks])
    );

    // Ensure ALL dates/hours are included with proper data
    const enhancedClicksByDate = completeDateSeries.map((item) => ({
      ...item,
      clicks: clicksMap.get(item._id) || 0,
    }));

    // Calculate growth rate
    const midPoint = Math.floor(enhancedClicksByDate.length / 2);
    const firstHalf = enhancedClicksByDate
      .slice(0, midPoint)
      .reduce((sum, item) => sum + item.clicks, 0);
    const secondHalf = enhancedClicksByDate
      .slice(midPoint)
      .reduce((sum, item) => sum + item.clicks, 0);
    const growthRate =
      firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    // Transform data for frontend
    const byCountry = countries.map((country, index) => ({
      country: country._id || 'Unknown',
      clicks: country.count,
      percentage:
        periodClicks > 0 ? Math.round((country.count / periodClicks) * 100) : 0,
      rank: index + 1,
    }));

    const byBrowser = browsers.map((browser, index) => ({
      browser: browser._id || 'Unknown',
      clicks: browser.count,
      percentage:
        periodClicks > 0 ? Math.round((browser.count / periodClicks) * 100) : 0,
      rank: index + 1,
    }));

    const deviceIcons = {
      Mobile: 'Smartphone',
      Desktop: 'Monitor',
      Tablet: 'Tablet',
      Unknown: 'HelpCircle',
    };

    const devices = deviceBreakdown.map((device) => ({
      type: device._id || 'Unknown',
      count: device.count,
      percentage:
        periodClicks > 0 ? Math.round((device.count / periodClicks) * 100) : 0,
      icon: deviceIcons[device._id] || 'HelpCircle',
    }));

    const byReferrer = topReferrers.map((referrer) => ({
      _id: referrer._id || 'Direct',
      clicks: referrer.clicks,
      percentage:
        periodClicks > 0
          ? Math.round((referrer.clicks / periodClicks) * 100)
          : 0,
    }));

    // Create hourly heatmap data (24 hours)
    const hourlyHeatmap = Array.from({ length: 24 }, (_, hour) => {
      const hourData = hourlyDistribution.find((h) => h._id === hour);
      return {
        hour,
        clicks: hourData ? hourData.count : 0,
        label: `${hour.toString().padStart(2, '0')}:00`,
      };
    });

    // Calculate click-through rate and engagement metrics
    const avgClicksPerVisitor =
      uniqueIps.length > 0 ? (periodClicks / uniqueIps.length).toFixed(2) : 0;
    const botPercentage =
      periodClicks > 0 ? Math.round((botTraffic / periodClicks) * 100) : 0;

    return NextResponse.json({
      // Basic metrics
      totalClicks,
      periodClicks,
      uniqueVisitors: uniqueIps.length,
      topCountry: countries?.[0]?._id || 'Unknown',
      topBrowser: browsers?.[0]?._id || 'Unknown',
      peakHour: peakHour?.[0]?._id ?? 'N/A',

      // Enhanced metrics
      growthRate: Math.round(growthRate * 100) / 100,
      avgClicksPerVisitor: Number.parseFloat(avgClicksPerVisitor),
      botTraffic,
      botPercentage,

      // Chart data - COMPLETE series guaranteed
      clicksByDate: enhancedClicksByDate,
      hourlyHeatmap,
      devices,
      byCountry,
      byBrowser,
      byReferrer,

      // Metadata
      period,
      dateRange: {
        from: dateRange.toISOString(),
        to: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}