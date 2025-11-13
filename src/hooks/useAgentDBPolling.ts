// src/hooks/useAgentDBPolling.ts
// React hook for polling-based data updates via HTTP API

import { useState, useEffect, useRef, useCallback } from 'react';

export interface DashboardData {
  lineChartData: Array<{ timestamp: string; value: number }>;
  barChartData: Array<{ category: string; count: number }>;
  pieChartData: Array<{ category: string; count: number }>;
  totalEvents: number;
  lastUpdated: string;
}

interface ApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
  timestamp: string;
}

interface UseAgentDBPollingOptions {
  url: string;
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Custom React hook for polling-based AgentDB data via HTTP API
 *
 * Automatically handles:
 * - Periodic data fetching
 * - Error handling
 * - Loading states
 * - Cleanup on unmount
 */
export function useAgentDBPolling(options: UseAgentDBPollingOptions) {
  const {
    url,
    interval = 3000,
    enabled = true,
    onError,
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current || fetchingRef.current || !enabled) return;

    fetchingRef.current = true;

    try {
      console.log('[Polling Hook] Fetching data from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!mountedRef.current) return;

      if (result.success && result.data) {
        setData(result.data);
        setError(null);
        setLastFetch(new Date());
        console.log('[Polling Hook] Data updated successfully');
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Polling Hook] Fetch error:', errorMessage);
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [url, enabled, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Setup polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);

    console.log(`[Polling Hook] Started polling every ${interval}ms`);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('[Polling Hook] Stopped polling');
      }
    };
  }, [interval, enabled, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
  };
}
