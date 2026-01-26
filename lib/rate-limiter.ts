/**
 * Simple in-memory rate limiter for API endpoints
 * Note: This implementation is per-instance and won't work across
 * multiple serverless instances. For production, consider using
 * Redis or a managed rate limiting service.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  
  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Window size in milliseconds */
  windowMs: number
  /** Optional key prefix to namespace different limiters */
  keyPrefix?: string
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of remaining requests in the current window */
  remaining: number
  /** When the rate limit window resets (timestamp in ms) */
  resetAt: number
  /** Total requests allowed per window */
  limit: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries()
  
  const key = config.keyPrefix 
    ? `${config.keyPrefix}:${identifier}` 
    : identifier
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)
  
  // Create new entry if none exists or if window has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    }
    rateLimitStore.set(key, entry)
  }
  
  entry.count++
  
  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    limit: config.maxRequests
  }
}

/**
 * Create a rate limiter with preset configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string) => checkRateLimit(identifier, config)
}

// Preset rate limiters for common use cases
export const rateLimiters = {
  /**
   * API rate limiter: 100 requests per minute
   * Suitable for general API endpoints
   */
  api: createRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000,
    keyPrefix: 'api'
  }),
  
  /**
   * Authentication rate limiter: 5 attempts per 15 minutes
   * Suitable for login/password reset endpoints
   */
  auth: createRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    keyPrefix: 'auth'
  }),
  
  /**
   * Form submission rate limiter: 3 submissions per hour
   * Suitable for contact forms, booking requests
   */
  form: createRateLimiter({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    keyPrefix: 'form'
  }),
  
  /**
   * Booking rate limiter: 10 requests per hour
   * Suitable for booking creation endpoints
   */
  booking: createRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    keyPrefix: 'booking'
  }),
  
  /**
   * Search rate limiter: 30 requests per minute
   * Suitable for search and availability checking
   */
  search: createRateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000,
    keyPrefix: 'search'
  })
}

/**
 * Get client IP from request headers
 * Works with Netlify, Vercel, Cloudflare, and direct connections
 */
export function getClientIP(request: Request): string {
  const headers = request.headers
  
  // Check various proxy headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP
  
  // Netlify
  const clientIP = headers.get('x-nf-client-connection-ip')
  if (clientIP) return clientIP
  
  // Vercel
  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP
  
  // Fallback
  return 'unknown'
}

/**
 * Create rate limit headers for the response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    'Retry-After': result.allowed 
      ? '0' 
      : Math.ceil((result.resetAt - Date.now()) / 1000).toString()
  }
}

export default { 
  checkRateLimit, 
  createRateLimiter, 
  rateLimiters, 
  getClientIP,
  createRateLimitHeaders 
}

