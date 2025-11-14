/**
 * API Retry Utility Tests
 * Tests for lib/utils/api-retry.ts
 */

import { retryFetch, fetchWithRetry, RetryOptions } from '@/lib/utils/api-retry'

// Mock fetch
global.fetch = jest.fn()

describe('API Retry Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('retryFetch', () => {
    it('should return successful response immediately', async () => {
      const mockResponse = createMockResponse({ success: true }, 200)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const response = await retryFetch('http://example.com/api')

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should retry on server errors (500)', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      jest.useFakeTimers()

      const fetchPromise = retryFetch('http://example.com/api')

      // Fast-forward time for retry delay
      jest.advanceTimersByTime(1000)

      const response = await fetchPromise

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('should retry on network errors', async () => {
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSuccessResponse)

      jest.useFakeTimers()

      const fetchPromise = retryFetch('http://example.com/api')

      jest.advanceTimersByTime(1000)

      const response = await fetchPromise

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('should not retry on client errors (400)', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Bad Request' }, 400)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse)

      const response = await retryFetch('http://example.com/api')

      expect(response.status).toBe(400)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should not retry on 404 errors', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Not Found' }, 404)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse)

      const response = await retryFetch('http://example.com/api')

      expect(response.status).toBe(404)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should use exponential backoff', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      jest.useFakeTimers()

      const fetchPromise = retryFetch('http://example.com/api', {}, {
        initialDelay: 100,
        backoffMultiplier: 2,
      })

      // First retry after 100ms
      jest.advanceTimersByTime(100)
      // Second retry after 200ms
      jest.advanceTimersByTime(200)

      const response = await fetchPromise

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(3)

      jest.useRealTimers()
    })

    it('should respect max retries', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse)

      jest.useFakeTimers()

      const fetchPromise = retryFetch('http://example.com/api', {}, {
        maxRetries: 2,
        initialDelay: 100,
      })

      // Advance time for all retries
      jest.advanceTimersByTime(1000)

      const response = await fetchPromise

      expect(response.status).toBe(500)
      expect(global.fetch).toHaveBeenCalledTimes(3) // Initial + 2 retries

      jest.useRealTimers()
    })

    it('should respect max delay', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      jest.useFakeTimers()

      const fetchPromise = retryFetch('http://example.com/api', {}, {
        initialDelay: 1000,
        maxDelay: 2000,
        backoffMultiplier: 10, // Would exceed maxDelay
      })

      // Should wait maxDelay (2000ms), not calculated delay
      jest.advanceTimersByTime(2000)

      const response = await fetchPromise

      expect(response.ok).toBe(true)

      jest.useRealTimers()
    })

    it('should retry on specific retryable statuses', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Timeout' }, 408)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      jest.useFakeTimers()

      const fetchPromise = retryFetch('http://example.com/api', {}, {
        retryableStatuses: [408, 500, 502, 503, 504],
      })

      jest.advanceTimersByTime(1000)

      const response = await fetchPromise

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('should not retry on non-retryable statuses', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Bad Request' }, 400)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        retryableStatuses: [500, 502, 503, 504],
      })

      expect(response.status).toBe(400)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchWithRetry', () => {
    it('should be an alias for retryFetch', async () => {
      const mockResponse = createMockResponse({ success: true }, 200)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const response = await fetchWithRetry('http://example.com/api')

      expect(response.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should accept retry options', async () => {
      const mockResponse = createMockResponse({ success: true }, 200)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const response = await fetchWithRetry('http://example.com/api', {}, {
        maxRetries: 2,
        initialDelay: 500,
      })

      expect(response.ok).toBe(true)
    })
  })
})

// Helper function
function createMockResponse(data: any, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response
}

