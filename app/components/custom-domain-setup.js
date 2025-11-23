'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Globe, CheckCircle, XCircle, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useDomains } from '@/hooks/useDomains';

export function CustomDomainSetup() {
  const [domain, setDomain] = useState('');
  const { toast } = useToast();
  const { domains, isLoading, isError, refetch, addDomain, verifyDomain, deleteDomain } = useDomains();

  const handleAddDomain = async () => {
    if (!domain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain name',
        variant: 'destructive',
      });
      return;
    }

    if (!domain.includes('.')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid domain name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addDomain.mutateAsync(domain);
      setDomain('');
      toast({
        title: 'Success',
        description: 'Domain added successfully',
      });
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
      await verifyDomain.mutateAsync(domainId);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDomain = async (domainId) => {
    try {
      await deleteDomain.mutateAsync(domainId);
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
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Your Domains</h3>
          {isError ? (
            <p className="text-destructive">Failed to load domains</p>
          ) : domains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4" />
              <p>No domains added yet</p>
              <p className="text-sm">Add your custom domains to use branded short URLs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div key={domain._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        {domain.isVerified ? 'Verified' : 'Not verified'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!domain.isVerified && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleVerifyDomain(domain._id)}
                            disabled={verifyDomain.isLoading}
                          >
                            {verifyDomain.isLoading ? 'Verifying...' : 'Verify'}
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm" 
                            onClick={() => handleDeleteDomain(domain._id)}
                            disabled={deleteDomain.isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
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
                      <div className="space-y-2">
                        <p>Add the following TXT record to your DNS settings:</p>
                        <div className="bg-muted p-3 rounded flex justify-between items-center">
                          <div className="font-mono text-sm">
                            <p className="font-medium">Record Name:</p>
                            <p>@ (or yourdomain.com)</p>
                            <p className="font-medium mt-2">Record Type:</p>
                            <p>TXT</p>
                            <p className="font-medium mt-2">Record Value:</p>
                            <p className="break-all">urlsnip-verification={domain.verificationToken}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(`urlsnip-verification=${domain.verificationToken}`)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Note: DNS changes may take up to 24 hours to propagate
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Domain Benefits:</h4>
          <ul className="text-sm space-y-1">
            <li>• Create branded short URLs like <code className="bg-background px-1 rounded">yourbrand.com/offer</code></li>
            <li>• Improved trust and click-through rates</li>
            <li>• Professional appearance for marketing campaigns</li>
            <li>• SSL certificates automatically provisioned</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}