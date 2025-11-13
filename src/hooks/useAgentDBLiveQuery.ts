// src/hooks/useAgentDBLiveQuery.ts

import { useState, useEffect, useRef } from 'react';
import { AgentDB, LiveQuery, AgentDBError } from '@agentdb/client';

/**
 * Options for the useAgentDBLiveQuery hook.
 */
interface UseAgentDBLiveQueryOptions<T> {
  defaultValue?: T; // Optional default value to return before data is loaded
  onError?: (error: AgentDBError) => void; // Callback for error handling
}

/**
 * A custom React hook for subscribing to live data updates from AgentDB.
 *
 * This hook manages the lifecycle of an AgentDB LiveQuery, providing real-time
 * data, loading state, and error handling. It automatically unsubscribes
 * when the component unmounts.
 *
 * @template T - The expected type of the data returned by the AgentDB query.
 * @param {AgentDB} client - An instance of the AgentDB client.
 * @param {string} path - The AgentDB path to subscribe to (e.g., "data/dashboard").
 * @param {UseAgentDBLiveQueryOptions<T>} [options] - Optional configuration for the hook.
 * @returns {{ data: T | undefined; loading: boolean; error: AgentDBError | null }}
 *          An object containing the live data, loading status, and any error encountered.
 */
export function useAgentDBLiveQuery<T>(
  client: AgentDB,
  path: string,
  options?: UseAgentDBLiveQueryOptions<T>
): { data: T | undefined; loading: boolean; error: AgentDBError | null } {
  const [data, setData] = useState<T | undefined>(options?.defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AgentDBError | null>(null);

  // Use a ref to store the LiveQuery instance to avoid re-creating it
  // on every render and to manage its lifecycle.
  const liveQueryRef = useRef<LiveQuery<T> | null>(null);

  useEffect(() => {
    if (!client) {
      setError(new AgentDBError('AgentDB client is not provided.', 'CLIENT_NOT_INITIALIZED'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a new LiveQuery instance
      liveQueryRef.current = client.liveQuery<T>(path);

      // Subscribe to data updates
      const unsubscribe = liveQueryRef.current.onUpdate((newData) => {
        setData(newData);
        setLoading(false); // Data has been received, so loading is complete
      });

      // Subscribe to error events
      const unsubscribeError = liveQueryRef.current.onError((err) => {
        console.error(`AgentDB LiveQuery Error for path "${path}":`, err);
        setError(err);
        setLoading(false); // Stop loading on error
        options?.onError?.(err); // Call the provided error handler
      });

      // Fetch initial data (if not already received via onUpdate)
      // This is crucial for components that might render before the first 'onUpdate' fires.
      liveQueryRef.current.get()
        .then((initialData) => {
          if (initialData !== undefined) { // Only update if data exists
            setData(initialData);
          }
          setLoading(false);
        })
        .catch((err: AgentDBError) => {
          console.error(`AgentDB LiveQuery Initial Fetch Error for path "${path}":`, err);
          setError(err);
          setLoading(false);
          options?.onError?.(err);
        });


      // Cleanup function: unsubscribe from live updates when the component unmounts
      return () => {
        unsubscribe();
        unsubscribeError();
        liveQueryRef.current = null; // Clear the ref
      };
    } catch (err) {
      if (err instanceof AgentDBError) {
        setError(err);
        options?.onError?.(err);
      } else {
        setError(new AgentDBError((err as Error).message || 'An unknown error occurred.', 'UNKNOWN_ERROR'));
        options?.onError?.(new AgentDBError((err as Error).message || 'An unknown error occurred.', 'UNKNOWN_ERROR'));
      }
      setLoading(false);
    }
  }, [client, path, options]); // Re-run effect if client or path changes

  return { data, loading, error };
}
