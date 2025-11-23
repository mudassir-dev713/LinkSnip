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
  Target,
  Settings,
  Calendar,
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
import { useAnalytics } from '@/hooks/use-analytics';
import { useToast } from '@/hooks/use-toast';

// Icon mappings for consistency
const deviceIcons = { Smartphone, Monitor, Tablet, HelpCircle };
const browserIcons = { Unknown: Globe };

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);
  const [is24HourFormat, setIs24HourFormat] = useState(false);
  const { toast } = useToast();
  
  const { data: urls, isLoading: urlsLoading } = useUrls();
  const [selectedUrl, setSelectedUrl] = useState(null);

  // Initialize selected URL when URLs load
  useEffect(() => {
    if (urls && urls.length > 0 && !selectedUrl) {
      setSelectedUrl(urls[0]);
    }
  }, [urls, selectedUrl]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUrlDropdown && !event.target.closest('.url-dropdown-container')) {
        setShowUrlDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUrlDropdown]);

  // Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isFetching: analyticsFetching,
    refetch,
    isError,
  } = useAnalytics(selectedUrl?._id, selectedPeriod);

  // Load time format preference
  useEffect(() => {
    const format = localStorage.getItem('Time_Format');
    setIs24HourFormat(format === '24H');
  }, []);

  const handleFormatChange = (checked) => {
    const format = checked ? '24H' : '12H';
    localStorage.setItem('Time_Format', format);
    setIs24HourFormat(checked);
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

  const periodLabels = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  };

  const refreshAnalytics = () => {
    if (selectedUrl) {
      refetch();
      toast({
        title: 'Analytics Updated',
        description: 'Your analytics data has been refreshed',
      });
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Clicks', analytics.periodClicks || 0],
      ['Unique Visitors', analytics.uniqueVisitors || 0],
      ['Bot Traffic (%)', `${analytics.botPercentage || 0}%`],
      ['Peak Hour', formatTime(analytics.peakHour)],
      ['Growth Rate', `${analytics.growthRate || 0}%`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedUrl?.shortUrl || 'data'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Analytics Exported',
      description: 'Your analytics data has been downloaded',
    });
  };

  if (!urls || urls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
              <p className="text-muted-foreground mb-8">
                Create your first short URL to start tracking analytics
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-primary to-blue-600"
              >
                Create Your First URL
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col">
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Header Section */}
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
                <div className="flex items-center space-x-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Time:</span>
                  <Switch
                    checked={is24HourFormat}
                    onCheckedChange={handleFormatChange}
                  />
                  <span className="text-muted-foreground">24h</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAnalytics}
                    disabled={analyticsFetching}
                  >
                    <RefreshCw 
                      className={`h-4 w-4 mr-2 ${analyticsFetching ? 'animate-spin' : ''}`} 
                    />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAnalytics}
                    disabled={!analytics}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
                <CardContent className="p-4">
                  {urlsLoading ? (
                    <div className="flex justify-center items-center h-16">
                      <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Analyzing URL:
                        </label>
                        <div className="relative url-dropdown-container">
                          <Button
                            variant="ghost"
                            onClick={() => setShowUrlDropdown(!showUrlDropdown)}
                            className="w-full sm:w-auto justify-start text-left hover:bg-muted/50"
                          >
                            <div className="space-y-1 text-left">
                              <div className="font-semibold text-primary truncate max-w-md">
                                {selectedUrl
                                  ? selectedUrl.shortUrl && selectedUrl.shortUrl.startsWith('http')
                                    ? selectedUrl.shortUrl
                                    : `${process.env.NEXT_PUBLIC_BASE_URL}/${selectedUrl.shortUrl}`
                                  : 'Select URL'}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-md">
                                {selectedUrl?.title || 'No title'}
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                          </Button>
                          
                          {showUrlDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-card border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-scroll">
                              {urls?.map((url) => (
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
                                      {url.shortUrl && (url.shortUrl.startsWith('http')
                                        ? url.shortUrl
                                        : `${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortUrl}`)}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      {url.title || 'No title'}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-bold">
                          {analyticsLoading ? (
                            <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                          ) : (
                            (analytics?.periodClicks || 0).toLocaleString()
                          )}
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
                    disabled={analyticsLoading}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              <Badge variant="secondary">
                {periodLabels[selectedPeriod]}
              </Badge>
            </div>
          </motion.div>

          {/* Error State */}
          {isError && selectedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Failed to load analytics. Please try again.
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={refetch}
                  className="ml-2"
                >
                  Retry
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {analyticsLoading && selectedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-6 bg-muted rounded w-8 mt-4"></div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Analytics Content */}
          {!analyticsLoading && selectedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.1)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Period Clicks
                          </p>
                          <p className="text-xl font-bold">
                            {(analytics?.periodClicks || 0).toLocaleString()}
                          </p>
                          {analytics?.growthRate !== undefined && (
                            <div className="flex items-center mt-1">
                              {analytics.growthRate >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                              )}
                              <span className={`text-xs ${analytics.growthRate >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                                {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MousePointer className="h-5 w-5 text-primary" />
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
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Unique Visitors
                          </p>
                          <p className="text-xl font-bold">
                            {(analytics?.uniqueVisitors || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.avgClicksPerVisitor || 0} avg clicks/visitor
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-500" />
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
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Peak Hour
                          </p>
                          <p className="text-xl font-bold">
                            {analytics?.peakHour && analytics.peakHour !== 'N/A'
                              ? formatTime(analytics.peakHour)
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Most active time
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-500" />
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
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Bot Traffic
                          </p>
                          <p className="text-xl font-bold">
                            {analytics?.botPercentage || 0}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.botTraffic || 0} bot clicks
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Click Trends Chart */}
                <div className="lg:col-span-2">
                  <Spotlight
                    className="h-full"
                    spotlightColor="rgba(59, 130, 246, 0.08)"
                  >
                    <Card className="border-0 bg-card/40 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <span className="text-lg">Click Trends</span>
                          </div>
                          {analytics?.growthRate !== undefined && (
                            <Badge 
                              variant={analytics.growthRate >= 0 ? 'default' : 'destructive'}
                              className="text-sm"
                            >
                              {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate}%
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-80 w-full">
                          {analytics?.clicksByDate && analytics.clicksByDate.length > 0 ? (
                            <LineChart
                              data={analytics.clicksByDate.map((item) => ({
                                ...item,
                                label: selectedPeriod === '24h' 
                                  ? formatTime(item.hour) 
                                  : item.label,
                              }))}
                              height={300}
                              showDots={true}
                              animate={true}
                              period={selectedPeriod}
                            />
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

                {/* Hourly Activity Heatmap */}
                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.08)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <span className="text-lg">Hourly Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1">
                        {analytics?.hourlyHeatmap?.map((hour, index) => {
                          const maxClicks = Math.max(
                            ...(analytics.hourlyHeatmap?.map((h) => h.clicks) || [1])
                          );
                          const intensity = maxClicks > 0 ? hour.clicks / maxClicks : 0;

                          return (
                            <div
                              key={index}
                              className="aspect-square rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-pointer"
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
                          Peak: {analytics?.peakHour && analytics.peakHour !== 'N/A' 
                            ? formatTime(analytics.peakHour) 
                            : 'No data'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>
              </div>

              {/* Device and Browser Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Device Breakdown */}
                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.08)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <span className="text-lg">Device Types</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {analytics?.devices && analytics.devices.length > 0 ? (
                        analytics.devices.map((device, index) => {
                          const IconComponent = deviceIcons[device.icon] || HelpCircle;
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <IconComponent className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium capitalize truncate">
                                  {device.type || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <div className="text-sm text-muted-foreground text-right">
                                  {device.count} ({device.percentage}%)
                                </div>
                                <Progress value={device.percentage} className="w-20" />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
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
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="text-lg">Top Browsers</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {analytics?.byBrowser && analytics.byBrowser.length > 0 ? (
                        analytics.byBrowser.map((browser, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">
                                  {browser.browser?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <span className="font-medium truncate">
                                {browser.browser || 'Unknown'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                #{browser.rank}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <div className="text-sm text-muted-foreground text-right">
                                {browser.clicks} ({browser.percentage}%)
                              </div>
                              <Progress value={browser.percentage} className="w-20" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No browser data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Spotlight>
              </div>

              {/* Geographic and Referrer Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Countries */}
                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(59, 130, 246, 0.08)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="text-lg">Top Countries</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {analytics?.byCountry && analytics.byCountry.length > 0 ? (
                        analytics.byCountry.slice(0, 8).map((country, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-5 h-4 bg-muted rounded-sm flex items-center justify-center">
                                <span className="text-xs">🌍</span>
                              </div>
                              <span className="font-medium truncate">
                                {country.country || 'Unknown'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                #{country.rank}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <div className="text-sm text-muted-foreground text-right">
                                {country.clicks?.toLocaleString() || 0} ({country.percentage}%)
                              </div>
                              <Progress value={country.percentage} className="w-16" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No country data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Spotlight>

                {/* Traffic Sources */}
                <Spotlight
                  className="h-full"
                  spotlightColor="rgba(139, 92, 246, 0.08)"
                >
                  <Card className="border-0 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="text-lg">Traffic Sources</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {analytics?.byReferrer && analytics.byReferrer.length > 0 ? (
                        analytics.byReferrer.map((referrer, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
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
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <div className="text-sm text-muted-foreground text-right">
                                {referrer.clicks?.toLocaleString() || 0} ({referrer.percentage}%)
                              </div>
                              <Progress value={referrer.percentage} className="w-16" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No referrer data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Spotlight>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}