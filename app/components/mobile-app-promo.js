'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, QrCode, X } from 'lucide-react';
import { useState } from 'react';

export function MobileAppPromo() {
  const [showQR, setShowQR] = useState(false);

  return (
    <Card className="border-0 bg-gradient-to-r from-primary/10 to-blue-600/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Smartphone className="h-4 w-4" />
          LinkSnip Mobile App
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowQR(!showQR)}>
          {showQR ? <X className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {showQR ? (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="bg-black p-2 rounded">
                <div className="bg-white p-2">
                  {/* QR Code would be generated here */}
                  <div className="w-32 h-32 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-black" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan this QR code to download the app
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="bg-black text-white hover:bg-gray-800 flex-1">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download for iOS</span>
              <span className="sm:hidden">iOS</span>
            </Button>
            <Button className="bg-green-600 text-white hover:bg-green-700 flex-1">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download for Android</span>
              <span className="sm:hidden">Android</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}