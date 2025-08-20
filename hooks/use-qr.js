import { useMutation } from '@tanstack/react-query';

export function useGenerateQR() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate QR code');

      return json.qr;
    },
  });
}
