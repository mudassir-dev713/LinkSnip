'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Plus,
  Copy,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Spotlight } from '../components/ui/spotlight';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

import { useToast } from '@/hooks/use-toast';
import { useUrls } from '@/context/urlContext';

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL;

const stats = [
  {
    title: 'Total Links',
    value: '24',
    change: '+12%',
    icon: BarChart3,
    color: 'text-blue-500',
  },
  {
    title: 'Total Clicks',
    value: '12.5K',
    change: '+18%',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    title: 'Unique Visitors',
    value: '8.2K',
    change: '+7%',
    icon: Users,
    color: 'text-purple-500',
  },
  {
    title: 'Countries',
    value: '45',
    change: '+3',
    icon: Globe,
    color: 'text-orange-500',
  },
];

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { urls, addNewUrl, fetchUrlsFromAPI } = useUrls();
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    urls?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [urls]);

  const handleShorten = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to shorten.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          password: password || undefined,
          customAlias: customAlias || undefined,
          title: title || undefined,
        }),
      });
      const data = await response.json();
      console.log('Short URL response:', data);
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
        addNewUrl({
          _id: data._id,
          title: title || 'Untitled Link',
          fullUrl: url,
          shortUrl: data.shortUrl,
          password: password || null,
          clicks: 0,
          status: data.status || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
        toast({
          title: 'Success',
          description: 'Short URL created successfully!',
          variant: 'default',
        });
      } else {
        setShortUrl('');
        console.error('Error creating short URL:', data);
        toast({
          title: 'Error',
          description: data?.error || 'Failed to shorten URL.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setShortUrl('');
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await fetchUrlsFromAPI();
    setRefreshLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: 'Copied!',
          description: 'Short URL copied to clipboard.',
          variant: 'default',
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your shortened URLs and track performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick URL Shortener */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Spotlight className="w-full" spotlightColor="rgba(59, 130, 246, 0.15)">
          <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Create Short URL</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-base"
                />
                <Button
                  onClick={handleShorten}
                  disabled={!url || isLoading}
                  className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Shorten <Plus className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showAdvanced ? 'Hide Advanced Options' : 'Advanced Options'}
                </Button>
              </div>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 bg-muted/40 border rounded-lg"
                >
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Custom URL Alias
                    </label>
                    <Input
                      placeholder="Enter custom alias (e.g., promo2025)"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Link Name
                    </label>
                    <Input
                      placeholder="Give this link a name for your dashboard"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Password Protection
                    </label>
                    <Input
                      type="password"
                      placeholder="Optional password to access link"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </motion.div>
              )}

              {shortUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-muted/50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Shortened URL:
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(shortUrl)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded border font-mono text-sm break-all">
                    {shortUrl}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </Spotlight>
      </motion.div>

      {/* Recent Links */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Spotlight className="w-full" spotlightColor="rgba(59, 130, 246, 0.08)">
          <Card className="border-0 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Links</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  title="Refresh recent links from server"
                  disabled={refreshLoading}
                >
                  {refreshLoading ? (
                    <span className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urls?.slice(0, 3)?.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm truncate">
                          {link.shortUrl &&
                            (link.shortUrl.startsWith('http')
                              ? link.shortUrl
                              : `${BASE_URL}/${link.shortUrl}`)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyToClipboard(
                              link.shortUrl &&
                                (link.shortUrl.startsWith('http')
                                  ? link.shortUrl
                                  : `${BASE_URL}/${link.shortUrl}`)
                            )
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {link.originalUrl}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{link.clicks} clicks</span>

                        <span>
                          Created At{' '}
                          {new Date(link.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                          {link.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Spotlight>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Spotlight
            key={index}
            className="h-full"
            spotlightColor="rgba(139, 92, 246, 0.1)"
          >
            <Card className="border-0 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Spotlight>
        ))}
      </motion.div>
    </div>
  );
}
