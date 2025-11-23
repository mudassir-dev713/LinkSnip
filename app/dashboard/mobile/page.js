'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Copy, 
  BarChart3, 
  QrCode, 
  History, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileAppPromo } from '@/app/components/mobile-app-promo';

export default function MobileDashboard() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [activeTab, setActiveTab] = useState('shorten');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'URL copied to clipboard',
    });
  };

  const navItems = [
    { id: 'shorten', label: 'Shorten', icon: Plus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'qr', label: 'QR Codes', icon: QrCode },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">LinkSnip</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">U</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-card border-r">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start mb-1"
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 pb-20">
        {activeTab === 'shorten' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Short URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter your long URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleShorten}
                    className="w-full"
                  >
                    Shorten URL
                  </Button>
                </div>

                {shortUrl && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium">Your Short URL:</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate flex-1">{shortUrl}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(shortUrl)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <MobileAppPromo />
          </div>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analytics dashboard</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'qr' && (
          <Card>
            <CardHeader>
              <CardTitle>QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">QR code generator</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Link history</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">App settings</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center h-16 rounded-none ${
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}