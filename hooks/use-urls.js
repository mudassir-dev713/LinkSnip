'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

// ✅ Fetch URLs from API
const fetchUrls = async () => {
  const res = await fetch('/api/get-urls');
  if (!res.ok) throw new Error('Failed to fetch URLs');
  return res.json();
};

export const useUrls = () => {
  return useQuery({
    queryKey: ['urls'],
    queryFn: fetchUrls,
    staleTime: 1000 * 60 * 20, // 20 min cache
    retry: 1,
  });
};

// ✅ Add new URL (mutation + invalidate cache)
export const useAddUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUrlData) => {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUrlData),
      });
      if (!res.ok) throw new Error('Failed to shorten URL');
      return res.json();
    },
    onSuccess: (data) => {
      // Optimistically update cache instead of refetch
      queryClient.setQueryData(['urls'], (old) =>
        old ? { urls: [data, ...old.urls] } : { urls: [data] }
      );
    },
  });
};

export const useDeleteUrls = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids) => {
      const res = await fetch('/api/delete-url', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [ids] }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to delete URLs');
      }
      return res.json(); // { ids: [...] }
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
    },

    onSuccess: (data) => {
      queryClient.setQueryData(['urls'], (oldData) => {
        if (!oldData?.urls) return oldData;
        return {
          ...oldData,
          urls: oldData.urls.filter((url) => !data.ids.includes(url._id)),
        };
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
    },
  });
};

export const useDeleteUrl = () => {
  const deleteUrls = useDeleteUrls();

  return useMutation({
    mutationFn: async (id) => {
      return deleteUrls.mutateAsync([id]);
    },
    onSuccess: deleteUrls.onSuccess,
    onError: deleteUrls.onError,
  });
};

export function useUpdateUrlStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const res = await fetch('/api/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      return { id, newStatus };
    },
    //  optimistic update
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries(['urls']);

      const prevData = queryClient.getQueryData(['urls']);

      queryClient.setQueryData(['urls'], (old) => {
        if (!old) return old;
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
      // rollback
      queryClient.setQueryData(['urls'], context.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['urls']);
    },
  });
}
export function useUpdateLink() {
  const queryClient = useQueryClient();
  const [formErrors, setFormErrors] = useState({});

  const mutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/edit/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        // handle validation errors
        if (json.errors) {
          setFormErrors(json.errors);
        }
        throw new Error(json.error || 'Failed to update link');
      }

      setFormErrors({});
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['links']);
    },
  });

  return { ...mutation, formErrors };
}
