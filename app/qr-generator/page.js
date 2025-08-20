'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { QrCode, Download, Copy, Share2, Palette, Eye } from 'lucide-react';
import { Spotlight } from '../components/ui/spotlight';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Sidebar } from '../components/sidebar';
import { useGenerateQR } from '@/hooks/use-qr';

export default function QRGeneratorPage() {
  const [url, setUrl] = useState('');
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [margin, setMargin] = useState(4);
  const [generatedQR, setGeneratedQR] = useState('');

  const { mutate: generateQR, data, isPending, error } = useGenerateQR();

  console.log(data);
  // Keep generated QR synced with backend result
  useEffect(() => {
    if (data?.qr?.qrDataUrl) {
      setGeneratedQR(data.qr.qrDataUrl);
    }
  }, [data]);

  const handleGenerate = () => {
    generateQR({
      url,
      size: qrSize,
      margin,
      color: qrColor,
      bgColor,
      errorCorrection,
    });
  };

  const downloadQR = () => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.download = 'qr-code.png'; // PNG (most common)
    link.href = generatedQR;
    link.click();
  };

  const copyQRToClipboard = async () => {
    if (!generatedQR) return;

    try {
      const response = await fetch(generatedQR);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex">
        <div className="hidden md:block w-72">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">QR Code Generator</h1>
                <p className="text-muted-foreground">
                  Create custom QR codes for your URLs with advanced styling
                  options
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Generator Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <Spotlight
                className="w-full"
                spotlightColor="rgba(59, 130, 246, 0.15)"
              >
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <QrCode className="h-5 w-5 text-primary" />
                      <span>Generate QR Code</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL or Text</label>
                      <Input
                        placeholder="Enter URL or text to generate QR code"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Size (px)</label>
                        <Input
                          type="number"
                          min="128"
                          max="1024"
                          value={qrSize}
                          onChange={(e) => setQrSize(parseInt(e.target.value))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Margin</label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={margin}
                          onChange={(e) => setMargin(parseInt(e.target.value))}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Foreground Color
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="w-16 h-11 p-1"
                          />
                          <Input
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="flex-1 h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-16 h-11 p-1"
                          />
                          <Input
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="flex-1 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Advanced Options
                      </label>
                      <Switch
                        checked={showAdvanced}
                        onCheckedChange={setShowAdvanced}
                      />
                    </div>

                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Error Correction Level
                          </label>
                          <select
                            value={errorCorrection}
                            onChange={(e) => setErrorCorrection(e.target.value)}
                            className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            <option value="L">Low (7%)</option>
                            <option value="M">Medium (15%)</option>
                            <option value="Q">Quartile (25%)</option>
                            <option value="H">High (30%)</option>
                          </select>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      onClick={handleGenerate}
                      disabled={!url || isPending}
                      className="w-full h-11 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {isPending ? 'Generating...' : 'Generate QR Code'}
                    </Button>

                    {/* Show backend errors */}
                    {error && (
                      <p className="text-red-500 text-sm">
                        {error?.response?.data?.error || error.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Spotlight>
            </motion.div>

            {/* QR Code Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Spotlight
                className="w-full h-full"
                spotlightColor="rgba(139, 92, 246, 0.15)"
              >
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <span>Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data ? (
                      <div className="space-y-4">
                        <div className="flex justify-center p-8 bg-muted/30 rounded-lg">
                          <img
                            src={data.qrCode}
                            alt="QR Code"
                            style={{ width: data.size, height: data.size }}
                            className="max-w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={downloadQR}
                            variant="outline"
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            onClick={copyQRToClipboard}
                            variant="outline"
                            className="w-full"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                          <h4 className="font-medium">QR Code Details</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <strong>URL:</strong> {data.url}
                            </p>
                            <p>
                              <strong>Size:</strong> {data.size}x{data.size}px
                            </p>
                            <p>
                              <strong>Error Correction:</strong>{' '}
                              {data.errorCorrection}
                            </p>
                            <p>
                              <strong>Colors:</strong> {data.color} /{' '}
                              {data.bgColor}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <QrCode className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          No QR Code Generated
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Enter a URL or text and click "Generate QR Code" to
                          see the preview
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Spotlight>
            </motion.div>
          </div>

          {/* QR Code Templates */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Spotlight
              className="w-full"
              spotlightColor="rgba(59, 130, 246, 0.08)"
            >
              <Card className="border-0 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <span>Quick Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Classic', fg: '#000000', bg: '#ffffff' },
                      { name: 'Blue', fg: '#1e40af', bg: '#dbeafe' },
                      { name: 'Green', fg: '#166534', bg: '#dcfce7' },
                      { name: 'Purple', fg: '#7c3aed', bg: '#ede9fe' },
                    ].map((template) => (
                      <Button
                        key={template.name}
                        variant="outline"
                        onClick={() => {
                          setQrColor(template.fg);
                          setBgColor(template.bg);
                        }}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <div
                          className="w-8 h-8 rounded border-2"
                          style={{
                            backgroundColor: template.bg,
                            borderColor: template.fg,
                          }}
                        >
                          <div
                            className="w-full h-full rounded flex items-center justify-center text-xs font-bold"
                            style={{ color: template.fg }}
                          >
                            QR
                          </div>
                        </div>
                        <span className="text-sm">{template.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Spotlight>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
