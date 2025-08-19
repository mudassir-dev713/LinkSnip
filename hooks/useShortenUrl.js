'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useShortenUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to shorten URL');
      return json;
    },
    onSuccess: (data) => {
      // Update local cache of urls if you have one
      queryClient.invalidateQueries(['urls']);
    },
  });
}
