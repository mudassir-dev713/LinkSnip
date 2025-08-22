'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Download,
  RefreshCw,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  HelpCircle,
  ChevronDown,
  Clock,
  Activity,
  Shield,
  Chrome,
  ChromeIcon as Firefox,
  AppleIcon as Safari,
  DotIcon as Edge,
  Target,
  Settings,
} from 'lucide-react';
import { Spotlight } from '@/app/components/ui/spotlight';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { LineChart } from '@/components/ui/line-chart';
import { useUrls } from '@/hooks/use-urls';
import { useAnalytics } from '@/hooks/useAnalytics';

// Icon mappings
const deviceIcons = { Smartphone, Monitor, Tablet, HelpCircle };
const browserIcons = { Chrome, Firefox, Safari, Edge, Unknown: Globe };

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [is24HourFormat, setIs24HourFormat] = useState(null);
  const { data, isLoading: urlsLoading } = useUrls();

  const urls = data?.urls || [];
  const [selectedUrl, setSelectedUrl] = useState(
    urls.length > 0 ? urls[0] : null
  );
  useEffect(() => {
    setSelectedUrl(urls.length > 0 ? urls[0] : null);
  }, [urls]);

  // Add click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUrlDropdown && !event.target.closest('.url-dropdown-container')) {
        setShowUrlDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUrlDropdown]);

  // fetch analytics via React Query
  const {
    data: analytics,
    isLoading,
    isFetching: refreshLoading,
    refetch,
    isError,
  } = useAnalytics(selectedUrl?._id, selectedPeriod);

  const refreshAnalytics = () => {
    refetch();
  };

  const handleFormatChange = (checked) => {
    if (checked) {
      localStorage.setItem('Time_Format', '12H');
    } else {
      localStorage.setItem('Time_Format', '24H');
    }
    setIs24HourFormat(!checked);
  };
  const formatTime = (hour) => {
    if (is24HourFormat) {
      return `${hour?.toString().padStart(2, '0')}:00`;
    } else {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      return `${hour12}:00 ${ampm}`;
    }
  };
  useEffect(() => {
    const format = localStorage.getItem('Time_Format');
    if (format == '24H') {
      setIs24HourFormat(true);
    } else {
      setIs24HourFormat(false);
    }
  }, []);

  const periodLabels = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col">
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Analytics Dashboard
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Comprehensive insights into your URL performance
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                {/* Time Format Toggle */}
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">24h</span>
                  <Switch
                    checked={!is24HourFormat}
                    onCheckedChange={handleFormatChange}
                  />
                  <span className="text-sm text-muted-foreground">12h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAnalytics}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* URL Selector */}
            <Spotlight
              className="w-full"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4">
                  {urlsLoading ? (
                    <div className="flex justify-center items-center h-16 ">
                      <span className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                    </div>
                  ) : !urls || urls.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No URLs found.
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Analyzing URL:
                        </label>
                        <div className="relative url-dropdown-container">
                          <Button
                            variant="ghost"
                            onClick={() => setShowUrlDropdown(!showUrlDropdown)}
                            className="h-auto p-2 justify-start text-left w-full sm:w-auto hover:bg-muted/50 rounded-md"
                          >
                            <div className="space-y-1 ">
                              <div className="font-semibold text-primary">
                                {selectedUrl
                                  ? selectedUrl.shortUrl &&
                                    selectedUrl.shortUrl.startsWith('http')
                                    ? selectedUrl.shortUrl
                                    : `${process.env.NEXT_PUBLIC_BASE_URL}/${selectedUrl.shortUrl}`
                                  : 'Select URL'}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-full sm:max-w-md">
                                {selectedUrl?.title || 'No title'}
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                          </Button>
                          {showUrlDropdown && (
                            <div className="  top-full left-0 mt-2 w-full sm:w-96 bg-card border border-border rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-scroll">
                              {urls.map((url) => (
                                <button
                                  key={url._id}
                                  onClick={() => {
                                    setSelectedUrl(url);
                                    setShowUrlDropdown(false);
                                  }}
                                  className="w-full p-3 text-left hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                >
                                  <div className="space-y-1">
                                    <div className="font-medium text-primary truncate">
                                      {url.shortUrl &&
                                        (url.shortUrl.startsWith('http')
                                          ? url.shortUrl
                                          : `${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortUrl}`)}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      {url.title}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold">
                          {analytics?.periodClicks?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Clicks
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Spotlight>

            {/* Time Period Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex flex-wrap gap-2">
                {['24h', '7d', '30d', '90d'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={`${selectedPeriod === period ? 'bg-primary' : ''} flex-1 sm:flex-none`}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              <Badge variant="secondary" className="w-fit">
                {periodLabels[selectedPeriod]}
              </Badge>
            </div>
          </motion.div>

          {/* Enhanced Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            {loading ? (
              <>
                <div class="animate-pulse h-full bg-primary/10">
                  <div class="border-0 bg-card/40 backdrop-blur-sm">
                    <div class="p-3 sm:p-4 lg:p-6">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <p class="h-4 bg-gray-500 rounded w-full"></p>
                          <p class="h-6 bg-gray-500 rounded w-1/2 my-2"></p>
                          <div class="w-1/2s h-10 bg-gray-500 rounded mt-3"></div>
                        </div>
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 bg-gray-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="animate-pulse h-full bg-primary/10">
                  <div class="border-0 bg-card/40 backdrop-blur-sm">
                    <div class="p-3 sm:p-4 lg:p-6">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <p class="h-4 bg-gray-500 rounded w-full"></p>
                          <p class="h-6 bg-gray-500 rounded w-1/2 my-2"></p>
                          <div class="w-1/2s h-10 bg-gray-500 rounded mt-3"></div>
                        </div>
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 bg-gray-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="animate-pulse h-full bg-primary/10">
                  <div class="border-0 bg-card/40 backdrop-blur-sm">
                    <div class="p-3 sm:p-4 lg:p-6">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <p class="h-4 bg-gray-500 rounded w-full"></p>
                          <p class="h-6 bg-gray-500 rounded w-1/2 my-2"></p>
                          <div class="w-1/2s h-10 bg-gray-500 rounded mt-3"></div>
                        </div>
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 bg-gray-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="animate-pulse h-full bg-primary/10">
                  <div class="border-0 bg-card/40 backdrop-blur-sm">
                    <div class="p-3 sm:p-4 lg:p-6">
                      <div class="flex items-center justify-between">
                        <div class="min-w-0 flex-1">
                          <p class="h-4 bg-gray-500 rounded w-full"></p>
                          <p class="h-6 bg-gray-500 rounded w-1/2 my-2"></p>
                          <div class="w-1/2s h-10 bg-gray-500 rounded mt-3"></div>
                        </div>
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <div class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 bg-gray-500 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : analytics ? (
              <>
                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.1)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            Period Clicks
                          </p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                            {analytics.periodClicks?.toLocaleString() || 0}
                          </p>
                          {analytics.growthRate !== undefined && (
                            <div className="flex items-center mt-1">
                              {analytics.growthRate >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                              )}
                              <span
                                className={`text-xs ${analytics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                              >
                                {analytics.growthRate > 0 ? '+' : ''}
                                {analytics.growthRate}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MousePointer className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>

                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.1)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            Unique Visitors
                          </p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                            {analytics.uniqueVisitors?.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {analytics.avgClicksPerVisitor} avg clicks/visitor
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>

                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.1)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            Peak Hour
                          </p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                            {analytics.peakHour !== 'N/A'
                              ? formatTime(analytics.peakHour)
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Most active time
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>

                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.1)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            Bot Traffic
                          </p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                            {analytics.botPercentage || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {analytics.botTraffic || 0} bot clicks
                          </p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>
              </>
            ) : selectedUrl ? (
              <div className="col-span-2 lg:col-span-4 text-center text-muted-foreground">
                No analytics data available for this URL
              </div>
            ) : (
              <div className="col-span-2 lg:col-span-4 text-center text-muted-foreground">
                Select a URL to view analytics
              </div>
            )}
          </motion.div>

          {/* Enhanced Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Enhanced Click Trends Line Chart */}
            <div className="lg:col-span-2">
              <Spotlight
                className="h-full"
                spotlightColor="rgba(59, 130, 246, 0.08)"
              >
                <Card className="border-0 bg-card/40 backdrop-blur-sm">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-base sm:text-lg">
                          Click Trends
                        </span>
                      </div>
                      {analytics?.growthRate !== undefined && (
                        <Badge
                          variant={
                            analytics.growthRate >= 0
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {analytics.growthRate > 0 ? '+' : ''}
                          {analytics.growthRate}%
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48 sm:h-64 lg:h-80 w-full relative">
                      {analytics?.clicksByDate &&
                      analytics.clicksByDate.length > 0 ? (
                        <div className="w-full h-full [&_.recharts-tooltip-wrapper]:z-[9999] [&_.recharts-tooltip-cursor]:z-[9998]">
                          <LineChart
                            data={analytics.clicksByDate.map((item) => ({
                              ...item,
                              label:
                                selectedPeriod === '24h'
                                  ? formatTime(item.hour)
                                  : item.label,
                            }))}
                            height={selectedPeriod === '24h' ? 250 : 300}
                            showDots={true}
                            animate={true}
                            period={selectedPeriod}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No click data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Spotlight>
            </div>

            {/* Enhanced Hourly Heatmap */}
            <Spotlight
              className="h-full"
              spotlightColor="rgba(139, 92, 246, 0.08)"
            >
              <Card className="border-0 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base sm:text-lg">
                      Hourly Activity
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2">
                    {analytics?.hourlyHeatmap?.map((hour, index) => {
                      const maxClicks = Math.max(
                        ...(analytics.hourlyHeatmap?.map((h) => h.clicks) || [
                          1,
                        ])
                      );
                      const intensity =
                        maxClicks > 0 ? hour.clicks / maxClicks : 0;

                      return (
                        <div
                          key={index}
                          className="aspect-square rounded-sm flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${Math.max(intensity, 0.1)})`,
                            color: intensity > 0.5 ? 'white' : 'inherit',
                          }}
                          title={`${formatTime(hour.hour)}: ${hour.clicks} clicks`}
                        >
                          {hour.hour}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Peak:{' '}
                      {analytics?.peakHour !== 'N/A'
                        ? formatTime(analytics?.peakHour)
                        : 'No data'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Spotlight>
          </motion.div>

          {/* Device and Browser Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Enhanced Device Breakdown */}
            <Spotlight
              className="h-full"
              spotlightColor="rgba(139, 92, 246, 0.08)"
            >
              <Card className="border-0 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base sm:text-lg">Device Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 sm:space-y-4">
                  {analytics?.devices && analytics.devices.length > 0 ? (
                    analytics.devices.map((device, index) => {
                      const IconComponent =
                        deviceIcons[device.icon] || HelpCircle;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium capitalize truncate">
                              {device.type || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                            <div className="text-xs sm:text-sm text-muted-foreground text-right">
                              {device.count} ({device.percentage}%)
                            </div>
                            <Progress
                              value={device.percentage}
                              className="w-16 sm:w-20"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No device data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </Spotlight>

            {/* Browser Breakdown */}
            <Spotlight
              className="h-full"
              spotlightColor="rgba(139, 92, 246, 0.08)"
            >
              <Card className="border-0 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base sm:text-lg">Top Browsers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 sm:space-y-4">
                  {analytics?.byBrowser && analytics.byBrowser.length > 0 ? (
                    analytics.byBrowser.map((browser, index) => {
                      const IconComponent =
                        browserIcons[browser.browser] || Globe;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {browser.browser}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              #{browser.rank}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                            <div className="text-xs sm:text-sm text-muted-foreground text-right">
                              {browser.clicks} ({browser.percentage}%)
                            </div>
                            <Progress
                              value={browser.percentage}
                              className="w-16 sm:w-20"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No browser data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </Spotlight>
          </motion.div>

          {/* Geographic and Referrer Data */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Enhanced Top Countries */}
            <Spotlight
              className="h-full"
              spotlightColor="rgba(59, 130, 246, 0.08)"
            >
              <Card className="border-0 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-base sm:text-lg">
                        Top Countries
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 sm:space-y-4">
                  {analytics?.byCountry && analytics.byCountry.length > 0 ? (
                    analytics.byCountry.slice(0, 8).map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-5 h-4 sm:w-6 sm:h-4 bg-muted rounded-sm flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">🌍</span>
                          </div>
                          <span className="font-medium truncate">
                            {country.country || 'Unknown'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            #{country.rank}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                          <div className="text-xs sm:text-sm text-muted-foreground text-right">
                            {country.clicks?.toLocaleString() || 0} (
                            {country.percentage}%)
                          </div>
                          <Progress
                            value={country.percentage}
                            className="w-12 sm:w-16"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No country data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </Spotlight>

            {/* Enhanced Top Referrers */}
            <Spotlight
              className="h-full"
              spotlightColor="rgba(139, 92, 246, 0.08)"
            >
              <Card className="border-0 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base sm:text-lg">
                      Traffic Sources
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 sm:space-y-4">
                  {analytics?.byReferrer && analytics.byReferrer.length > 0 ? (
                    analytics.byReferrer.map((referrer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {(referrer._id || 'D').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium truncate">
                            {referrer._id === 'Direct'
                              ? 'Direct Traffic'
                              : referrer._id || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                          <div className="text-xs sm:text-sm text-muted-foreground text-right">
                            {referrer.clicks?.toLocaleString() || 0} (
                            {referrer.percentage}%)
                          </div>
                          <Progress
                            value={referrer.percentage}
                            className="w-12 sm:w-16"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No referrer data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </Spotlight>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
