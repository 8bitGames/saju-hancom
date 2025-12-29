/**
 * API Response Caching Utilities
 * In-memory cache with TTL and stale-while-revalidate support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  staleWhileRevalidate?: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: number; // Additional time to serve stale content while revalidating
  key?: string; // Custom cache key
}

// Default cache configuration
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SWR = 60 * 1000; // 1 minute stale-while-revalidate

// In-memory cache store
const cache = new Map<string, CacheEntry<unknown>>();

// Pending revalidation requests
const pendingRevalidations = new Map<string, Promise<unknown>>();

/**
 * Generate a cache key from request parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join("&");
  return `${prefix}:${sortedParams}`;
}

/**
 * Get cached data if available and not expired
 */
export function getCached<T>(key: string): {
  data: T | null;
  isStale: boolean;
  needsRevalidation: boolean;
} {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return { data: null, isStale: false, needsRevalidation: true };
  }

  const now = Date.now();
  const age = now - entry.timestamp;
  const isExpired = age > entry.ttl;
  const isStale =
    isExpired && entry.staleWhileRevalidate
      ? age <= entry.ttl + entry.staleWhileRevalidate
      : false;

  if (isExpired && !isStale) {
    // Completely expired, remove from cache
    cache.delete(key);
    return { data: null, isStale: false, needsRevalidation: true };
  }

  return {
    data: entry.data,
    isStale,
    needsRevalidation: isStale,
  };
}

/**
 * Set data in cache
 */
export function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { ttl = DEFAULT_TTL, staleWhileRevalidate = DEFAULT_SWR } = options;

  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
    staleWhileRevalidate,
  });
}

/**
 * Invalidate cache entry
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalidate all cache entries matching a prefix
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Fetch with caching - returns cached data immediately if available,
 * and revalidates in background if stale
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = getCached<T>(key);

  // Return fresh cached data
  if (cached.data && !cached.needsRevalidation) {
    return cached.data;
  }

  // Return stale data but trigger background revalidation
  if (cached.data && cached.isStale) {
    // Check if already revalidating
    if (!pendingRevalidations.has(key)) {
      const revalidation = fetcher()
        .then((data) => {
          setCache(key, data, options);
          return data;
        })
        .finally(() => {
          pendingRevalidations.delete(key);
        });
      pendingRevalidations.set(key, revalidation);
    }
    return cached.data;
  }

  // No cached data, fetch fresh
  const data = await fetcher();
  setCache(key, data, options);
  return data;
}

/**
 * Pre-configured cache options for different data types
 */
export const CACHE_CONFIGS = {
  // Saju analysis results - cache for 1 hour
  saju: {
    ttl: 60 * 60 * 1000,
    staleWhileRevalidate: 30 * 60 * 1000,
  },
  // Compatibility results - cache for 1 hour
  compatibility: {
    ttl: 60 * 60 * 1000,
    staleWhileRevalidate: 30 * 60 * 1000,
  },
  // Daily fortune - cache for 6 hours
  fortune: {
    ttl: 6 * 60 * 60 * 1000,
    staleWhileRevalidate: 60 * 60 * 1000,
  },
  // User data - short cache with fast revalidation
  user: {
    ttl: 60 * 1000,
    staleWhileRevalidate: 30 * 1000,
  },
  // Static content - long cache
  static: {
    ttl: 24 * 60 * 60 * 1000,
    staleWhileRevalidate: 60 * 60 * 1000,
  },
} as const;

/**
 * React Query / SWR-like hook helper for client-side caching
 * Use with useSWR or React Query for optimal caching
 */
export function createCacheKey(
  type: keyof typeof CACHE_CONFIGS,
  params: Record<string, unknown>
): string {
  return generateCacheKey(type, params);
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  pendingRevalidations: number;
} {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    pendingRevalidations: pendingRevalidations.size,
  };
}
