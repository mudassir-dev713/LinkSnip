'use client';

import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  EmailIcon,
  EmailShareButton,
} from 'react-share';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function SocialSharing({ url, title = 'Check out this link!' }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Share URL</Label>
          <div className="flex gap-2">
            <Input value={url} readOnly />
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Share on Social Media</Label>
          <div className="flex flex-wrap gap-2">
            <FacebookShareButton url={url} quote={title}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>
            
            <TwitterShareButton url={url} title={title}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
            
            <LinkedinShareButton url={url} title={title}>
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
            
            <WhatsappShareButton url={url} title={title}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
            
            <EmailShareButton url={url} subject={title} body={`Check out this link: ${url}`}>
              <EmailIcon size={40} round />
            </EmailShareButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}