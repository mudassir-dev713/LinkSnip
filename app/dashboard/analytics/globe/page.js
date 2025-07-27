'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  GlobeIcon,
  MousePointer,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealisticGlobe } from '@/components/ui/realistic-globe';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function GlobePageContent() {
  const searchParams = useSearchParams();
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const urlId = searchParams.get('urlId');
  const period = searchParams.get('period') || '7d';

  useEffect(() => {
    if (!urlId) return;

    setLoading(true);
    fetch(`/api/analytics/${urlId}?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error('Analytics error:', data.error);
        } else {
          setAnalytics(data);
          setCountryData(data.byCountry || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setLoading(false);
      });
  }, [urlId, period]);

  const totalClicks = countryData.reduce(
    (sum, country) => sum + country.clicks,
    0
  );
  const topCountry = countryData[0];
  const countriesCount = countryData.length;

  const periodLabels = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col   gap-4">
              <Link href="/dashboard/analytics ">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Analytics
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center text-white">
                  <GlobeIcon className="h-8 w-8 mr-3 text-blue-400" />
                  Global Analytics
                </h1>
                <p className="text-slate-300">
                  Interactive 3D visualization of worldwide clicks
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-sm bg-blue-500/20 text-blue-300 border-blue-400/30"
            >
              {periodLabels[period]}
            </Badge>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {totalClicks.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Total Clicks</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center">
                <div className="flex items-center space-x-2">
                  <GlobeIcon className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {countriesCount}
                    </div>
                    <div className="text-xs text-slate-400">Countries</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-lg font-bold text-white truncate">
                      {topCountry?.country || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">Top Country</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {topCountry
                        ? Math.round((topCountry.clicks / totalClicks) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-slate-400">Top Share</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* 3D Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="xl:col-span-3"
            >
              <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <GlobeIcon className="h-5 w-5 text-blue-400" />
                    <span>Interactive Earth</span>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-blue-500/20 text-blue-300 border-blue-400/30"
                    >
                      Realistic 3D
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[700px] w-full rounded-lg overflow-hidden bg-black/20">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-full">
                          <div className="text-white">Loading 3D Earth...</div>
                        </div>
                      }
                    >
                      <RealisticGlobe countryData={countryData} />
                    </Suspense>
                  </div>
                  <div className="p-4 bg-black/20 rounded-b-lg border-t border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="text-slate-300">
                        <div className="text-xs">🖱️ Drag</div>
                        <div className="text-xs opacity-70">Rotate</div>
                      </div>
                      <div className="text-slate-300">
                        <div className="text-xs">🔍 Scroll</div>
                        <div className="text-xs opacity-70">Zoom</div>
                      </div>
                      <div className="text-slate-300">
                        <div className="text-xs">📍 Hover</div>
                        <div className="text-xs opacity-70">Details</div>
                      </div>
                      <div className="text-slate-300">
                        <div className="text-xs">🌍 Auto</div>
                        <div className="text-xs opacity-70">Rotate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Top Countries List */}
              <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {countryData.slice(0, 15).map((country, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {country.country}
                          </div>
                          <div className="text-xs text-slate-400">
                            {country.percentage}% of total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">
                          {country.clicks.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">clicks</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Geographic Spread</span>
                      <span className="text-white">
                        {Math.min((countriesCount / 50) * 100, 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min((countriesCount / 50) * 100, 100)}
                      className="h-2 bg-white/10"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">
                        Top Country Dominance
                      </span>
                      <span className="text-white">
                        {topCountry
                          ? Math.round((topCountry.clicks / totalClicks) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        topCountry ? (topCountry.clicks / totalClicks) * 100 : 0
                      }
                      className="h-2 bg-white/10"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Global Reach</span>
                      <span className="text-white">
                        {countriesCount > 10
                          ? 'Excellent'
                          : countriesCount > 5
                            ? 'Good'
                            : 'Limited'}
                      </span>
                    </div>
                    <Progress
                      value={Math.min((countriesCount / 20) * 100, 100)}
                      className="h-2 bg-white/10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card className="border-0 shadow-xl bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                    <span className="text-sm text-slate-300">High Traffic</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      Medium Traffic
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-green-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Low Traffic</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-3 p-2 bg-white/5 rounded">
                    <strong>Features:</strong> Realistic Earth textures,
                    independent cloud rotation, starry background, and
                    interactive country markers with hover details.
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GlobePage() {
  return (
    <Suspense
      fallback={
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      }
    >
      <GlobePageContent />
    </Suspense>
  );
}
