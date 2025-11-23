'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LinkRetargeting({ urls = [] }) {
  const [selectedLink, setSelectedLink] = useState('');
  const [condition, setCondition] = useState('device');
  const [value, setValue] = useState('mobile');
  const [redirectUrl, setRedirectUrl] = useState('');
  const { toast } = useToast();

  const handleSaveRules = () => {
    if (!selectedLink) {
      toast({
        title: 'Error',
        description: 'Please select a link first',
        variant: 'destructive',
      });
      return;
    }

    if (!redirectUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a redirect URL',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would save to your API
    toast({
      title: 'Success',
      description: 'Retargeting rule saved successfully',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Link Retargeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Select Link</Label>
            <Select value={selectedLink} onValueChange={setSelectedLink}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a link" />
              </SelectTrigger>
              <SelectContent>
                {urls.length > 0 ? (
                  urls.map((url) => (
                    <SelectItem key={url._id} value={url._id}>
                      {url.title || url.shortUrl} - {url.shortUrl}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-urls" disabled>
                    No links available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="device">Device Type</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="browser">Browser</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            {condition === 'device' && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                </SelectContent>
              </Select>
            )}

            {condition === 'country' && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}

            {condition === 'browser' && (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="safari">Safari</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>Redirect URL</Label>
            <Input
              placeholder="https://example.com/special-offer"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSaveRules} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Retargeting Rule
        </Button>
      </CardContent>
    </Card>
  );
}