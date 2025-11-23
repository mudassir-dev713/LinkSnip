'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useRetargeting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveRules = useMutation({
    mutationFn: async ({ linkId, rules }) => {
      const res = await fetch('/api/link-retargeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, rules }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save retargeting rules');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['urls']);
      toast({
        title: 'Success',
        description: 'Retargeting rules saved successfully',
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

  const deleteRules = useMutation({
    mutationFn: async (linkId) => {
      const res = await fetch('/api/link-retargeting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete retargeting rules');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['urls']);
      toast({
        title: 'Success',
        description: 'Retargeting rules deleted successfully',
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

  return { saveRules, deleteRules };
}