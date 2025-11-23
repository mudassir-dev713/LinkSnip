import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGenerateQR() {
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate QR code');
      return json.qr;
    },
  });
}

export function useQRCodes() {
  return useQuery({
    queryKey: ['qrcodes'],
    queryFn: async () => {
      const res = await fetch('/api/allqrcode');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch QR codes');
      return json.qr; // expects { qr: [...] }
    },
  });
}

export function useDeleteQRCode() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch('/api/delete-qr', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete QR code');
      return json;
    },
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: ['qrcodes'] });
      const previous = client.getQueryData(['qrcodes']);
      client.setQueryData(
        ['qrcodes'],
        (old) => old?.filter((qr) => qr._id !== id) || []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        client.setQueryData(['qrcodes'], context.previous);
      }
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['qrcodes'] });
    },
  });
}

export function useBulkDeleteQRCodes() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      const res = await fetch('/api/delete-many-qr', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || 'Failed to bulk delete QR codes');
      return json;
    },
    onMutate: async (ids) => {
      await client.cancelQueries({ queryKey: ['qrcodes'] });
      const previous = client.getQueryData(['qrcodes']);
      client.setQueryData(
        ['qrcodes'],
        (old) => old?.filter((qr) => !ids.includes(qr._id)) || []
      );
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        client.setQueryData(['qrcodes'], context.previous);
      }
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['qrcodes'] });
    },
  });
}
