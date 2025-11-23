'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
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
  QrCode,
  AlertTriangle,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Spotlight } from '../components/ui/spotlight';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useShortenUrl } from '@/hooks/useShortenUrl';
import { useUrls } from '@/hooks/use-urls';
import { LinkExpiration } from '@/app/components/link-expiration';
import { LinkRetargeting } from '@/app/components/link-retargeting';
import { LinkPreview } from '@/app/components/link-preview';
import { BulkShortener } from '@/app/components/bulk-shortener';
import { SocialSharing } from '@/app/components/social-sharing';
import { CustomDomainSetup } from '@/app/components/custom-domain-setup';
import { MobileAppPromo } from '@/app/components/mobile-app-promo';
import Link from 'next/link';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL;

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState('shorten');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
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

  const handleShorten = () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to shorten.',
        variant: 'destructive',
      });
      return;
    }

    shortenMutation.mutate({
      url,
      customAlias: customAlias.trim() || undefined,
      title: title.trim() || undefined,
      password: password.trim() || undefined,
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    
    toast({
      title: 'Copied to clipboard',
      description: 'URL copied successfully',
    });
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
    <div className="p-4 md:p-8 space-y-8">
      {/* Mobile App Promo */}
      <MobileAppPromo />

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
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">QR Codes</span>
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
                      disabled={shortenMutation.isPending}
                    />
                    <Button
                      onClick={handleShorten}
                      disabled={!url.trim() || shortenMutation.isPending}
                      className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600"
                    >
                      {shortenMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                        disabled={shortenMutation.isPending}
                      />
                      <Input
                        placeholder="Name for your dashboard"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={shortenMutation.isPending}
                      />
                      <Input
                        type="password"
                        placeholder="Optional password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={shortenMutation.isPending}
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
                            {copied === shortUrl ? (
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

        <TabsContent value="domains">
          <CustomDomainSetup />
        </TabsContent>

        <TabsContent value="retargeting">
          <LinkRetargeting urls={urls} />
        </TabsContent>

        <TabsContent value="expiration">
          <LinkExpiration onExpirationChange={(date) => {
            console.log('Expiration set:', date);
            toast({
              title: 'Expiration Set',
              description: 'Link expiration has been configured',
            });
          }} />
        </TabsContent>

        <TabsContent value="sharing">
          <SocialSharing 
            url={shortUrl || "https://urlsnip.vercel.app"} 
            title="Check out this amazing link!" 
          />
        </TabsContent>

        <TabsContent value="mobile">
          <Spotlight
            className="w-full"
            spotlightColor="rgba(139, 92, 246, 0.08)"
          >
            <Card className="border-0 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Mobile App Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Download our mobile app for on-the-go link management with push notifications, QR scanning, and offline access.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <Button 
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => window.open('https://apps.apple.com', '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      App Store
                    </Button>
                    <Button 
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => window.open('https://play.google.com', '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Google Play
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Spotlight>
          </TabsContent>

          <TabsContent value="qr">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Generate QR codes for your shortened URLs. This feature allows you to create 
                  scannable QR codes that link to your URLs.
                </p>
                <div className="space-y-2">
                  <Label>Short URL</Label>
                  <Input
                    placeholder="Enter your short URL"
                    value={shortUrl}
                    onChange={(e) => setShortUrl(e.target.value)}
                  />
                </div>
                <Button className="w-full">
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>
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
                    <RefreshCw 
                      className={`h-4 w-4 mr-2 ${refreshLoading ? 'animate-spin' : ''}`} 
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {urlsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Loading links...</span>
                      </div>
                    </div>
                  ) : isError ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <p className="text-destructive">Failed to load links</p>
                      <Button onClick={() => refetch()} variant="outline" className="mt-4">
                        Try Again
                      </Button>
                    </div>
                  ) : urls.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No links yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Create your first short URL to get started
                      </p>
                    </div>
                  ) : (
                    urls.slice(0, 5).map((link) => (
                      <div
                        key={link._id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm truncate max-w-xs">
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
                              {copied === link._id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {link.fullUrl}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{link.clicks?.toLocaleString() || 0} clicks</span>
                            <span>
                              {new Date(link.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              link.status === 'active'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {link.status}
                            </span>
                            {link.expiresAt && (
                              <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full">
                                Expires
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/analytics/${link._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hidden md:flex"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Analytics
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>
              </motion.div>
            ))
          )}
        </motion.div>
      </Tabs>

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
  );
}