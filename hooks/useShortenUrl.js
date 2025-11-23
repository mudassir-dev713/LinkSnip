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

      // normalize response (remove message)
      const { message, ...urlData } = json;
      return urlData;
    },
    onSuccess: (urlData) => {
      queryClient.setQueryData(['urls'], (old) => {
        if (!old) return { urls: [urlData] };
        return { urls: [urlData, ...old.urls] };
      });

      // background revalidation to stay in sync
      queryClient.invalidateQueries(['urls'], { refetchType: 'inactive' });
    },
  });
}
