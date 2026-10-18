'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/app/components/ui/Loader';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');

  const isSuccess = status === 'success';
  const isExpired = status === 'expired';

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => router.push('/login'), 4000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, router]);

  return (
    <div className="hero-glow flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md border shadow-xl shadow-primary/5">
        <CardHeader className="space-y-3 text-center">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg ${
              isExpired ? 'bg-destructive/10' : 'bg-primary/10'
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-6 w-6 text-primary" />
            ) : isExpired ? (
              <XCircle className="h-6 w-6 text-destructive" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            {isSuccess
              ? 'Email verified'
              : isExpired
                ? 'Link expired'
                : 'Verifying your email'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pb-8 text-center">
          <p className="text-pretty text-sm text-muted-foreground">
            {isSuccess
              ? 'Your account is active. Redirecting you to sign in…'
              : isExpired
                ? 'This verification link has expired or was already used. Sign in to request a new one.'
                : 'Hang tight while we confirm your address.'}
          </p>

          {isExpired && (
            <Button
              onClick={() => router.push('/login')}
              className="w-full shadow-lg shadow-primary/15"
            >
              Go to sign in
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loader className="min-h-dvh" />}>
      <VerifyPageContent />
    </Suspense>
  );
}
