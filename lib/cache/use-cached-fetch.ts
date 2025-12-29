"use client";

/**
 * Client-side caching hook with SWR-like behavior
 * Uses localStorage for persistence and in-memory cache for speed
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface CacheOptions {
  /** Time to live in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Persist to localStorage (default: false) */
  persist?: boolean;
  /** Revalidate on focus (default: true) */
  revalidateOnFocus?: boolean;
  /** Revalidate on reconnect (default: true) */
  revalidateOnReconnect?: boolean;
  /** Dedupe interval in ms (default: 2000) */
  dedupingInterval?: number;
}

interface CacheState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
}

// In-memory cache for fast access
const memoryCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

// Track ongoing requests to dedupe
const ongoingRequests = new Map<string, Promise<unknown>>();

/**
 * Get from localStorage with expiry check
 */
function getFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(`cache:${key}`);
    if (!stored) return null;

    const { data, timestamp, ttl } = JSON.parse(stored);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Set to localStorage with expiry
 */
function setToStorage<T>(key: string, data: T, ttl: number): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `cache:${key}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl,
      })
    );
  } catch {
    // Storage might be full or disabled
  }
}

/**
 * Custom hook for cached data fetching with SWR-like behavior
 */
export function useCachedFetch<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): CacheState<T> & {
  mutate: (data?: T) => void;
  revalidate: () => Promise<void>;
} {
  const {
    ttl = 5 * 60 * 1000,
    persist = false,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isValidating: false,
  });

  const lastFetchTime = useRef<number>(0);

  // Get cached data on mount
  useEffect(() => {
    if (!key) return;

    // Check memory cache first
    const memCached = memoryCache.get(key);
    if (memCached && Date.now() - memCached.timestamp < memCached.ttl) {
      setState({
        data: memCached.data as T,
        error: null,
        isLoading: false,
        isValidating: false,
      });
      return;
    }

    // Check localStorage if persist is enabled
    if (persist) {
      const stored = getFromStorage<T>(key);
      if (stored) {
        setState({
          data: stored,
          error: null,
          isLoading: false,
          isValidating: true,
        });
        // Store in memory cache too
        memoryCache.set(key, { data: stored, timestamp: Date.now(), ttl });
      }
    }
  }, [key, persist, ttl]);

  const revalidate = useCallback(async () => {
    if (!key) return;

    // Dedupe requests within interval
    const now = Date.now();
    if (now - lastFetchTime.current < dedupingInterval) {
      const ongoing = ongoingRequests.get(key);
      if (ongoing) {
        await ongoing;
        return;
      }
    }

    lastFetchTime.current = now;
    setState((prev) => ({ ...prev, isValidating: true }));

    try {
      // Check for ongoing request
      let request = ongoingRequests.get(key);
      if (!request) {
        request = fetcher();
        ongoingRequests.set(key, request);
      }

      const data = (await request) as T;

      // Update memory cache
      memoryCache.set(key, { data, timestamp: Date.now(), ttl });

      // Update localStorage if persist is enabled
      if (persist) {
        setToStorage(key, data, ttl);
      }

      setState({
        data,
        error: null,
        isLoading: false,
        isValidating: false,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Unknown error"),
        isLoading: false,
        isValidating: false,
      }));
    } finally {
      ongoingRequests.delete(key);
    }
  }, [key, fetcher, ttl, persist, dedupingInterval]);

  // Initial fetch
  useEffect(() => {
    if (!key) return;
    revalidate();
  }, [key, revalidate]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus || !key) return;

    const handleFocus = () => {
      // Only revalidate if enough time has passed
      if (Date.now() - lastFetchTime.current > dedupingInterval) {
        revalidate();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [key, revalidateOnFocus, revalidate, dedupingInterval]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect || !key) return;

    const handleOnline = () => {
      revalidate();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [key, revalidateOnReconnect, revalidate]);

  const mutate = useCallback(
    (data?: T) => {
      if (!key) return;

      if (data !== undefined) {
        memoryCache.set(key, { data, timestamp: Date.now(), ttl });
        if (persist) {
          setToStorage(key, data, ttl);
        }
        setState((prev) => ({ ...prev, data }));
      } else {
        // Trigger revalidation
        revalidate();
      }
    },
    [key, ttl, persist, revalidate]
  );

  return { ...state, mutate, revalidate };
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
  memoryCache.clear();
  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("cache:")) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Invalidate specific cache key
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key);
  if (typeof window !== "undefined") {
    localStorage.removeItem(`cache:${key}`);
  }
}

/**
 * Prefetch data and cache it
 */
export async function prefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; persist?: boolean } = {}
): Promise<T> {
  const { ttl = 5 * 60 * 1000, persist = false } = options;

  const data = await fetcher();

  memoryCache.set(key, { data, timestamp: Date.now(), ttl });
  if (persist) {
    setToStorage(key, data, ttl);
  }

  return data;
}
