'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, QrCode } from 'lucide-react';
import { useState } from 'react';

export function MobileAppPromo() {
  const [showQR, setShowQR] = useState(false);

  const handleDownload = (platform) => {
    if (platform === 'iOS') {
      // Redirect to App Store
      window.open('https://apps.apple.com', '_blank');
    } else if (platform === 'Android') {
      // Redirect to Google Play
      window.open('https://play.google.com', '_blank');
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-r from-primary/10 to-blue-600/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          LinkSnip Mobile App
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Take your link management on the go with our mobile app. Create, track, 
          and manage your short links from anywhere.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => handleDownload('iOS')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download for iOS
          </Button>
          <Button 
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => handleDownload('Android')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download for Android
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowQR(!showQR)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Show QR Code
          </Button>
        </div>
        
        {showQR && (
          <div className="p-4 bg-white rounded-lg flex justify-center">
            <div className="text-center">
              <div className="bg-black p-4 rounded-lg inline-block">
                <div className="bg-white p-4">
                  <div className="w-32 h-32 flex items-center justify-center text-4xl font-bold">
                    QR
                  </div>
                </div>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">
                Scan to download the mobile app
              </p>
            </div>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Features:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
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