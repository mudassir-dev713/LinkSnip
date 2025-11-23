'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileAppPromo() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('mobile-app-banner-dismissed');
    const lastDismissed = localStorage.getItem('mobile-app-banner-last-dismissed');
    
    if (!hasDismissed) {
      setShowBanner(true);
    } else if (lastDismissed) {
      const daysSinceLastDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastDismissed > 7) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('mobile-app-banner-dismissed', 'true');
    localStorage.setItem('mobile-app-banner-last-dismissed', Date.now().toString());
  };

  const handleDownload = (platform) => {
    if (platform === 'iOS') {
      window.open('https://apps.apple.com', '_blank');
    } else if (platform === 'Android') {
      window.open('https://play.google.com', '_blank');
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Card className="border-0 bg-gradient-to-r from-primary/10 to-blue-600/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Smartphone className="h-4 w-4" />
          LinkSnip Mobile App
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Take your link management on the go with our mobile app. Create, track, 
          and manage your short links from anywhere.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="bg-black text-white hover:bg-gray-800 flex-1"
            onClick={() => handleDownload('iOS')}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download for iOS</span>
            <span className="sm:hidden">iOS</span>
          </Button>
          <Button 
            className="bg-green-600 text-white hover:bg-green-700 flex-1"
            onClick={() => handleDownload('Android')}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download for Android</span>
            <span className="sm:hidden">Android</span>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Features:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Create and manage links on the go</li>
            <li>Real-time analytics dashboard</li>
            <li>QR code generation</li>
            <li>Push notifications for important events</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}