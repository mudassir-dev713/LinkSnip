'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/app/components/ui/Loader';

function CheckEmailContent() {
  const [pollingStopped, setPollingStopped] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) return;

    const startTime = Date.now();

    const interval = setInterval(async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= 60000) {
        clearInterval(interval);
        setPollingStopped(true);
        return;
      }

      try {
        const res = await fetch(`/api/check-verification?email=${email}`);
        const data = await res.json();
        if (data.verified) {
          clearInterval(interval);
          router.push('/login');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [email, router]);

  return (
    <div className="hero-glow flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md border shadow-xl shadow-primary/5">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pb-8 text-center">
          <p className="text-pretty text-sm text-muted-foreground">
            We sent a verification link to{' '}
            <span className="font-medium text-foreground">
              {email || 'your email'}
            </span>
            . Click it to activate your account.
          </p>

          {pollingStopped ? (
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
              We didn&apos;t detect a verification yet. Check your inbox and
              spam folder, then continue.
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Waiting for verification — you&apos;ll be redirected automatically.
            </div>
          )}

          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            className="w-full"
          >
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<Loader className="min-h-dvh" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
