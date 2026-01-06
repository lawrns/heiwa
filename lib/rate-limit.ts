/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request frequency
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitStore>()

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000)
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  limit: number
  window: number // in milliseconds
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Check if request should be rate limited
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const now = Date.now()
  const windowStart = now - config.window

  let entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired
    entry = {
      count: 0,
      resetTime: now + config.window,
    }
    rateLimitStore.set(identifier, entry)
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment counter
  entry.count++

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get rate limit identifier from request
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from session
  const userId = request.cookies.get('user_id')?.value
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'

  return `ip:${ip}`
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(request: NextRequest) {
    const identifier = getIdentifier(request)

    const result = await checkRateLimit(identifier, config)

    if (!result.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      )

      response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())
      response.headers.set('X-RateLimit-Limit', config.limit.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

      return response
    }

    const response = NextResponse.next()

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

    return response
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  // Strict: 10 requests per minute
  strict: createRateLimitMiddleware({
    limit: 10,
    window: 60 * 1000,
  }),

  // Default: 60 requests per minute
  default: createRateLimitMiddleware({
    limit: 60,
    window: 60 * 1000,
  }),

  // Lenient: 300 requests per minute
  lenient: createRateLimitMiddleware({
    limit: 300,
    window: 60 * 1000,
  }),

  // Login: 5 attempts per 15 minutes
  login: createRateLimitMiddleware({
    limit: 5,
    window: 15 * 60 * 1000,
  }),

  // API: 100 requests per minute
  api: createRateLimitMiddleware({
    limit: 100,
    window: 60 * 1000,
  }),
}

/**
 * Check rate limit without middleware (for use in API routes)
 */
export async function requireRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; error?: NextResponse }> {
  const identifier = getIdentifier(request)
  const result = await checkRateLimit(identifier, config)

  if (!result.success) {
    const error = NextResponse.json(
      {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    )

    error.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())

    return { success: false, error }
  }

  return { success: true }
}
