/**
 * Rate Limiter for API Protection
 * In-memory implementation suitable for single instance deployment
 * For multi-instance: Replace with Redis implementation
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

// Preset configurations for different API types
export const RATE_LIMIT_CONFIGS = {
  // AI-heavy endpoints (expensive operations)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },
  // Standard API endpoints
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Auth endpoints (stricter to prevent brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  // Webhook endpoints (from trusted sources)
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Cleanup expired entries every minute
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  async isRateLimited(
    key: string,
    config: RateLimitConfig
  ): Promise<{
    limited: boolean;
    remaining: number;
    resetIn: number;
  }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return {
        limited: false,
        remaining: config.maxRequests - 1,
        resetIn: config.windowMs,
      };
    }

    // Increment existing entry
    entry.count++;
    this.store.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetIn = entry.resetTime - now;

    return {
      limited: entry.count > config.maxRequests,
      remaining,
      resetIn,
    };
  }

  // For testing purposes
  reset(): void {
    this.store.clear();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new InMemoryRateLimiter();

/**
 * Get a unique identifier for rate limiting
 * Uses IP address with fallback options
 */
export function getClientIdentifier(request: Request): string {
  // Check various headers for the real IP
  const headers = request.headers;

  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") || // Cloudflare
    headers.get("x-vercel-forwarded-for") || // Vercel
    "unknown";

  return ip;
}

/**
 * Rate limit check with standardized response
 */
export async function checkRateLimit(
  request: Request,
  type: RateLimitType = "standard",
  customKey?: string
): Promise<{
  success: boolean;
  response?: Response;
  headers: Record<string, string>;
}> {
  const config = RATE_LIMIT_CONFIGS[type];
  const clientId = customKey || getClientIdentifier(request);
  const key = `${type}:${clientId}`;

  const result = await rateLimiter.isRateLimited(key, config);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": config.maxRequests.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetIn / 1000).toString(),
  };

  if (result.limited) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          retryAfter: Math.ceil(result.resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
            ...headers,
          },
        }
      ),
      headers,
    };
  }

  return { success: true, headers };
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit<T extends Request>(
  handler: (request: T, ...args: unknown[]) => Promise<Response>,
  type: RateLimitType = "standard"
) {
  return async (request: T, ...args: unknown[]): Promise<Response> => {
    const { success, response, headers } = await checkRateLimit(request, type);

    if (!success && response) {
      return response;
    }

    const result = await handler(request, ...args);

    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      result.headers.set(key, value);
    });

    return result;
  };
}

export { rateLimiter };
