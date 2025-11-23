'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LinkPreview({ url, onContinue, onCancel }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [safe, setSafe] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        // In a real app, this would call a backend service to fetch preview data
        // For now, we'll simulate with a timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate preview data
        setPreviewData({
          title: 'Example Website',
          description: 'This is a sample website preview for demonstration purposes.',
          image: 'https://placehold.co/600x400/222/fff?text=Website+Preview',
          domain: new URL(url).hostname,
        });
        
        // Simulate safety check
        setSafe(Math.random() > 0.2); // 80% chance of being safe
      } catch (error) {
        toast({
          title: 'Preview Error',
          description: 'Could not load preview for this link',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url, toast]);

  if (!url) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Link Preview</h3>
            <div className="flex items-center gap-2">
              {safe === true && (
                <div className="flex items-center text-green-500">
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  <span className="text-sm">Safe</span>
                </div>
              )}
              {safe === false && (
                <div className="flex items-center text-red-500">
                  <ShieldAlert className="h-4 w-4 mr-1" />
                  <span className="text-sm">Potential Risk</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="truncate">{url}</span>
              </div>
              
              {previewData?.image && (
                <div className="relative rounded-lg overflow-hidden border">
                  <img 
                    src={previewData.image} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-1">{previewData?.title || 'No title available'}</h4>
                <p className="text-sm text-muted-foreground">
                  {previewData?.description || 'No description available'}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Domain: {previewData?.domain}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button onClick={onContinue}>
                    Continue to Site
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}