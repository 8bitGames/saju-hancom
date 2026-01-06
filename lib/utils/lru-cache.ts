/**
 * Simple LRU (Least Recently Used) Cache implementation
 * with TTL (Time To Live) support for caching API responses.
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttl: number;

  /**
   * Creates a new LRU Cache
   * @param maxSize Maximum number of entries in the cache
   * @param ttlMs Time to live in milliseconds (default: 1 hour)
   */
  constructor(maxSize: number = 100, ttlMs: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  /**
   * Get a value from the cache
   * @returns The cached value or undefined if not found/expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   */
  get size(): number {
    return this.cache.size;
  }
}

// Singleton caches for different purposes
// Gemini AI interpretation cache - 1 hour TTL, max 500 entries
export const geminiInterpretationCache = new LRUCache<unknown>(500, 3600000);

// Daily fortune cache - 6 hour TTL, max 200 entries
export const dailyFortuneCache = new LRUCache<unknown>(200, 21600000);
