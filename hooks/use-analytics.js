// hooks/use-analytics.js
'use client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const useAnalytics = (urlId, period) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['analytics', urlId, period],
    queryFn: async () => {
      if (!urlId) {
        throw new Error('URL ID is required');
      }

      const res = await fetch(`/api/analytics/${urlId}?period=${period}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to fetch analytics (${res.status})`);
      }
      
      return res.json();
    },
    enabled: !!urlId && !!period,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('Analytics fetch error:', error);
      // Don't show toast for every error to avoid spam
      if (error.message && !error.message.includes('URL ID is required')) {
        // Error is handled by the component
      }
    },
  });
};

export const useAnalyticsExport = (urlId) => {
  return useQuery({
    queryKey: ['analytics-export', urlId],
    queryFn: async () => {
      if (!urlId) {
        throw new Error('URL ID is required');
      }

      const res = await fetch(`/api/analytics/${urlId}/export`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to export analytics');
      }
      
      return res.json();
    },
    enabled: false,
    retry: 1,
  });
};