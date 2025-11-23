'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, CheckCircle, XCircle, Copy, RefreshCw } from 'lucide-react';
import { useDomains } from '@/hooks/useDomains';

export function CustomDomainSetup() {
  const [domain, setDomain] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('DNS');
  const { toast } = useToast();
  const { domains, isLoading, isError, refetch, addDomain, verifyDomain } = useDomains();

  const handleAddDomain = async () => {
    if (!domain) {
      toast({
        title: 'Domain Required',
        description: 'Please enter a domain name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addDomain.mutateAsync(domain);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleVerifyDomain = async (domainId) => {
    try {
      const response = await verifyDomain.mutateAsync(domainId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Domain verified successfully',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Please check your DNS settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domain Setup
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
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
              <Button onClick={handleAddDomain} disabled={addDomain.isLoading}>
                {addDomain.isLoading ? 'Adding...' : 'Add Domain'}
              </Button>
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

        <div className="space-y-4">
          <h3 className="font-medium">Your Domains</h3>
          {isError ? (
            <p className="text-destructive">Failed to load domains</p>
          ) : domains.length === 0 ? (
            <p className="text-muted-foreground">No domains added yet</p>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div key={domain._id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        {domain.isVerified ? 'Verified' : 'Not verified'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!domain.isVerified && (
                        <Button 
                          size="sm" 
                          onClick={() => handleVerifyDomain(domain._id)}
                          disabled={verifyDomain.isLoading}
                        >
                          {verifyDomain.isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                      )}
                      {domain.isVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </div>
                  
                  {!domain.isVerified && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium mb-2">Verification Instructions</h4>
                      {domain.verificationMethod === 'DNS' && (
                        <div className="space-y-2">
                          <p>Add the following TXT record to your DNS settings:</p>
                          <div className="bg-muted p-2 rounded flex justify-between items-center">
                            <div className="font-mono text-sm">
                              <p>Name: @</p>
                              <p>Type: TXT</p>
                              <p>Value: urlsnip-verification={domain.verificationToken}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(`urlsnip-verification=${domain.verificationToken}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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