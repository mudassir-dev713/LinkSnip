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
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalyticsExport = (urlId) => {
  return useQuery({
    queryKey: ['analytics-export', urlId],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/${urlId}/export`);
      if (!res.ok) throw new Error('Failed to export analytics');
      return res.json();
    },
    enabled: false, // manual trigger
  });
};