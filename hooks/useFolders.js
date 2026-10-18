'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

const fetchFolders = async () => {
  const res = await fetch('/api/folders');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load folders');
  }
  return res.json();
};

export function useFolders({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['folders'],
    queryFn: fetchFolders,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useFolderMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['folders'] });

  const createFolder = useMutation({
    mutationFn: async (name) => {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create folder');
      return data.folder;
    },
    onSuccess: (folder) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      toast({ title: 'Folder created', description: `“${folder.name}” is ready to use.` });
    },
    onError: (err) =>
      toast({ title: 'Could not create folder', description: err.message, variant: 'destructive' }),
  });

  const renameFolder = useMutation({
    mutationFn: async ({ id, name }) => {
      const res = await fetch('/api/folders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rename folder');
      return data.folder;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Folder renamed' });
    },
    onError: (err) =>
      toast({ title: 'Could not rename folder', description: err.message, variant: 'destructive' }),
  });

  const deleteFolder = useMutation({
    mutationFn: async (id) => {
      const res = await fetch('/api/folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete folder');
      return data;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      toast({ title: 'Folder deleted', description: 'Its links moved to Unfiled.' });
    },
    onError: (err) =>
      toast({ title: 'Could not delete folder', description: err.message, variant: 'destructive' }),
  });

  return { createFolder, renameFolder, deleteFolder };
}
