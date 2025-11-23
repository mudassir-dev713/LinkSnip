'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useDomains() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const res = await fetch('/api/domains');
      if (!res.ok) throw new Error('Failed to fetch domains');
      return res.json();
    },
  });

  const addDomain = useMutation({
    mutationFn: async (domain) => {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add domain');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['domains']);
      toast({
        title: 'Success',
        description: 'Domain added successfully',
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

  const verifyDomain = useMutation({
    mutationFn: async (domainId) => {
      const res = await fetch('/api/domains', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, action: 'verify' }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to verify domain');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['domains']);
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Domain verified successfully',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Please check your DNS settings',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteDomain = useMutation({
    mutationFn: async (domainId) => {
      const res = await fetch('/api/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete domain');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['domains']);
      toast({
        title: 'Success',
        description: 'Domain deleted successfully',
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

  return {
    domains: data?.domains || [],
    isLoading,
    isError,
    refetch,
    addDomain,
    verifyDomain,
    deleteDomain,
  };
}