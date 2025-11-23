'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Save } from 'lucide-react';

export function LinkExpiration({ onExpirationChange }) {
  const [expirationHours, setExpirationHours] = useState(24);
  const [expirationDays, setExpirationDays] = useState(7);
  const [selectedType, setSelectedType] = useState('hours');

  const handleSetExpiration = () => {
    let expirationDate = null;
    
    if (selectedType === 'hours') {
      expirationDate = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    } else if (selectedType === 'days') {
      expirationDate = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    }
    
    onExpirationChange(expirationDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Link Expiration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'hours' ? 'default' : 'outline'}
              onClick={() => setSelectedType('hours')}
              className="flex-1"
            >
              Hours
            </Button>
            <Button
              variant={selectedType === 'days' ? 'default' : 'outline'}
              onClick={() => setSelectedType('days')}
              className="flex-1"
            >
              Days
            </Button>
          </div>

          {selectedType === 'hours' && (
            <div className="space-y-2">
              <Label>Expire in (hours)</Label>
              <Input
                type="number"
                min="1"
                max="8760"
                value={expirationHours}
                onChange={(e) => setExpirationHours(parseInt(e.target.value) || 1)}
                placeholder="24"
              />
              <p className="text-sm text-muted-foreground">
                Link will expire in {expirationHours} hours
              </p>
            </div>
          )}

          {selectedType === 'days' && (
            <div className="space-y-2">
              <Label>Expire in (days)</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={expirationDays}
                onChange={(e) => setExpirationDays(parseInt(e.target.value) || 1)}
                placeholder="7"
              />
              <p className="text-sm text-muted-foreground">
                Link will expire in {expirationDays} days
              </p>
            </div>
          )}
        </div>

        <Button onClick={handleSetExpiration} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Set Expiration
        </Button>
      </CardContent>
    </Card>
  );
}