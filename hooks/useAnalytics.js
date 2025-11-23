// hooks/use-analytics.js
'use client';
import { useQuery } from '@tanstack/react-query';

export const useAnalytics = (urlId, period) => {
  return useQuery({
    queryKey: ['analytics', urlId, period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/${urlId}?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!urlId, // don't fetch until a URL is selected
    refetchOnWindowFocus: false,
  });
};