'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export function useShortenUrl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      // Validate input data
      if (!data.url) {
        throw new Error('URL is required');
      }

      // Validate URL format
      let formattedUrl = data.url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }

      try {
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
      } catch (error) {
        if (error.message.includes('Custom alias already exists')) {
          throw new Error('Custom alias already exists. Please choose another one.');
        }
        if (error.message.includes('must be logged in')) {
          throw new Error('You must be logged in to use custom alias or password.');
        }
        throw error;
      }
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
        staleTime: 0 
      });

      toast({
        title: 'Success!',
        description: 'Your short URL has been created successfully',
      });
    },
    onError: (error) => {
      console.error('Shorten URL error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create short URL',
        variant: 'destructive',
      });
    },
  });
}