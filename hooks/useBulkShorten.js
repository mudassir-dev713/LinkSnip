'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useBulkShorten() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onSuccess: (data) => {
      queryClient.invalidateQueries(['urls']);
      toast({
        title: 'Success',
        description: `Processed ${data.results.length} URLs`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { bulkShorten };
}