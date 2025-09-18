/**
 * Rate Limiter for API Endpoints
 * Implements sliding window rate limiting to prevent API abuse
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is within rate limit
   */
  async isAllowed(request: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.generateKey(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create entry
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new window
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      this.store.set(key, entry);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }

    // Check if within limit
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Generate rate limit key from request
   */
  private generateKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // Default: use IP address and API key
    const url = new URL(request.url);
    const apiKey = request.headers.get('X-Heiwa-API-Key') || 'anonymous';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return `${ip}:${apiKey}:${url.pathname}`;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current stats
   */
  getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    let activeKeys = 0;
    
    for (const entry of this.store.values()) {
      if (entry.resetTime > now) {
        activeKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys
    };
  }
}

// Rate limiter instances for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes per IP/API key
});

export const bookingRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 booking attempts per hour per IP/API key
});

export const strictRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 requests per 5 minutes for sensitive endpoints
});

/**
 * Rate limiting middleware for Next.js API routes
 */
export async function withRateLimit(
  request: Request,
  rateLimiter: RateLimiter = apiRateLimiter
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const result = await rateLimiter.isAllowed(request);
  
  const headers = {
    'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };

  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString();
  }

  return {
    allowed: result.allowed,
    headers
  };
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(headers: Record<string, string>) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: headers['Retry-After']
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}
