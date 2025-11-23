'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Link, Download, X } from 'lucide-react';
import { useBulkShorten } from '@/hooks/useBulkShorten';

export function BulkShortener() {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState([]);
  const { toast } = useToast();
  const { bulkShorten, isLoading } = useBulkShorten();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        setUrls(lines.join('\n'));
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleShorten = async () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urlList.length === 0) {
      toast({
        title: 'No URLs',
        description: 'Please enter at least one URL to shorten',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await bulkShorten.mutateAsync(urlList);
      setResults(response.results);
      
      toast({
        title: 'Bulk Shortening Complete',
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
      ...results.map(r => [r.original, r.short || '', r.status])
    ].map(row => row.join(',')).join('\n');
    
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

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk URL Shortener
          </div>
          {results.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearResults}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-1">
                {isDragActive ? 'Drop the file here' : 'Drop a file or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .txt and .csv files
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Or paste URLs (one per line)</label>
              <Textarea
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;..."
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={8}
              />
            </div>
            
            <Button 
              onClick={handleShorten} 
              disabled={isLoading || !urls.trim()}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Shorten All URLs'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Results</h3>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
            
            <div className="border rounded-lg max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4" />
                  <p>Results will appear here after processing</p>
                </div>
              ) : (
                <div className="divide-y">
                  {results.map((result, index) => (
                    <div key={index} className="p-3 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{result.original}</p>
                        {result.short ? (
                          <p className="text-xs text-muted-foreground truncate">{result.short}</p>
                        ) : (
                          <p className="text-xs text-destructive">{result.error || 'Failed'}</p>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${result.status === 'success' ? 'bg-green-500' : 'bg-destructive'}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}