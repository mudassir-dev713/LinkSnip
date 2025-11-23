'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, CheckCircle, Copy } from 'lucide-react';
import { useDomains } from '@/hooks/useDomains';

export function CustomDomainSetup() {
  const [newDomain, setNewDomain] = useState('');
  const { domains, addDomain, verifyDomain } = useDomains();

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    
    try {
      await addDomain.mutateAsync(newDomain);
      setNewDomain('');
    } catch (error) {
      console.error('Failed to add domain:', error);
    }
  };

  const handleVerify = async (domainId) => {
    try {
      await verifyDomain.mutateAsync(domainId);
    } catch (error) {
      console.error('Failed to verify domain:', error);
    }
  };

  const copyVerificationRecord = (token) => {
    const record = `urlsnip-verification=${token}`;
    navigator.clipboard.writeText(record);
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
            <Label htmlFor="domain">Add Custom Domain</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="domain"
                placeholder="yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <Button onClick={handleAddDomain} disabled={addDomain.isLoading}>
                {addDomain.isLoading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Your Domains</h3>
          {domains.length === 0 ? (
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
                          onClick={() => handleVerify(domain._id)}
                          disabled={verifyDomain.isLoading}
                        >
                          {verifyDomain.isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                      )}
                      {domain.isVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  
                  {!domain.isVerified && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium mb-2">Verification Instructions</h4>
                      <p className="text-sm">Add this TXT record to your DNS:</p>
                      <div className="bg-muted p-2 rounded flex justify-between items-center mt-2">
                        <code className="text-sm break-all">urlsnip-verification={domain.verificationToken}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyVerificationRecord(domain.verificationToken)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}