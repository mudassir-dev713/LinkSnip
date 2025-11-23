'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, BarChart3, Globe, Smartphone, Monitor, Calendar, Activity } from 'lucide-react';
import { LineChart } from '@/components/ui/line-chart';

export function AdvancedAnalytics({ data }) {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for demonstration
  const mockData = {
    clicksByDate: [
      { date: '2023-05-01', clicks: 45 },
      { date: '2023-05-02', clicks: 52 },
      { date: '2023-05-03', clicks: 48 },
      { date: '2023-05-04', clicks: 65 },
      { date: '2023-05-05', clicks: 78 },
      { date: '2023-05-06', clicks: 82 },
      { date: '2023-05-07', clicks: 95 },
    ],
    devices: [
      { type: 'Mobile', count: 120, percentage: 45 },
      { type: 'Desktop', count: 100, percentage: 38 },
      { type: 'Tablet', count: 45, percentage: 17 },
    ],
    countries: [
      { country: 'United States', clicks: 85, percentage: 32 },
      { country: 'India', clicks: 62, percentage: 23 },
      { country: 'United Kingdom', clicks: 45, percentage: 17 },
      { country: 'Canada', clicks: 32, percentage: 12 },
      { country: 'Germany', clicks: 28, percentage: 10 },
      { country: 'Other', clicks: 13, percentage: 6 },
    ],
    referrers: [
      { source: 'Direct', clicks: 95, percentage: 36 },
      { source: 'Social Media', clicks: 78, percentage: 29 },
      { source: 'Search Engines', clicks: 62, percentage: 23 },
      { source: 'Email', clicks: 30, percentage: 11 },
      { source: 'Other', clicks: 5, percentage: 1 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">265</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold">187</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Country</p>
                <p className="text-2xl font-bold">USA</p>
              </div>
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Device</p>
                <p className="text-2xl font-bold">Mobile</p>
              </div>
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Clicks Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <LineChart data={mockData.clicksByDate.map((d, i) => ({
                ...d,
                label: `May ${i + 1}`,
                shortLabel: `${i + 1}/5`,
                timestamp: new Date(d.date).getTime(),
                _id: d.date
              }))} height={300} period={timeRange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.devices.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{device.type}</span>
                    <span>{device.count} ({device.percentage}%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{country.country}</span>
                  <span className="font-medium">{country.clicks} ({country.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.referrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{referrer.source}</span>
                  <span className="font-medium">{referrer.clicks} ({referrer.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}