/**
 * Cache Utilities
 * Centralized exports for caching functionality
 */

// Server-side API caching
export {
  generateCacheKey,
  getCached,
  setCache,
  invalidateCache,
  invalidateCacheByPrefix,
  clearCache,
  fetchWithCache,
  createCacheKey,
  getCacheStats,
  CACHE_CONFIGS,
} from "./api-cache";

// Client-side React caching hook
export {
  useCachedFetch,
  clearAllCache,
  invalidateCache as invalidateClientCache,
  prefetch,
} from "./use-cached-fetch";
