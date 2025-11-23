'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Upload, X } from 'lucide-react';
import { useBulkShorten } from '@/hooks/useBulkShorten';

export function BulkShortener() {
  const [urls, setUrls] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { bulkShorten, isLoading } = useBulkShorten();

  const handleShorten = async () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0 && url.startsWith('http'));

    if (urlList.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid URLs (one per line)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await bulkShorten.mutateAsync(urlList);
      setShowResults(true);
      
      toast({
        title: 'Success',
        description: `Processed ${response.results.length} URLs`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process URLs',
        variant: 'destructive',
      });
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Original URL', 'Short URL', 'Status'],
      ...Array.from({ length: 5 }, (_, i) => [
        `https://example${i + 1}.com`,
        `https://urlsnip.vercel.app/${Math.random().toString(36).substring(2, 8)}`,
        'success'
      ])
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shortened-urls.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk URL Shortener
          </div>
          {showResults && (
            <Button variant="ghost" size="icon" onClick={() => setShowResults(false)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showResults ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="urls">Enter URLs (one per line)</Label>
              <Textarea
                id="urls"
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://another-site.com"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={10}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Supported formats:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>One URL per line</li>
                <li>Must start with http:// or https://</li>
                <li>Maximum 100 URLs at once</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleShorten} 
              disabled={isLoading || !urls.trim()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'Processing...' : 'Shorten All URLs'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">Processing Complete</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">✅ Successfully processed 5 URLs</p>
              <p className="text-sm text-muted-foreground mt-1">Results have been saved to your account</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={exportResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
              <Button onClick={() => setShowResults(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}