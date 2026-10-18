'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  ChevronDown,
  Clock,
  Download,
  Globe,
  HelpCircle,
  Link2,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Smartphone,
  Tablet,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { cn } from '@/lib/utils';
import { useUrls } from '@/hooks/use-urls';
import { useAnalytics } from '@/hooks/use-analytics';
import { useToast } from '@/hooks/use-toast';
import { ClickChart } from './click-chart';
import { countryFlag, countryName, referrerInfo } from '@/lib/countries';

const PERIODS = [
  { value: '24h', label: '24h', title: 'Last 24 hours' },
  { value: '7d', label: '7d', title: 'Last 7 days' },
  { value: '30d', label: '30d', title: 'Last 30 days' },
  { value: '90d', label: '90d', title: 'Last 90 days' },
];

const DEVICE_ICONS = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet, Unknown: HelpCircle };

const BASE_URL =
  typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL;

const fullShortUrl = (url) =>
  url?.shortUrl?.startsWith('http') ? url.shortUrl : `${BASE_URL}/${url?.shortUrl || ''}`;

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-primary" />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const linkParam = searchParams.get('link');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [is24HourFormat, setIs24HourFormat] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const { toast } = useToast();

  const { data: urlsData, isLoading: urlsLoading } = useUrls();
  const urls = useMemo(() => urlsData?.urls || [], [urlsData]);

  // Deep links (?link=<id>) preselect a link. Re-runs whenever the param
  // changes so clicking Analytics on another link switches correctly, even
  // if this page is already mounted. Falls back to the first link when the
  // param is absent or doesn't match anything.
  useEffect(() => {
    if (urls.length === 0) return;
    if (linkParam) {
      const wanted = urls.find((u) => u._id === linkParam);
      if (wanted) {
        setSelectedUrl((prev) => (prev?._id === wanted._id ? prev : wanted));
        return;
      }
    }
    setSelectedUrl((prev) => prev ?? urls[0]);
  }, [urls, linkParam]);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isFetching,
    refetch,
    isError,
  } = useAnalytics(selectedUrl?._id, selectedPeriod);

  useEffect(() => {
    setIs24HourFormat(localStorage.getItem('Time_Format') === '24H');
  }, []);

  const handleFormatChange = (next) => {
    localStorage.setItem('Time_Format', next ? '24H' : '12H');
    setIs24HourFormat(next);
  };

  const formatTime = (hour) => {
    if (hour === null || hour === undefined) return '—';
    if (is24HourFormat) return `${String(hour).padStart(2, '0')}:00`;
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  };

  const filteredUrls = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return urls;
    return urls.filter(
      (u) =>
        (u.title || '').toLowerCase().includes(q) ||
        (u.shortUrl || '').toLowerCase().includes(q) ||
        (u.fullUrl || '').toLowerCase().includes(q)
    );
  }, [urls, query]);

  const periodTitle = PERIODS.find((p) => p.value === selectedPeriod)?.title;
  const periodClicks = analytics?.periodClicks || 0;
  const chartData = useMemo(
    () =>
      (analytics?.clicksByDate || []).map((d) => ({
        ...d,
        label: selectedPeriod === '24h' ? formatTime(d.hour) : d.label,
      })),
    // formatTime is derived from is24HourFormat
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analytics?.clicksByDate, selectedPeriod, is24HourFormat]
  );
  const seriesTotal = chartData.reduce((sum, d) => sum + d.clicks, 0);

  const refreshAnalytics = () => {
    if (!selectedUrl) return;
    refetch();
    toast({ title: 'Refreshed', description: 'Analytics data updated.' });
  };

  const exportAnalytics = () => {
    if (!selectedUrl?._id) return;
    window.location.href = `/api/export/analytics/${selectedUrl._id}?period=${selectedPeriod}`;
    toast({ title: 'Exported', description: 'Your data is downloading as CSV.' });
  };

  if (!urlsLoading && urls.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight">No links yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first short link and its analytics will show up here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Create a link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            How your links perform — down to the hour.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFormatChange(!is24HourFormat)}
            title="Toggle hour format"
          >
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {is24HourFormat ? '24h' : '12h'}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAnalytics} disabled={isFetching || !selectedUrl}>
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportAnalytics} disabled={!selectedUrl}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Link picker + period */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-auto w-full justify-between gap-3 py-2.5 text-left lg:w-[26rem]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-primary">
                  {selectedUrl ? fullShortUrl(selectedUrl).replace(/^https?:\/\//, '') : 'Select a link'}
                </span>
              <span className="block truncate text-xs text-muted-foreground">
                {selectedUrl?.title || 'No title'} · {(selectedUrl?.clicks || 0).toLocaleString()} clicks
              </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[26rem] p-0">
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search links…"
                  className="h-9 w-full rounded-md bg-transparent pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto p-1">
              {filteredUrls.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</p>
              ) : (
                filteredUrls.map((url) => (
                  <button
                    key={url._id}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(url);
                      setPickerOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'flex w-full flex-col gap-0.5 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-accent',
                      url._id === selectedUrl?._id && 'bg-accent/60'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-primary">
                        {fullShortUrl(url).replace(/^https?:\/\//, '')}
                      </span>
                      <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                        {url.clicks?.toLocaleString() || 0} clicks
                      </span>
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {url.title || 'No title'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="inline-flex w-fit rounded-md border p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setSelectedPeriod(p.value)}
              className={cn(
                'rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors',
                selectedPeriod === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {urlsLoading || (analyticsLoading && selectedUrl) ? (
        <SkeletonPage />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Couldn&apos;t load analytics.</span>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
            <Stat
              label="Clicks"
              icon={MousePointerClick}
              value={periodClicks.toLocaleString()}
              sub={<GrowthBadge rate={analytics?.growthRate} />}
            />
            <Stat
              label="Unique visitors"
              icon={Users}
              value={(analytics?.uniqueVisitors || 0).toLocaleString()}
              sub={`${analytics?.avgClicksPerVisitor ?? 0} clicks / visitor`}
            />
            <Stat
              label="Peak hour"
              icon={Clock}
              value={analytics?.peakHour === 'N/A' ? '—' : formatTime(analytics?.peakHour)}
              sub="Busiest hour in period"
            />
            <Stat
              label="Bot traffic"
              icon={Shield}
              value={`${analytics?.botPercentage || 0}%`}
              sub={`${(analytics?.botTraffic || 0).toLocaleString()} filtered clicks`}
            />
          </div>

          {/* Click trend */}
          <Panel
            title="Clicks over time"
            icon={TrendingUp}
            action={
              <span className="text-xs tabular-nums text-muted-foreground">
                {(analytics?.totalClicks || 0).toLocaleString()} all time
              </span>
            }
          >
            <div className="mb-3 flex items-baseline gap-2">
              <span className="font-display text-2xl tabular-nums">{periodClicks.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{periodTitle}</span>
            </div>
            {seriesTotal > 0 ? (
              <ClickChart data={chartData} period={selectedPeriod} />
            ) : (
              <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No clicks recorded in this period.
              </p>
            )}
          </Panel>

          {/* Timing */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Hourly activity" icon={Clock}>
              <HourlyBars hours={analytics?.hourlyHeatmap || []} formatTime={formatTime} />
            </Panel>
            <Panel title="When clicks happen" icon={Calendar} className="lg:col-span-2">
              <WeekdayHeatmap heatmap={analytics?.heatmap} formatTime={formatTime} />
            </Panel>
          </div>

          {/* Audiences */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Panel title="Devices" icon={Smartphone}>
              <RankList
                emptyLabel="No device data yet."
                items={deviceItems(analytics?.devices)}
              />
            </Panel>
            <Panel title="Browsers" icon={Globe}>
              <RankList
                emptyLabel="No browser data yet."
                items={(analytics?.byBrowser || []).map((b) => ({
                  key: b.browser,
                  label: b.browser || 'Unknown',
                  value: b.clicks,
                  percentage: b.percentage,
                }))}
              />
            </Panel>
            <Panel title="Countries" icon={Globe}>
              <RankList
                emptyLabel="No location data yet."
                items={(analytics?.byCountry || []).slice(0, 8).map((c) => ({
                  key: c.country,
                  leading: <span aria-hidden>{countryFlag(c.country)}</span>,
                  label: countryName(c.country),
                  value: c.clicks,
                  percentage: c.percentage,
                }))}
              />
            </Panel>
            <Panel title="Referrers" icon={Target}>
              <RankList
                emptyLabel="No referrer data yet."
                items={(analytics?.byReferrer || []).map((r, i) => ({
                  key: r._id || i,
                  label: referrerInfo(r._id).label,
                  value: r.clicks,
                  percentage: r.percentage,
                }))}
              />
            </Panel>
          </div>

          {/* Destination split (A/B, geo, retargeting) */}
          {analytics?.byDestination?.length > 0 && (
            <Panel title="Destination split" icon={Share2}>
              <RankList
                emptyLabel=""
                items={analytics.byDestination.map((d) => ({
                  key: d.destination,
                  label: d.destination,
                  value: d.clicks,
                  percentage: d.percentage,
                  mono: true,
                }))}
              />
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

function Panel({ title, icon: Icon, action, children, className }) {
  return (
    <section className={cn('rounded-lg border bg-card p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight">
          {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, icon: Icon, sub }) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <p className="font-display text-2xl leading-none tabular-nums">{value}</p>
      <div className="min-h-[1rem] text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function GrowthBadge({ rate }) {
  if (rate === null || rate === undefined) {
    return <span>No prior period to compare</span>;
  }
  const up = rate >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        up ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? '+' : ''}
      {rate}%
      <span className="font-normal text-muted-foreground">vs prev</span>
    </span>
  );
}

function RankList({ items, emptyLabel }) {
  if (!items || items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.key ?? i} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {item.leading}
              <span className={cn('truncate', item.mono && 'font-mono text-xs')} title={item.label}>
                {item.label}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
              {item.value.toLocaleString()} · {item.percentage}%
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(2, Math.min(100, item.percentage))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function HourlyBars({ hours, formatTime }) {
  if (!hours || hours.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No hourly data yet.</p>;
  }
  const max = Math.max(1, ...hours.map((h) => h.clicks));
  const peak = hours.reduce((best, h) => (h.clicks > best.clicks ? h : best), hours[0]);
  return (
    <div>
      <div className="flex h-28 items-end gap-[3px]">
        {hours.map((h) => (
          <div
            key={h.hour}
            className="flex-1 rounded-sm bg-primary transition-opacity hover:opacity-70"
            style={{
              height: `${Math.max(h.clicks > 0 ? 4 : 2, (h.clicks / max) * 100)}%`,
              opacity: h.clicks === 0 ? 0.12 : 1,
            }}
            title={`${formatTime(h.hour)} — ${h.clicks} ${h.clicks === 1 ? 'click' : 'clicks'}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>11p</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Peak at{' '}
        <span className="font-medium text-foreground">
          {peak.clicks > 0 ? formatTime(peak.hour) : '—'}
        </span>
      </p>
    </div>
  );
}

function WeekdayHeatmap({ heatmap, formatTime }) {
  if (!heatmap?.cells?.length || heatmap.max <= 0) {
    return (
      <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Not enough data yet — this fills in as clicks come in.
      </p>
    );
  }
  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="mb-1 grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-1">
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center text-[10px] tabular-nums text-muted-foreground">
                {h % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {heatmap.cells.map((row, dayIndex) => (
            <div
              key={dayIndex}
              className="mb-1 grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] items-center gap-1"
            >
              <div className="pr-1 text-right text-[11px] text-muted-foreground">
                {heatmap.days[dayIndex]}
              </div>
              {row.map((count, hourIndex) => {
                const intensity = count / heatmap.max;
                return (
                  <div
                    key={hourIndex}
                    title={`${heatmap.days[dayIndex]} ${formatTime(hourIndex)} — ${count} ${
                      count === 1 ? 'click' : 'clicks'
                    }`}
                    className={cn('h-5 rounded-sm', count === 0 ? 'bg-muted/50' : 'bg-primary')}
                    style={count === 0 ? undefined : { opacity: 0.18 + intensity * 0.82 }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {[0.2, 0.45, 0.7, 0.85, 1].map((s) => (
          <div key={s} className="h-3 w-3 rounded-sm bg-primary" style={{ opacity: s }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function deviceItems(devices) {
  return (devices || [])
    .filter((d) => d.count > 0)
    .map((d) => {
      const Icon = DEVICE_ICONS[d.type] || HelpCircle;
      return {
        key: d.type,
        leading: <Icon className="h-3.5 w-3.5 text-muted-foreground" />,
        label: d.type || 'Unknown',
        value: d.count,
        percentage: d.percentage,
      };
    });
}

function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 bg-card p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-7 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded bg-muted/60" />
      </div>
    </div>
  );
}
