'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  immediate?: boolean;
  immediateParams?: any[];
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  retry: () => Promise<void>;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();

export const useApi = <T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
  const {
    onSuccess,
    onError,
    immediate = false,
    immediateParams = [],
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMounted = useRef(true);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Cancel previous request if still in flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    // Check cache if cacheKey is provided
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
        onSuccess?.(cached.data);
        setLoading(false);
        return cached.data;
      }
    }

    try {
      const result = await apiFunction(...args, abortController.signal);
      
      if (abortController.signal.aborted) {
        throw new DOMException('Request was aborted', 'AbortError');
      }

      if (!isMounted.current) return result;

      setData(result);
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
      
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      if (abortController.signal.aborted) {
        throw err;
      }

      if (!isMounted.current) throw err;

      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'An unexpected error occurred';
      
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      if (!abortController.signal.aborted && isMounted.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [apiFunction, onSuccess, onError, cacheKey, cacheDuration]);

  const reset = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setData(null);
    setLoading(false);
    setError(null);
    
    // Clear cache if cacheKey is provided
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  const retry = useCallback(async () => {
    try {
      await execute(...immediateParams);
    } catch (err) {
      // Error is already handled in execute
      console.error('Retry failed:', err);
    }
  }, [execute, immediateParams]);

  // Auto-execute if immediate is true
  useEffect(() => {
    if (immediate && isMounted.current) {
      execute(...immediateParams);
    }
  }, [immediate, execute, immediateParams]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clear old cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of cache.entries()) {
        if (now - item.timestamp > cacheDuration) {
          cache.delete(key);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cacheDuration]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry,
  };
};