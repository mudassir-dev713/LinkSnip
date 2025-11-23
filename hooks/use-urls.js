'use client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';
import {useQueryClient,useMutation} from "@tanstack/react-query"

// ✅ Fetch URLs from API
const fetchUrls = async () => {
  const res = await fetch('/api/get-urls');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch URLs');
  }
  return res.json();
};

export const useUrls = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['urls'],
    queryFn: fetchUrls,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('URLs fetch error:', error);
      // Only show toast for network errors, not auth errors
      if (error.message && !error.message.includes('User not Found')) {
        toast({
          title: 'Error',
          description: 'Failed to load your URLs. Please refresh the page.',
          variant: 'destructive',
        });
      }
    },
  });
};

// ✅ Add new URL (mutation + invalidate cache)
export const useAddUrl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newUrlData) => {
      if (!newUrlData.url) {
        throw new Error('URL is required');
      }

      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUrlData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.setQueryData(['urls'], (old) => {
        if (!old?.urls) return { urls: [data] };
        return { urls: [data, ...old.urls] };
      });

      toast({
        title: 'Success!',
        description: 'Short URL created successfully',
      });
    },
    onError: (error) => {
      console.error('Add URL error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create short URL',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteUrls = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids) => {
      const res = await fetch('/api/delete-url', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [ids] }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete URLs');
      }
      
      return res.json();
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['urls'] });
      const previousData = queryClient.getQueryData(['urls']);

      queryClient.setQueryData(['urls'], (oldData) => {
        if (!oldData?.urls) return oldData;
        const idsArray = Array.isArray(ids) ? ids : [ids];
        return {
          ...oldData,
          urls: oldData.urls.filter((url) => !idsArray.includes(url._id)),
        };
      });

      return { previousData };
    },
    onError: (err, ids, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['urls'], context.previousData);
      }
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete URLs',
        variant: 'destructive',
      });
    },
    onSuccess: (data, ids) => {
      const count = Array.isArray(ids) ? ids.length : 1;
      toast({
        title: 'Deleted',
        description: `${count} URL${count > 1 ? 's' : ''} deleted successfully`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['urls']);
    },
  });
};

export const useUpdateUrlStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const res = await fetch('/api/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update status');
      }
      
      return { id, newStatus };
    },
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries(['urls']);
      const prevData = queryClient.getQueryData(['urls']);

      queryClient.setQueryData(['urls'], (old) => {
        if (!old?.urls) return old;
        return {
          ...old,
          urls: old.urls.map((url) =>
            url._id === id ? { ...url, status: newStatus } : url
          ),
        };
      });

      return { prevData };
    },
    onError: (err, variables, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(['urls'], context.prevData);
      }
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['urls']);
    },
  });
};