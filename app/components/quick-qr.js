'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Download,
  Link2,
  Sparkles,
  Images,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL;

const toFullUrl = (value) =>
  value?.startsWith('http') ? value : `${BASE_URL}/${value}`;

/**
 * Quick QR generator for the dashboard: pick one of your links (or paste
 * any URL), generate a QR through the existing /api/qrcode endpoint and
 * download it. Full styling options live in /qr-generator.
 */
export function QuickQr({ urls = [], isLoading }) {
  const [pickedId, setPickedId] = useState('custom');
  const [customUrl, setCustomUrl] = useState('');
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const targetUrl =
    pickedId === 'custom'
      ? customUrl.trim()
      : toFullUrl(urls.find((u) => u._id === pickedId)?.shortUrl || '');

  const generate = async () => {
    setError('');
    if (!targetUrl) {
      setError('Pick a link or paste a URL first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, size: 288 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate the QR code');
      setQr({ src: data.qr.qrCode, url: targetUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="qr-target">Link to encode</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={pickedId}
            onValueChange={(value) => {
              setPickedId(value);
              setQr(null);
              setError('');
            }}
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Choose a link">
              <SelectValue placeholder={isLoading ? 'Loading links…' : 'Your links'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Paste a URL…</SelectItem>
              {urls.map((link) => (
                <SelectItem key={link._id} value={link._id}>
                  {link.title || link.shortUrl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {pickedId === 'custom' ? (
            <Input
              id="qr-target"
              type="url"
              inputMode="url"
              placeholder="https://example.com/page"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setQr(null);
                setError('');
              }}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 truncate rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm text-muted-foreground">
              {targetUrl || '—'}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={generate}
          disabled={generating || !targetUrl}
          className="shadow-lg shadow-primary/15"
        >
          <QrCode className="mr-2 h-4 w-4" />
          {generating ? 'Generating…' : 'Generate QR code'}
        </Button>
        <Link href="/qr-generator">
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Full QR studio
          </Button>
        </Link>
        <Link href="/my-qrcodes">
          <Button variant="ghost">
            <Images className="mr-2 h-4 w-4" />
            My QR codes
          </Button>
        </Link>
      </div>

      {qr ? (
        <div className="flex flex-col items-start gap-4 rounded-md bg-muted/40 p-4 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr.src}
            alt={`QR code for ${qr.url}`}
            width={176}
            height={176}
            className="rounded-md bg-white p-2"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Link2 className="h-4 w-4 shrink-0 text-primary" />
              QR ready
            </p>
            <p className="break-all font-mono text-xs text-muted-foreground">
              {qr.url}
            </p>
            <p className="text-xs text-muted-foreground">
              Saved to your QR library. Scan it with any phone camera.
            </p>
            <a href={qr.src} download="linksnip-qr.png">
              <Button size="sm" variant="outline">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PNG
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center">
          <QrCode className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Generate a QR code for a short link or any URL — then download it
            as a PNG.
          </p>
        </div>
      )}
    </div>
  );
}
