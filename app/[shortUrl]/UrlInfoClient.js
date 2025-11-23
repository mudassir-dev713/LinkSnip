'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { Spotlight } from '../components/ui/spotlight';

export default function UrlInfoClient({ urlData }) {
  const [verified, setVerified] = useState(!urlData.password);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // ✅ Log click separately
  const logClick = async () => {
    try {
      await fetch(`/api/redirect/${urlData.shortUrl}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Click log error', err);
    }
  };

  // ✅ Redirect after password verification
  useEffect(() => {
    if (verified && urlData.status === 'active') {
      // log click immediately
      logClick();

      const timer = setTimeout(() => {
        window.location.href = urlData.fullUrl;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [verified, urlData]);

  // ✅ Handle password submit
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
      setVerified(true);
    } else {
      setError(result.error || 'Incorrect password');
    }
  };

  // 🔴 Inactive link
  if (urlData.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Link is Inactive</CardTitle>
          </CardHeader>
          <CardContent>This link has been disabled by the owner.</CardContent>
        </Card>
      </div>
    );
  }

  // 🔒 Password required
  if (!verified && urlData.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Link2 className="h-7 w-7 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                LinkSnip
              </span>
            </Link>
            <span className="text-xs text-muted-foreground mt-1">
              URL Shortener
            </span>
          </div>
          <Spotlight className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Password Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This link is protected. Please enter the password to continue.
                </p>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    autoFocus
                  />
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <Button
                    disabled={submitLoading}
                    type="submit"
                    className="w-full"
                  >
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Spotlight>
        </div>
      </div>
    );
  }

  //
  // Redirecting state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Link2 className="h-7 w-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">LinkSnip</span>
          </Link>
          <span className="text-xs text-muted-foreground mt-1">
            URL Shortener
          </span>
        </div>
        <Spotlight className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary text-center">
                Redirecting...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-2">
                <span className="text-muted-foreground">
                  You are being redirected to:
                </span>
                <a
                  href={urlData.fullUrl}
                  className="mt-1 text-lg text-primary underline break-all hover:text-primary/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {urlData.fullUrl}
                </a>
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  <div>Title: {urlData.title || 'Untitled'}</div>
                  <div>
                    Created:{' '}
                    {urlData.createdAt
                      ? new Date(urlData.createdAt).toLocaleString()
                      : ''}
                  </div>
                </div>
                <div className="mt-8 text-muted-foreground text-xs">
                  You’ll be redirected in a few seconds...
                </div>

                {/* 🚀 Redirect Now Button */}
                <Button
                  className="mt-4 w-full"
                  onClick={() => (window.location.href = urlData.fullUrl)}
                >
                  Redirect Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </Spotlight>
      </div>
    </div>
  );
}
