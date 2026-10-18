'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ChevronDown,
  Link2,
  FolderClosed,
  Target,
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
import { useShortenUrl } from '@/hooks/useShortenUrl';
import { useFolders } from '@/hooks/useFolders';

const EXPIRY_OPTIONS = [
  { value: 'none', label: 'Never', hours: null },
  { value: '1', label: '1 hour', hours: 1 },
  { value: '24', label: '24 hours', hours: 24 },
  { value: '168', label: '7 days', hours: 168 },
  { value: '720', label: '30 days', hours: 720 },
];

const NO_FOLDER = '__none__';

/**
 * The core "paste a URL, get a short link" form.
 * Used on the landing hero and inside the dashboard. Handles the optional
 * advanced settings (progressively disclosed) and the result panel with
 * copy / visit / QR actions.
 */
export function ShortenForm({ autoFocus = false, onCreated, initialUrl = '' }) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user?.id);
  const { data: foldersData } = useFolders({ enabled: isLoggedIn });
  const folders = foldersData?.folders || [];

  // Never autofocus on small screens — it pops the mobile keyboard on load.
  const [allowAutoFocus] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('none');
  const [folderId, setFolderId] = useState(NO_FOLDER);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const shorten = useShortenUrl();

  // Prefill from the bookmarklet / ?url= deep link.
  useEffect(() => {
    if (initialUrl && !url) {
      setUrl(initialUrl);
      setShowAdvanced(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  // Destination preview with UTM parameters applied.
  const utmPreview = (() => {
    if (!url.trim()) return '';
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
      );
      if (utm.source.trim()) parsed.searchParams.set('utm_source', utm.source.trim());
      if (utm.medium.trim()) parsed.searchParams.set('utm_medium', utm.medium.trim());
      if (utm.campaign.trim()) parsed.searchParams.set('utm_campaign', utm.campaign.trim());
      return parsed.toString();
    } catch {
      return '';
    }
  })();
  const utmActive = Boolean(utm.source.trim() || utm.medium.trim() || utm.campaign.trim());

  const handleShorten = (e) => {
    e?.preventDefault();
    setFieldError('');
    if (!url.trim()) {
      setFieldError('Paste a link to shorten it.');
      return;
    }

    const hours = EXPIRY_OPTIONS.find((o) => o.value === expiry)?.hours;

    shorten.mutate(
      {
        url,
        customAlias: isLoggedIn && customAlias.trim() ? customAlias.trim() : undefined,
        title: title.trim() || undefined,
        password: isLoggedIn && password ? password : undefined,
        tags:
          isLoggedIn && tags.trim()
            ? tags.split(',').map((t) => t.trim()).filter(Boolean)
            : undefined,
        expirationHours: hours || undefined,
        folderId: isLoggedIn && folderId !== NO_FOLDER ? folderId : undefined,
        utmSource: isLoggedIn && utm.source.trim() ? utm.source.trim() : undefined,
        utmMedium: isLoggedIn && utm.medium.trim() ? utm.medium.trim() : undefined,
        utmCampaign: isLoggedIn && utm.campaign.trim() ? utm.campaign.trim() : undefined,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setUrl('');
          setCustomAlias('');
          setTitle('');
          setTags('');
          setPassword('');
          setUtm((u) => ({ source: '', medium: '', campaign: '', _open: u._open }));
          setQr(null);
          onCreated?.(data);
        },
        onError: (err) => setFieldError(err.message),
      }
    );
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showQr = async () => {
    if (qr) {
      setQr(null);
      return;
    }
    setQrLoading(true);
    try {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result.shortUrl, size: 200 }),
      });
      const data = await res.json();
      if (res.ok) setQr(data.qr?.qrCode);
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleShorten} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              autoFocus={autoFocus && allowAutoFocus}
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="Paste your long URL…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (fieldError) setFieldError('');
              }}
              aria-label="URL to shorten"
              aria-invalid={Boolean(fieldError)}
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={!url.trim() || shorten.isPending}
            className="h-12 px-8 shadow-lg shadow-primary/20"
          >
            {shorten.isPending ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Shorten <Plus className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {fieldError && (
          <p className="text-sm text-destructive" role="alert">
            {fieldError}
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowAdvanced((p) => !p)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
          />
          {showAdvanced ? 'Hide options' : 'Custom alias, tags, password…'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md bg-muted/50">
            <div className="space-y-1.5">
              <Label htmlFor="sf-alias">Custom alias</Label>
              <Input
                id="sf-alias"
                placeholder="e.g. summer-sale"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                disabled={shorten.isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sf-title">Title</Label>
              <Input
                id="sf-title"
                placeholder="For your dashboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={shorten.isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sf-tags">Tags</Label>
              <Input
                id="sf-tags"
                placeholder="marketing, q3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={shorten.isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expires in</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoggedIn && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <FolderClosed className="h-3.5 w-3.5" />
                  Folder
                </Label>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_FOLDER}>Unfiled</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f._id} value={f._id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sf-password">Password protection</Label>
              <Input
                id="sf-password"
                type="password"
                placeholder="Leave empty for no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={shorten.isPending}
                className="h-10"
              />
            </div>

            {/* UTM builder */}
            {isLoggedIn && (
              <div className="space-y-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setUtm((u) => ({ ...u, _open: !u._open }))}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-expanded={Boolean(utm._open)}
                >
                  <Target className="h-3.5 w-3.5" />
                  {utm._open ? 'Hide campaign (UTM) fields' : 'Add campaign (UTM) tags'}
                </button>
                {utm._open && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="utm-source">Source</Label>
                        <Input
                          id="utm-source"
                          placeholder="newsletter"
                          value={utm.source}
                          onChange={(e) => setUtm({ ...utm, source: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="utm-medium">Medium</Label>
                        <Input
                          id="utm-medium"
                          placeholder="email"
                          value={utm.medium}
                          onChange={(e) => setUtm({ ...utm, medium: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="utm-campaign">Campaign</Label>
                        <Input
                          id="utm-campaign"
                          placeholder="spring-sale"
                          value={utm.campaign}
                          onChange={(e) => setUtm({ ...utm, campaign: e.target.value })}
                          className="h-10"
                        />
                      </div>
                    </div>
                    {utmActive && utmPreview && (
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        Destination → {utmPreview}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {!isLoggedIn && (
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Custom aliases, tags and passwords need an account.{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up free
                </Link>
              </p>
            )}
          </div>
        )}
      </form>

      {result && (
        <div className="rounded-md bg-primary/5 p-4 space-y-3" role="status">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <code className="min-w-0 flex-1 break-all font-mono text-sm font-medium text-primary">
              {result.shortUrl}
            </code>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={copyResult}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1 text-primary" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button size="sm" variant="outline" onClick={showQr}>
                <QrCode className="h-3.5 w-3.5 mr-1" />
                {qrLoading ? '…' : 'QR'}
              </Button>
              <a href={result.shortUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Visit
                </Button>
              </a>
            </div>
          </div>
          {qr && (
            <div className="flex justify-center pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="QR code for the shortened URL"
                width={180}
                height={180}
                className="rounded-md bg-white p-2"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
