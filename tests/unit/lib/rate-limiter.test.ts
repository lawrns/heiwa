/**
 * Rate Limiter Unit Tests
 * Tests for request throttling, window management, and preset limiters
 */

import {
  checkRateLimit,
  createRateLimiter,
  rateLimiters,
  getClientIP,
  createRateLimitHeaders,
  RateLimitConfig,
} from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  // Use unique identifiers for each test to avoid interference
  let testCounter = 0;
  const getUniqueId = () => `test_${Date.now()}_${++testCounter}`;

  // ==========================================================================
  // checkRateLimit Tests
  // ==========================================================================

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const identifier = getUniqueId();
      const config: RateLimitConfig = {
        maxRequests: 5,
        windowMs: 60000,
      };

      const result = checkRateLimit(identifier, config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });

    it('should track request count correctly', () => {
      const identifier = getUniqueId();
      const config: RateLimitConfig = {
        maxRequests: 5,
        windowMs: 60000,
      };

      // Make 3 requests
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const result = checkRateLimit(identifier, config);

      expect(result.remaining).toBe(2);
    });

    it('should block requests exceeding limit', () => {
      const identifier = getUniqueId();
      const config: RateLimitConfig = {
        maxRequests: 3,
        windowMs: 60000,
      };

      // Make 3 requests (allowed)
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);

      // 4th request should be blocked
      const result = checkRateLimit(identifier, config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = getUniqueId();
      const config: RateLimitConfig = {
        maxRequests: 2,
        windowMs: 100, // 100ms window for testing
      };

      // Exhaust the limit
      checkRateLimit(identifier, config);
      checkRateLimit(identifier, config);
      const blocked = checkRateLimit(identifier, config);
      expect(blocked.allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should use key prefix when provided', () => {
      const identifier = getUniqueId();
      const config1: RateLimitConfig = {
        maxRequests: 2,
        windowMs: 60000,
        keyPrefix: 'api',
      };
      const config2: RateLimitConfig = {
        maxRequests: 2,
        windowMs: 60000,
        keyPrefix: 'auth',
      };

      // Exhaust api limit
      checkRateLimit(identifier, config1);
      checkRateLimit(identifier, config1);
      const apiResult = checkRateLimit(identifier, config1);

      // Auth should still be available (different prefix)
      const authResult = checkRateLimit(identifier, config2);

      expect(apiResult.allowed).toBe(false);
      expect(authResult.allowed).toBe(true);
    });

    it('should return correct resetAt timestamp', () => {
      const identifier = getUniqueId();
      const windowMs = 60000;
      const config: RateLimitConfig = {
        maxRequests: 5,
        windowMs,
      };

      const before = Date.now();
      const result = checkRateLimit(identifier, config);
      const after = Date.now();

      expect(result.resetAt).toBeGreaterThanOrEqual(before + windowMs);
      expect(result.resetAt).toBeLessThanOrEqual(after + windowMs);
    });

    it('should handle concurrent requests from same identifier', () => {
      const identifier = getUniqueId();
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000,
      };

      // Simulate concurrent requests
      const results = Array.from({ length: 10 }, () =>
        checkRateLimit(identifier, config)
      );

      // All should be allowed
      results.forEach((result, index) => {
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(10 - index - 1);
      });

      // 11th should be blocked
      const blocked = checkRateLimit(identifier, config);
      expect(blocked.allowed).toBe(false);
    });

    it('should handle different identifiers independently', () => {
      const id1 = getUniqueId();
      const id2 = getUniqueId();
      const config: RateLimitConfig = {
        maxRequests: 2,
        windowMs: 60000,
      };

      // Exhaust limit for id1
      checkRateLimit(id1, config);
      checkRateLimit(id1, config);
      const result1 = checkRateLimit(id1, config);

      // id2 should still have full quota
      const result2 = checkRateLimit(id2, config);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
    });
  });

  // ==========================================================================
  // createRateLimiter Tests
  // ==========================================================================

  describe('createRateLimiter', () => {
    it('should create a reusable rate limiter function', () => {
      const limiter = createRateLimiter({
        maxRequests: 5,
        windowMs: 60000,
        keyPrefix: 'custom',
      });

      const identifier = getUniqueId();
      const result = limiter(identifier);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(5);
    });

    it('should maintain state across calls', () => {
      const limiter = createRateLimiter({
        maxRequests: 3,
        windowMs: 60000,
        keyPrefix: 'stateful',
      });

      const identifier = getUniqueId();
      limiter(identifier);
      limiter(identifier);
      const result = limiter(identifier);

      expect(result.remaining).toBe(0);
    });
  });

  // ==========================================================================
  // Preset Rate Limiters Tests
  // ==========================================================================

  describe('Preset Rate Limiters', () => {
    describe('api limiter', () => {
      it('should allow 100 requests per minute', () => {
        const identifier = getUniqueId();
        const result = rateLimiters.api(identifier);

        expect(result.limit).toBe(100);
        expect(result.allowed).toBe(true);
      });
    });

    describe('auth limiter', () => {
      it('should allow 5 attempts per 15 minutes', () => {
        const identifier = getUniqueId();
        const result = rateLimiters.auth(identifier);

        expect(result.limit).toBe(5);
        expect(result.allowed).toBe(true);
      });

      it('should block after 5 attempts', () => {
        const identifier = getUniqueId();

        // Make 5 attempts
        for (let i = 0; i < 5; i++) {
          rateLimiters.auth(identifier);
        }

        // 6th should be blocked
        const result = rateLimiters.auth(identifier);
        expect(result.allowed).toBe(false);
      });
    });

    describe('form limiter', () => {
      it('should allow 3 submissions per hour', () => {
        const identifier = getUniqueId();
        const result = rateLimiters.form(identifier);

        expect(result.limit).toBe(3);
        expect(result.allowed).toBe(true);
      });
    });

    describe('booking limiter', () => {
      it('should allow 10 requests per hour', () => {
        const identifier = getUniqueId();
        const result = rateLimiters.booking(identifier);

        expect(result.limit).toBe(10);
        expect(result.allowed).toBe(true);
      });
    });

    describe('search limiter', () => {
      it('should allow 30 requests per minute', () => {
        const identifier = getUniqueId();
        const result = rateLimiters.search(identifier);

        expect(result.limit).toBe(30);
        expect(result.allowed).toBe(true);
      });
    });
  });

  // ==========================================================================
  // getClientIP Tests
  // ==========================================================================

  describe('getClientIP', () => {
    // Create a mock request helper since Request may not be available in jsdom
    const createMockRequest = (headers: Record<string, string>) => ({
      headers: {
        get: (name: string) => headers[name.toLowerCase()] || null,
      },
    } as unknown as Request);

    it('should extract IP from x-forwarded-for header', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      });

      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '203.0.113.1',
      });

      const ip = getClientIP(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('should extract IP from x-nf-client-connection-ip header', () => {
      const request = createMockRequest({
        'x-nf-client-connection-ip': '198.51.100.1',
      });

      const ip = getClientIP(request);
      expect(ip).toBe('198.51.100.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = createMockRequest({
        'x-real-ip': '172.16.0.1',
      });

      const ip = getClientIP(request);
      expect(ip).toBe('172.16.0.1');
    });

    it('should return "unknown" when no IP headers present', () => {
      const request = createMockRequest({});

      const ip = getClientIP(request);
      expect(ip).toBe('unknown');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
        'cf-connecting-ip': '203.0.113.1',
        'x-real-ip': '172.16.0.1',
      });

      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });
  });

  // ==========================================================================
  // createRateLimitHeaders Tests
  // ==========================================================================

  describe('createRateLimitHeaders', () => {
    it('should create correct headers for allowed request', () => {
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: Date.now() + 60000,
        limit: 10,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['Retry-After']).toBe('0');
    });

    it('should create correct headers for blocked request', () => {
      const resetAt = Date.now() + 30000; // 30 seconds from now
      const result = {
        allowed: false,
        remaining: 0,
        resetAt,
        limit: 10,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(parseInt(headers['Retry-After'])).toBeGreaterThan(0);
    });

    it('should include reset timestamp in seconds', () => {
      const resetAt = Date.now() + 60000;
      const result = {
        allowed: true,
        remaining: 5,
        resetAt,
        limit: 10,
      };

      const headers = createRateLimitHeaders(result);
      const resetSeconds = parseInt(headers['X-RateLimit-Reset']);

      expect(resetSeconds).toBe(Math.ceil(resetAt / 1000));
    });
  });
});
