'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Link, Download, X, Table, Check, X as XIcon } from 'lucide-react';
import { useBulkShorten } from '@/hooks/useBulkShorten';

export function BulkShortener() {
  const [urls, setUrls] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
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
        parseUrlsForPreview(lines);
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

  const parseUrlsForPreview = (urlLines) => {
    const parsed = urlLines
      .map((url, index) => {
        const trimmed = url.trim();
        return {
          id: index,
          original: trimmed,
          isValid: trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://')),
          short: null,
          status: 'pending'
        };
      })
      .filter(item => item.original.length > 0);

    setPreviewData(parsed);
  };

  const handleUrlChange = (e) => {
    const newUrls = e.target.value;
    setUrls(newUrls);
    
    if (newUrls.trim()) {
      const lines = newUrls.split('\n').filter(line => line.trim() !== '');
      parseUrlsForPreview(lines);
    } else {
      setPreviewData([]);
    }
  };

  const handleShorten = async () => {
    const urlList = previewData
      .filter(item => item.isValid)
      .map(item => item.original);

    if (urlList.length === 0) {
      toast({
        title: 'No valid URLs',
        description: 'Please enter valid URLs starting with http:// or https://',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await bulkShorten.mutateAsync(urlList);
      const updatedResults = response.results.map((result, index) => ({
        ...result,
        id: index,
        status: result.status === 'success' ? 'completed' : 'error'
      }));
      
      setPreviewData(updatedResults);
      setShowResults(true);
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
      ...previewData.map(r => [r.original, r.short || '', r.status])
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
    setPreviewData([]);
    setUrls('');
    setShowResults(false);
    setShowPreview(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk URL Shortener
          </div>
          {(showResults || showPreview) && (
            <Button variant="ghost" size="icon" onClick={clearResults}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* File Upload Area */}
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
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
            
            {/* Manual Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Or paste URLs (one per line)</label>
              <Textarea
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;..."
                value={urls}
                onChange={handleUrlChange}
                rows={8}
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPreview(true)}
                disabled={previewData.length === 0}
                className="flex-1"
              >
                <Table className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={handleShorten} 
                disabled={isLoading || previewData.filter(p => p.isValid).length === 0}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Shorten All'}
              </Button>
            </div>
          </div>
          
          {/* Results/Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {showResults ? 'Results' : showPreview ? 'Preview' : 'Summary'}
              </h3>
              {showResults && (
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
            
            <div className="border rounded-lg max-h-80 overflow-y-auto">
              {previewData.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Link className="h-12 w-12 mx-auto mb-4" />
                  <p>Enter URLs above to see preview</p>
                </div>
              ) : (
                <div className="divide-y">
                  {previewData.map((result, index) => (
                    <div key={result.id || index} className="p-3 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{result.original}</p>
                        {result.short && (
                          <p className="text-xs text-muted-foreground truncate">{result.short}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {showResults && (
                          <div className={`w-3 h-3 rounded-full ${
                            result.status === 'completed' ? 'bg-green-500' : 'bg-destructive'
                          }`} />
                        )}
                        {showPreview && !showResults && (
                          <div className={`w-3 h-3 rounded-full ${
                            result.isValid ? 'bg-green-500' : 'bg-destructive'
                          }`} />
                        )}
                        {result.short && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-medium">{previewData.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid:</span>
                  <span className="ml-2 font-medium text-green-500">
                    {previewData.filter(p => p.isValid).length}
                  </span>
                </div>
                {showResults && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Success:</span>
                      <span className="ml-2 font-medium text-green-500">
                        {previewData.filter(p => p.status === 'completed').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <span className="ml-2 font-medium text-destructive">
                        {previewData.filter(p => p.status === 'error').length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}