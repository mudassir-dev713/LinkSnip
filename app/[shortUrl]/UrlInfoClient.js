'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Link2, Lock, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const REDIRECT_SECONDS = 2;

const UNAVAILABLE_COPY = {
  expired: 'This link has expired and no longer forwards anywhere.',
  inactive: 'The owner has paused this link, so it is not forwarding right now.',
  'one-time-used': 'This one-time link has already been opened once.',
  'not-scheduled': 'This link is not active yet. Check back after its start time.',
};

function hostnameOf(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
        <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
      </span>
      <span className="font-display text-base font-bold tracking-tight">LinkSnip</span>
    </Link>
  );
}

export default function UrlInfoClient({ urlData }) {
  const [verified, setVerified] = useState(!urlData.hasPassword);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  // Final destination, resolved by the redirect engine (may differ from the
  // base URL when A/B, geo, device or UTM rules apply).
  const [target, setTarget] = useState(urlData.fullUrl);
  const [unavailable, setUnavailable] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const clickLogged = useRef(false);
  // Always-current destination so the countdown tick never reads a stale value.
  const targetRef = useRef(urlData.fullUrl);

  useEffect(() => {
    targetRef.current = target || urlData.fullUrl;
  }, [target, urlData.fullUrl]);

  // Log the click and resolve the actual destination.
  const logClick = async () => {
    if (clickLogged.current) return;
    clickLogged.current = true;
    try {
      const res = await fetch(`/api/redirect/${urlData.shortUrl}`, { method: 'POST' });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success) {
        if (result.redirectUrl) setTarget(result.redirectUrl);
      } else if (result.error) {
        setUnavailable(result.error);
      }
    } catch (err) {
      console.error('Click log error', err);
    }
  };

  // Log the click once, then run a short countdown and forward.
  useEffect(() => {
    if (!(verified && urlData.status === 'active' && !unavailable)) return undefined;
    logClick();
    setSecondsLeft(REDIRECT_SECONDS);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          // replace() keeps the interstitial out of history so Back
          // does not bounce the visitor straight back here.
          window.location.replace(targetRef.current || urlData.fullUrl);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, urlData, unavailable]);

  const goNow = () => window.location.replace(targetRef.current || urlData.fullUrl);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    const res = await fetch(`/api/verify-password/${urlData.shortUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
    });

    const result = await res.json();
    setSubmitLoading(false);

    if (result.success) {
      setTarget(result.fullUrl);
      setVerified(true);
    } else {
      setError(result.error || 'Incorrect password');
    }
  };

  // 🔴 Unavailable
  if (urlData.status !== 'active' || unavailable) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Brand />
          <span className="text-xs text-muted-foreground">short link</span>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5">
              <ShieldAlert className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight">Link unavailable</h1>
              <p className="text-sm text-muted-foreground">
                {UNAVAILABLE_COPY[unavailable] || UNAVAILABLE_COPY.inactive}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="break-all text-sm text-muted-foreground">
                linksnip.app/{urlData.shortUrl}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                Create your own short link
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // 🔒 Password required
  if (!verified && urlData.hasPassword) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Brand />
          <span className="text-xs text-muted-foreground">short link</span>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1.5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border bg-card">
                <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Protected link</h1>
              <p className="text-sm text-muted-foreground">
                This link is password-protected. Enter the password to continue.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                autoFocus
                aria-label="Link password"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button disabled={submitLoading} type="submit" className="w-full">
                {submitLoading ? 'Verifying…' : 'Continue'}
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // ⏩ Redirecting
  const destination = target || urlData.fullUrl;
  const host = hostnameOf(destination);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Brand />
        <span className="text-xs text-muted-foreground">short link</span>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Redirecting you to
            </p>
            <p className="mt-2 font-display text-2xl font-bold tracking-tight break-words">
              {host || 'destination'}
            </p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{destination}</p>
            {urlData.title && (
              <p className="mt-3 border-t pt-3 text-sm">{urlData.title}</p>
            )}

            {/* Progress bar synced to the countdown */}
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ animation: `redirect-progress ${REDIRECT_SECONDS}s linear forwards` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Redirecting in {secondsLeft}s
              </p>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <a href={destination} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    New tab
                  </a>
                </Button>
                <Button size="sm" onClick={goNow}>
                  Go now
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Go back
            </button>
            <span>You&apos;re leaving LinkSnip. We don&apos;t control the destination.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
