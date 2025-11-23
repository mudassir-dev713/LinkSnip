'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');

  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState(null);
  const [color, setColor] = useState('text-white');

  useEffect(() => {
    if (status === 'success') {
      setMessage('Email verified successfully! Redirecting to login...');
      setIcon(<CheckCircle className="w-12 h-12 text-green-400 mb-4" />);
      setColor('text-green-400');
      setTimeout(() => {
        router.push('/login');
      }, 4000);
    } else if (status === 'expired') {
      setMessage('The verification link has expired or is invalid.');
      setIcon(<XCircle className="w-12 h-12 text-red-400 mb-4" />);
      setColor('text-red-400');
    } else {
      setMessage('Verifying...');
      setIcon(
        <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-4" />
      );
      setColor('text-blue-400');
    }
  }, [status, router]);

  return (
    <div className="flex items-center text-center justify-center min-h-screen bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        {icon}
        <h1 className={`text-2xl font-semibold mb-2 ${color}`}>
          Email Verification
        </h1>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
