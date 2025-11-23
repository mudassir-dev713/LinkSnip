'use client';

import { useState } from 'react';
import { format, addDays, addHours } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock } from 'lucide-react';

export function LinkExpiration({ onExpirationChange }) {
  const [expirationType, setExpirationType] = useState('never');
  const [customDate, setCustomDate] = useState(null);
  const [hours, setHours] = useState(24);

  const handleExpirationChange = () => {
    let expirationDate = null;
    
    if (expirationType === 'hours') {
      expirationDate = addHours(new Date(), hours);
    } else if (expirationType === 'date') {
      expirationDate = customDate;
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant={expirationType === 'never' ? 'default' : 'outline'}
              onClick={() => {
                setExpirationType('never');
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
                <Button onClick={handleExpirationChange}>Set Expiration</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Link will expire at {format(addHours(new Date(), hours), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}

          {expirationType === 'date' && (
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={setCustomDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <Button 
                onClick={handleExpirationChange}
                disabled={!customDate}
                className="w-full"
              >
                Set Expiration Date
              </Button>
              {customDate && (
                <p className="text-sm text-muted-foreground">
                  Link will expire at {format(customDate, 'MMM d, yyyy')}
                </p>
              )}
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