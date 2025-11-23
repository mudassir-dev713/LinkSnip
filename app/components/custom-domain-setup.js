'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, CheckCircle, XCircle, Copy } from 'lucide-react';

export function CustomDomainSetup() {
  const [domain, setDomain] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('DNS');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const { toast } = useToast();

  const handleAddDomain = async () => {
    if (!domain) {
      toast({
        title: 'Domain Required',
        description: 'Please enter a domain name',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would call your API
    toast({
      title: 'Domain Added',
      description: 'Your domain has been added. Please verify it using the instructions below.',
    });
  };

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random verification result for demo
    const success = Math.random() > 0.3;
    setVerificationStatus(success ? 'success' : 'failed');
    setIsVerifying(false);
    
    toast({
      title: success ? 'Verification Successful' : 'Verification Failed',
      description: success 
        ? 'Your domain has been successfully verified!' 
        : 'Domain verification failed. Please check your DNS settings.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Verification record copied',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Custom Domain Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="domain">Domain Name</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="domain"
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <Button onClick={handleAddDomain}>Add Domain</Button>
            </div>
          </div>

          <div>
            <Label>Verification Method</Label>
            <Select value={verificationMethod} onValueChange={setVerificationMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DNS">DNS Record (Recommended)</SelectItem>
                <SelectItem value="FILE">File Upload</SelectItem>
                <SelectItem value="CNAME">CNAME Record</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {domain && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Verification Instructions</h3>
            
            {verificationMethod === 'DNS' && (
              <div className="space-y-4">
                <p>Add the following TXT record to your DNS settings:</p>
                <div className="bg-muted p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm">Name: @</p>
                    <p className="font-mono text-sm">Type: TXT</p>
                    <p className="font-mono text-sm break-all">Value: urlsnip-verification=abc123xyz</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard('urlsnip-verification=abc123xyz')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {verificationMethod === 'FILE' && (
              <div className="space-y-4">
                <p>Upload the following file to your domain root:</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-mono text-sm">File name: urlsnip-verify.txt</p>
                  <p className="font-mono text-sm mt-2">Content:</p>
                  <p className="font-mono text-sm break-all mt-1">abc123xyz</p>
                </div>
                <p>Then access: https://{domain}/urlsnip-verify.txt</p>
              </div>
            )}

            {verificationMethod === 'CNAME' && (
              <div className="space-y-4">
                <p>Add the following CNAME record to your DNS settings:</p>
                <div className="bg-muted p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm">Name: urlsnip</p>
                    <p className="font-mono text-sm">Type: CNAME</p>
                    <p className="font-mono text-sm">Value: verify.urlsnip.com</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard('verify.urlsnip.com')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={handleVerifyDomain} 
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify Domain'}
            </Button>

            {verificationStatus && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${verificationStatus === 'success' ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
                {verificationStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span>
                  {verificationStatus === 'success' 
                    ? 'Domain successfully verified!' 
                    : 'Domain verification failed. Please check your settings.'}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Note:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>It may take up to 24 hours for DNS changes to propagate</li>
            <li>Make sure your domain registrar allows the required DNS record types</li>
            <li>SSL certificates are automatically provisioned for verified domains</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}