'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function CheckEmailContent() {
  const [isVerified, setIsVerified] = useState(false);
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
          setIsVerified(true);
          router.push('/login');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [email, router]);

  const handleLoginClick = () => router.push('/login');

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold text-green-400 mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-300 mb-4">
          We’ve sent a verification link to{' '}
          <strong>{email || 'your email'}</strong>.
        </p>
        {pollingStopped ? (
          <p className="text-yellow-400 mb-6">
            Link not clicked within 1 minute. Please verify and click the button
            below.
          </p>
        ) : (
          <p className="text-gray-400 mb-6">
            Waiting for verification... you’ll be redirected once verified.
          </p>
        )}
        <Button
          onClick={handleLoginClick}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}

// ✅ Wrap content in Suspense
export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={<div className="text-white text-center p-10">Loading...</div>}
    >
      <CheckEmailContent />
    </Suspense>
  );
}
