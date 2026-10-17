'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { QrCode, Download, FileCode2, Save } from 'lucide-react';
import { Sidebar } from '../components/sidebar';
import { Navbar } from '../components/navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useGenerateQR } from '@/hooks/use-qr';

const PRESETS = [
  { name: 'Ink', fg: '#0b1220', bg: '#ffffff' },
  { name: 'Teal', fg: '#0d6e66', bg: '#ecfdf8' },
  { name: 'Midnight', fg: '#e2e8f0', bg: '#0f172a' },
  { name: 'Forest', fg: '#14532d', bg: '#ecfdf5' },
  { name: 'Berry', fg: '#701a75', bg: '#fdf4ff' },
  { name: 'Amber', fg: '#78350f', bg: '#fffbeb' },
];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function QRGeneratorPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const canvasRef = useRef(null);

  const [url, setUrl] = useState('');
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(3);
  const [color, setColor] = useState('#0b1220');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [initials, setInitials] = useState('');
  const [drawError, setDrawError] = useState('');

  const saveQr = useGenerateQR();
  const hasContent = url.trim().length > 0;

  useEffect(() => {
    if (!hasContent || !canvasRef.current) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled || !canvasRef.current) return;
      try {
        await QRCode.toCanvas(canvasRef.current, url.trim(), {
          width: size,
          margin,
          color: { dark: color, light: bgColor },
          errorCorrectionLevel: initials.trim() ? 'H' : errorCorrection,
        });
        if (initials.trim()) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const side = canvas.width;
          const box = Math.round(side * 0.22);
          const cx = side / 2;
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(cx - box / 2, cx - box / 2, box, box, box * 0.18);
          } else {
            ctx.rect(cx - box / 2, cx - box / 2, box, box);
          }
          ctx.fill();
          ctx.lineWidth = Math.max(2, box * 0.06);
          ctx.strokeStyle = color;
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.font = `bold ${Math.round(box * 0.42)}px "Space Grotesk", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials.trim().slice(0, 2).toUpperCase(), cx, cx + box * 0.02);
        }
        setDrawError('');
      } catch {
        if (!cancelled) setDrawError('Could not encode that value — try shorter text.');
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [url, size, margin, color, bgColor, errorCorrection, initials, hasContent]);

  const downloadPng = () => {
    if (!canvasRef.current || !hasContent) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'linksnip-qr.png');
    }, 'image/png');
  };

  const downloadSvg = async () => {
    if (!hasContent) return;
    try {
      let svg = await QRCode.toString(url.trim(), {
        type: 'svg',
        width: size,
        margin,
        color: { dark: color, light: bgColor },
        errorCorrectionLevel: initials.trim() ? 'H' : errorCorrection,
      });
      if (initials.trim()) {
        const vbMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
        const vb = vbMatch ? parseFloat(vbMatch[1]) : size;
        const box = vb * 0.22;
        const cx = vb / 2;
        const overlay = `<rect x="${cx - box / 2}" y="${cx - box / 2}" width="${box}" height="${box}" rx="${box * 0.18}" fill="${bgColor}" stroke="${color}" stroke-width="${Math.max(box * 0.04, 0.5)}"/><text x="${cx}" y="${cx}" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-weight="700" font-size="${box * 0.42}" fill="${color}">${escapeXml(initials.trim().slice(0, 2).toUpperCase())}</text>`;
        svg = svg.replace('</svg>', `${overlay}</svg>`);
      }
      downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'linksnip-qr.svg');
    } catch {
      toast({
        title: 'SVG export failed',
        description: 'Try a shorter value or reload the page.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    saveQr.mutate(
      {
        url: url.trim(),
        size,
        margin,
        color,
        bgColor,
        errorCorrection: initials.trim() ? 'H' : errorCorrection,
      },
      {
        onSuccess: () => {
          toast({ title: 'QR code saved', description: 'Find it in My QR codes.' });
        },
        onError: (err) =>
          toast({ title: 'Save failed', description: err.message, variant: 'destructive' }),
      }
    );
  };

  return (
    <div className="min-h-dvh bg-background">
      {session ? <Sidebar /> : <Navbar />}
      <main className={cn('min-w-0', session ? 'md:pl-72' : 'pt-16')}>
        <div className="space-y-8 p-4 md:p-8">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold tracking-tight">QR Code Studio</h1>
              <p className="text-sm text-muted-foreground">
                Style, preview and export QR codes — no account needed.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Controls */}
              <section className="space-y-5 rounded-lg border bg-card p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="qr-url">URL or text</Label>
                  <Input
                    id="qr-url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setColor(p.fg);
                          setBgColor(p.bg);
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent',
                          color === p.fg && bgColor === p.bg && 'border-primary'
                        )}
                        aria-label={`Use ${p.name} preset`}
                      >
                        <span className="flex h-4 w-4 overflow-hidden rounded-sm border">
                          <span className="w-1/2" style={{ background: p.bg }} />
                          <span className="w-1/2" style={{ background: p.fg }} />
                        </span>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-fg">Foreground</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-fg"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        aria-label="Foreground color"
                        className="h-10 w-12 cursor-pointer rounded-md border bg-background p-1"
                      />
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 flex-1 font-mono text-xs"
                        aria-label="Foreground hex"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-bg">Background</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="qr-bg"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        aria-label="Background color"
                        className="h-10 w-12 cursor-pointer rounded-md border bg-background p-1"
                      />
                      <Input
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 flex-1 font-mono text-xs"
                        aria-label="Background hex"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-size">Size (px)</Label>
                    <Input
                      id="qr-size"
                      type="number"
                      min={128}
                      max={1024}
                      value={size}
                      onChange={(e) =>
                        setSize(Math.min(1024, Math.max(128, parseInt(e.target.value, 10) || 512)))
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-margin">Quiet zone</Label>
                    <Input
                      id="qr-margin"
                      type="number"
                      min={0}
                      max={8}
                      value={margin}
                      onChange={(e) =>
                        setMargin(Math.min(8, Math.max(0, parseInt(e.target.value, 10) || 0)))
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Error correction</Label>
                    <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                      <SelectTrigger className="h-10" disabled={Boolean(initials.trim())}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qr-initials">Center initials</Label>
                    <Input
                      id="qr-initials"
                      placeholder="LS (optional)"
                      maxLength={2}
                      value={initials}
                      onChange={(e) => setInitials(e.target.value)}
                      className="h-10 uppercase"
                    />
                  </div>
                </div>
                {initials.trim() && (
                  <p className="text-xs text-muted-foreground">
                    A logo chip is drawn in the center; error correction is raised to High so scans
                    still work.
                  </p>
                )}
              </section>

              {/* Preview */}
              <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
                <h2 className="font-display text-base font-semibold tracking-tight">Preview</h2>
                <div className="flex flex-1 items-center justify-center rounded-md bg-muted/40 p-6">
                  {hasContent ? (
                    <canvas
                      ref={canvasRef}
                      aria-label="QR code preview"
                      className="h-auto max-w-full rounded-md"
                      style={{ width: 'min(100%, 320px)' }}
                    />
                  ) : (
                    <div className="py-12 text-center">
                      <QrCode className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Enter a URL to see the live preview</p>
                    </div>
                  )}
                </div>
                {drawError && <p className="text-sm text-destructive">{drawError}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={downloadPng} disabled={!hasContent} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    PNG
                  </Button>
                  <Button onClick={downloadSvg} disabled={!hasContent} variant="outline" className="flex-1">
                    <FileCode2 className="mr-2 h-4 w-4" />
                    SVG
                  </Button>
                  {session && (
                    <Button
                      onClick={handleSave}
                      disabled={!hasContent || saveQr.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saveQr.isPending ? 'Saving…' : 'Save'}
                    </Button>
                  )}
                </div>
                {session && (
                  <Link
                    href="/my-qrcodes"
                    className="text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    View saved codes in My QR codes
                  </Link>
                )}
              </section>
            </div>
        </div>
      </main>
    </div>
  );
}
