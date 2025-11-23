'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LinkExpiration } from '@/app/components/link-expiration';
import { LinkRetargeting } from '@/app/components/link-retargeting';
import { LinkPreview } from '@/app/components/link-preview';
import { BulkShortener } from '@/app/components/bulk-shortener';
import { SocialSharing } from '@/app/components/social-sharing';
import { AdvancedAnalytics } from '@/app/components/advanced-analytics';
import { CustomDomainSetup } from '@/app/components/custom-domain-setup';
import { Plus, Copy, ExternalLink, BarChart3, Globe, FileText, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EnhancedDashboard() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const { toast } = useToast();

  const handleShorten = () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to shorten',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would call your shorten API
    const newShortUrl = `https://urlsnip.vercel.app/${Math.random().toString(36).substring(2, 8)}`;
    setShortUrl(newShortUrl);
    
    toast({
      title: 'Success',
      description: 'URL shortened successfully!',
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'URL copied to clipboard',
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Enhanced Dashboard</h1>
        <p className="text-muted-foreground">
          All your link management tools in one place
        </p>
      </div>

      <Tabs defaultValue="shorten" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
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
           
            <span className="hidden sm:inline">Expiration</span>
          </TabsTrigger>
          <TabsTrigger value="sharing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sharing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shorten">
          <Card>
            <CardHeader>
              <CardTitle>Create Short URL</CardTitle>
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
                  className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600"
                >
                  Shorten <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>

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
                        onClick={() => copyToClipboard(shortUrl)}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy
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