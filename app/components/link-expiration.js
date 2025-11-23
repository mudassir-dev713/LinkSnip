'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Save, X } from 'lucide-react';

export function LinkExpiration({ onExpirationChange, currentExpiration }) {
  const [expirationType, setExpirationType] = useState(currentExpiration ? 'date' : 'never');
  const [customDate, setCustomDate] = useState(currentExpiration ? new Date(currentExpiration) : null);
  const [hours, setHours] = useState(24);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (currentExpiration) {
      setExpirationType('date');
      setCustomDate(new Date(currentExpiration));
    }
  }, [currentExpiration]);

  const handleExpirationChange = () => {
    let expirationDate = null;
    
    if (expirationType === 'hours') {
      expirationDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    } else if (expirationType === 'date') {
      expirationDate = customDate;
    }
    
    onExpirationChange(expirationDate);
  };

  const clearExpiration = () => {
    setExpirationType('never');
    setCustomDate(null);
    onExpirationChange(null);
  };

  const formatRelativeTime = (date) => {
    if (!date) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Link Expiration
          </div>
          <div className="flex gap-2">
            {currentExpiration && (
              <Button variant="ghost" size="sm" onClick={clearExpiration}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={handleExpirationChange} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={expirationType === 'never' ? 'default' : 'outline'}
              onClick={() => {
                setExpirationType('never');
                setCustomDate(null);
                onExpirationChange(null);
              }}
            >
              Never Expires
            </Button>
            <Button
              variant={expirationType === 'hours' ? 'default' : 'outline'}
              onClick={() => setExpirationType('hours')}
            >
              Custom Hours
            </Button>
            <Button
              variant={expirationType === 'date' ? 'default' : 'outline'}
              onClick={() => setExpirationType('date')}
            >
              Custom Date
            </Button>
          </div>

          {expirationType === 'hours' && (
            <div className="space-y-2">
              <Label>Expire in (hours)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="8760"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Link will expire at {formatDistanceToNow(new Date(Date.now() + hours * 60 * 60 * 1000))}
              </p>
            </div>
          )}

          {expirationType === 'date' && (
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={customDate ? customDate.toISOString().slice(0, 16) : ''}
                  onChange={(e) => setCustomDate(e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              {customDate && (
                <p className="text-sm text-muted-foreground">
                  Link will expire {formatRelativeTime(customDate)}
                </p>
              )}
            </div>
          )}

          {currentExpiration && expirationType === 'never' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-500">
                Current expiration: {formatRelativeTime(currentExpiration)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Expiration Information:</h4>
          <ul className="text-sm space-y-1">
            <li>• Expired links will show a "Link Expired" page</li>
            <li>• You can reactivate expired links at any time</li>
            <li>• Expiration times are in your local timezone</li>
            <li>• You'll receive email notifications before expiration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}