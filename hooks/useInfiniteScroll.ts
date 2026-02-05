'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps {
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  isFetching: boolean;
  error: string | null;
  retry: () => void;
}

function useInfiniteScroll({ 
  fetchMore, 
  hasMore, 
  threshold = 100,
  rootMargin = '0px',
  enabled = true 
}: UseInfiniteScrollProps): UseInfiniteScrollReturn {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isMounted = useRef(true);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (!isMounted.current || !enabled) return;

    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isFetching) {
      setIsFetching(true);
      setError(null);
    }
  }, [hasMore, isFetching, enabled]);

  const retry = useCallback(() => {
    if (hasMore && !isFetching) {
      setIsFetching(true);
      setError(null);
    }
  }, [hasMore, isFetching]);

  useEffect(() => {
    isMounted.current = true;

    if (!enabled) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold: 0,
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      isMounted.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, enabled]);

  useEffect(() => {
    if (!isFetching) return;

    const fetchData = async () => {
      try {
        await fetchMore();
        if (!isMounted.current) return;
      } catch (err: any) {
        if (!isMounted.current) return;
        setError(err.message || 'Failed to load more data');
      } finally {
        if (isMounted.current) {
          setIsFetching(false);
        }
      }
    };

    fetchData();
  }, [isFetching, fetchMore]);

  const Sentinel = useCallback(() => (
    <div 
      ref={sentinelRef}
      style={{ 
        height: '1px',
        marginTop: `${threshold}px`,
        visibility: 'hidden' 
      }}
    />
  ), [threshold]);

  return { 
    isFetching, 
    error, 
    retry,
    Sentinel 
  };
}

export default useInfiniteScroll;