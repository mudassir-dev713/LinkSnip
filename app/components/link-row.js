'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Copy, Check, BarChart3, Pencil, ExternalLink, QrCode, Download } from 'lucide-react';
import { EditLinkSheet } from './edit-link-sheet';

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL;

const fullShortUrl = (link) =>
  link.shortUrl?.startsWith('http')
    ? link.shortUrl
    : `${BASE_URL}/${link.shortUrl}`;

/**
 * One row in a links list, laid out like a table record: identity on the
 * left (short URL + destination + badges), clicks/date in a right-aligned
 * meta column, actions at the end. Borderless — the surrounding container
 * supplies the surface and row dividers. Clicking the row opens the edit
 * panel; copy + QR stay always visible, the rest on hover (sm+).
 */
export function LinkRow({ link }) {
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrPending, setQrPending] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullShortUrl(link));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onQrOpenChange = async (next) => {
    setQrOpen(next);
    if (!next || qrDataUrl || qrPending) return;
    setQrPending(true);
    try {
      const url = await QRCode.toDataURL(fullShortUrl(link), {
        width: 320,
        margin: 2,
        color: { dark: '#0b1220', light: '#ffffff' },
      });
      setQrDataUrl(url);
    } catch {
      setQrOpen(false);
    } finally {
      setQrPending(false);
    }
  };

  const downloadQr = (e) => {
    e.stopPropagation();
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${link.shortUrl}-qr.png`;
    a.click();
  };

  const inactive = link.status === 'inactive';

  return (
    <>
    <div
      className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5"
      onClick={() => setEditOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditOpen(true);
        }
      }}
      aria-label={`Edit ${link.shortUrl}`}
    >
      {/* Identity */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="max-w-full truncate text-sm font-medium text-primary sm:max-w-xs">
            {fullShortUrl(link).replace(/^https?:\/\//, '')}
          </span>
          {inactive && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Paused
            </Badge>
          )}
          {link.expiresAt && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Expires
            </Badge>
          )}
          {link.hasPassword && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Protected
            </Badge>
          )}
          {(link.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="shrink-0 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="truncate text-xs text-muted-foreground" title={link.fullUrl}>
          {link.fullUrl}
        </p>
      </div>

      {/* Meta — right-aligned, reads as table columns */}
      <div className="hidden w-28 shrink-0 flex-col items-end text-right text-xs tabular-nums text-muted-foreground sm:flex">
        <span>{link.clicks?.toLocaleString() || 0} clicks</span>
        <span>{new Date(link.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Actions — copy + QR + edit always; analytics/open on hover/focus */}
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={copy}
          title="Copy short URL"
          aria-label="Copy short URL"
          className="h-9 w-9"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Popover open={qrOpen} onOpenChange={onQrOpenChange}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              title="QR code"
              aria-label="Show QR code"
              className="h-9 w-9"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {qrDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${link.shortUrl}`}
                  className="mx-auto h-40 w-40 rounded-md"
                  width={320}
                  height={320}
                />
                <Button size="sm" variant="outline" className="w-full" onClick={downloadQr}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download PNG
                </Button>
              </>
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">
                {qrPending ? 'Generating…' : 'QR unavailable'}
              </p>
            )}
          </PopoverContent>
        </Popover>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setEditOpen(true);
          }}
          title="Edit link"
          aria-label="Edit link"
          className="h-9 w-9"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <div className="hidden items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 sm:flex">
          <Link
            href={`/dashboard/analytics?link=${link._id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              title="Analytics"
              aria-label="View analytics"
              className="h-9 w-9"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>
          <a href={fullShortUrl(link)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              title="Open"
              aria-label="Open link"
              className="h-9 w-9"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>

    <EditLinkSheet link={link} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
