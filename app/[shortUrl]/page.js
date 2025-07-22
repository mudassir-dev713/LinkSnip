'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Spotlight } from '../components/ui/spotlight';
import { Link2 } from 'lucide-react';
import Link from 'next/link';

async function generateMetadata({ params }) {
  return {
    title: `Redirecting | ${params.shortUrl}`,
  };
}

export default function UrlInfoPage({ params }) {
  const [urlData, setUrlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    const res = await fetch(`/api/url-info/${params.shortUrl}`);
    const data = await res.json();
    if (res.ok) setUrlData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (
      urlData &&
      urlData.status == 'active' &&
      !urlData.password &&
      verified
    ) {
      const timer = setTimeout(() => {
        window.location.href = urlData.fullUrl;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [urlData, verified]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch(`/api/verify-password/${params.shortUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
    });

    const result = await res.json();

    if (result.success) {
      setVerified(true);
      console.log('Password verified successfully:', result);
      // Optionally redirect immediately
      setTimeout(() => {
        window.location.href = result.fullUrl;
      }, 3000);
    } else {
      setError(result.error || 'Incorrect password');
    }
  };
  const logClick = async () => {
    try {
      await fetch(`/api/redirect/${params.shortUrl}`, {
        method: 'POST',
      });
      console.log('Click logged');
    } catch (err) {
      console.error('Click log error', err);
    }
  };

  useEffect(() => {
    if (!urlData || urlData.status !== 'active') return;
    if (urlData.password && !verified) return;

    logClick();

    const timer = setTimeout(() => {
      window.location.href = urlData.fullUrl;
    }, 4000);

    return () => clearTimeout(timer);
  }, [urlData, verified]);

  if (loading)
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
              <CardHeader></CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-muted-foreground">
                    Fetching link details...
                  </span>
                </div>
              </CardContent>
            </Card>
          </Spotlight>
        </div>
      </div>
    );
  if (!urlData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-5">
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
                <CardTitle>URL Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This short link does not exist or has been removed.
                </p>
              </CardContent>
            </Card>
          </Spotlight>
        </div>
      </div>
    );
  if (urlData.status !== 'active') {
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
                <CardTitle className="text-destructive">
                  Link is Inactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This link has been disabled by the owner.
                </p>
              </CardContent>
            </Card>
          </Spotlight>
        </div>
      </div>
    );
  }
  if (urlData.password && !verified) {
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
                  <Button type="submit" className="w-full">
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
              </div>
            </CardContent>
          </Card>
        </Spotlight>
      </div>
    </div>
  );
}
