'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useBulkShorten() {
  const queryClient = useQueryClient();

  // Toasts are owned by the BulkShortener component (it has richer context
  // about totals / truncation), so this hook only fetches + invalidates.
  const bulkShorten = useMutation({
    mutationFn: async (urls) => {
      const res = await fetch('/api/bulk-shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to shorten URLs');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  return { bulkShorten, isLoading: bulkShorten.isPending };
}
