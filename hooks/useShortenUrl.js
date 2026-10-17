'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

/**
 * Shared URL-shortening mutation.
 *
 * Accepts optional per-call callbacks so pages can react (show result card,
 * reset form) without each page reimplementing fetch/error handling:
 *   const m = useShortenUrl();
 *   m.mutate(payload, { onSuccess, onError });
 */
export function useShortenUrl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      if (!data?.url) {
        throw new Error('URL is required');
      }

      // Validate URL format
      let formattedUrl = data.url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          url: formattedUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to shorten URL');
      }
      return json;
    },
    onSuccess: (urlData) => {
      // Optimistically update cache
      queryClient.setQueryData(['urls'], (old) => {
        if (!old?.urls) return { urls: [urlData] };
        return { urls: [urlData, ...old.urls] };
      });

      // Background refetch to ensure data consistency
      queryClient.invalidateQueries(['urls'], {
        refetchType: 'inactive',
        staleTime: 0,
      });

      toast({
        title: 'Success!',
        description: 'Your short URL has been created',
      });
    },
    onError: (error) => {
      console.error('Shorten URL error:', error);
      toast({
        title: 'Couldn’t shorten that URL',
        description: error.message || 'Please check the URL and try again.',
        variant: 'destructive',
      });
    },
  });
}
