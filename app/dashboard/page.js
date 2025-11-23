'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Plus,
  Copy,
  ExternalLink,
  BarChart3,
  Settings,
  RefreshCw,
  Check,
  Clock,
  Globe,
  FileText,
  Share2,
  Smartphone,
  QrCode
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useToast } from '@/hooks/use-toast';
import { useShortenUrl } from '@/hooks/useShortenUrl';
import { useUrls } from '@/hooks/use-urls';
import Head from 'next/head';
import { useQueryClient } from '@tanstack/react-query';
import { LinkExpiration } from '@/app/components/link-expiration';
import { LinkRetargeting } from '@/app/components/link-retargeting';
import { LinkPreview } from '@/app/components/link-preview';
import { BulkShortener } from '@/app/components/bulk-shortener';
import { SocialSharing } from '@/app/components/social-sharing';
import { AdvancedAnalytics } from '@/app/components/advanced-analytics';
import { CustomDomainSetup } from '@/app/components/custom-domain-setup';
import { MobileAppPromo } from '@/app/components/mobile-app-promo';

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL;

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortenLoading, setShortenLoading] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState('shorten');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const queryClient = useQueryClient();

  const { toast } = useToast();

  // React Query hooks
  const shortenMutation = useShortenUrl();
  const {
    data,
    isLoading: urlsLoading,
    isError,
    refetch,
    isFetching: refreshLoading,
  } = useUrls();

  const urls = data?.urls || [];

  // Sort newest first
  const sortedUrls = [...urls].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleShorten = () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to shorten.',
        variant: 'destructive',
      });
      return;
    }

    setShortenLoading(true);
    shortenMutation.mutate(
      { url, customAlias, title, password },
      {
        onSuccess: (data) => {
          setShortUrl(data.shortUrl);
          setUrl('');
          setCustomAlias('');
          setTitle('');
          setPassword('');
          toast({
            title: 'Success',
            description: 'Short URL created successfully!',
          });
          queryClient.invalidateQueries(['urls']);

          setShortenLoading(false);
        },
        onError: (error) => {
          setShortenLoading(false);
          toast({
            title: 'Error',
            description: error.message || 'Something went wrong.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(id);
        setTimeout(() => {
          setCopied(null);
        }, 2000);
      })
      .catch();
  };

  const handlePreview = () => {
    if (!shortUrl) {
      toast({
        title: 'Error',
        description: 'Please create a short URL first',
        variant: 'destructive',
      });
      return;
    }
    setPreviewUrl(shortUrl);
    setShowPreview(true);
  };

  return (
    <>
      <Head>
        <title>Dashboard | LinkSnip</title>
        <meta
          name="description"
          content="Manage and track your shortened links in one centralized dashboard."
        />
      </Head>

      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your shortened URLs and track performance
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="shorten" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Shorten</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="domains" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Domains</span>
            </TabsTrigger>
            <TabsTrigger value="retargeting" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Retargeting</span>
            </TabsTrigger>
            <TabsTrigger value="expiration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Expiration</span>
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sharing</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shorten">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Spotlight
                className="w-full"
                spotlightColor="rgba(59, 130, 246, 0.15)"
              >
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
                        disabled={!url || shortenLoading}
                        className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600"
                      >
                        {shortenLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Shorten <Plus className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced((p) => !p)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-3 p-4 bg-muted/40 border rounded-lg">
                        <Input
                          placeholder="Custom alias (e.g. promo2025)"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                        />
                        <Input
                          placeholder="Name for your dashboard"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Optional password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    )}

                    {shortUrl && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Shortened URL:
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(shortUrl, shortUrl)}
                            >
                              {copied == shortUrl ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3 mr-1" />
                              )}
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handlePreview}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> Preview
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-background rounded border font-mono text-sm break-all">
                          {shortUrl}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Spotlight>
            </motion.div>
          </TabsContent>

          <TabsContent value="bulk">
            <BulkShortener />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="domains">
            <CustomDomainSetup />
          </TabsContent>

          <TabsContent value="retargeting">
            <LinkRetargeting />
          </TabsContent>

          <TabsContent value="expiration">
            <LinkExpiration onExpirationChange={(date) => console.log('Expiration set:', date)} />
          </TabsContent>

          <TabsContent value="sharing">
            <SocialSharing 
              url={shortUrl || "https://urlsnip.vercel.app"} 
              title="Check out this amazing link!" 
            />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileAppPromo />
          </TabsContent>
        </Tabs>

        {/* Recent Links */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Spotlight
            className="w-full"
            spotlightColor="rgba(59, 130, 246, 0.08)"
          >
            <Card className="border-0 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Links</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
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
                  {urlsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : isError ? (
                    <p className="text-sm text-red-500">Failed to fetch URLs</p>
                  ) : sortedUrls.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      No links yet
                    </p>
                  ) : (
                    sortedUrls.slice(0, 3).map((link) => (
                      <div
                        key={link._id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm truncate">
                              {link.shortUrl.startsWith('http')
                                ? link.shortUrl
                                : `${BASE_URL}/${link.shortUrl}`}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(
                                  link.shortUrl.startsWith('http')
                                    ? link.shortUrl
                                    : `${BASE_URL}/${link.shortUrl}`,
                                  link._id
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              {copied == link._id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {link.fullUrl}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{link.clicks} clicks</span>
                            <span>
                              {new Date(link.createdAt).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                              {link.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="md:flex hidden"
                          size="sm"
                          variant="outline"
                        >
                          <BarChart3 className="h-3 w-3 mr-1" /> Analytics
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </Spotlight>
        </motion.div>

        {showPreview && (
          <LinkPreview 
            url={previewUrl} 
            onContinue={() => {
              window.open(previewUrl, '_blank');
              setShowPreview(false);
            }}
            onCancel={() => setShowPreview(false)}
          />
        )}
      </div>
    </>
  );
}