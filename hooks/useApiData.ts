import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '../services/apiClient';

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic data fetching hook.
 *
 * Calls `fetcher` on mount and exposes `data`, `loading`, `error`, and a
 * `refetch` function that re-triggers the fetch on demand.
 *
 * Errors thrown by the fetcher are expected to conform to the `ApiError`
 * shape exported by `apiClient`; the hook extracts the human-readable
 * `message` from them.
 *
 * Validates: Requirements 3.6, 8.5, 11.4, 11.5
 */
export function useApiData<T>(fetcher: () => Promise<T>): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable reference to the latest fetcher so `refetch` never goes
  // stale, while still reacting to fetcher identity changes.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.message ?? 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
