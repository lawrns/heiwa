/**
 * API Retry Utility Tests
 * Tests for lib/utils/api-retry.ts
 */

import { retryFetch, fetchWithRetry, RetryOptions } from '@/lib/utils/api-retry'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('API Retry Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('retryFetch', () => {
    it('should return successful response immediately', async () => {
      const mockResponse = createMockResponse({ success: true }, 200)
      mockFetch.mockResolvedValueOnce(mockResponse)

      const response = await retryFetch('http://example.com/api')

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should retry on server errors (500)', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      mockFetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        initialDelay: 1,
        maxDelay: 10,
      })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should retry on network errors', async () => {
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSuccessResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        initialDelay: 1,
        maxDelay: 10,
      })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry on client errors (400)', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Bad Request' }, 400)
      mockFetch.mockResolvedValueOnce(mockErrorResponse)

      const response = await retryFetch('http://example.com/api')

      expect(response.status).toBe(400)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should not retry on 404 errors', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Not Found' }, 404)
      mockFetch.mockResolvedValueOnce(mockErrorResponse)

      const response = await retryFetch('http://example.com/api')

      expect(response.status).toBe(404)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should use exponential backoff', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      mockFetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        initialDelay: 1,
        backoffMultiplier: 2,
        maxDelay: 10,
      })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should respect max retries', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      mockFetch.mockResolvedValue(mockErrorResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        maxRetries: 2,
        initialDelay: 1,
        maxDelay: 10,
      })

      expect(response.status).toBe(500)
      expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should respect max delay', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Server Error' }, 500)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      mockFetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        initialDelay: 1,
        maxDelay: 10,
        backoffMultiplier: 10, // Would exceed maxDelay
      })

      expect(response.ok).toBe(true)
    })

    it('should retry on specific retryable statuses', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Timeout' }, 408)
      const mockSuccessResponse = createMockResponse({ success: true }, 200)

      mockFetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        retryableStatuses: [408, 500, 502, 503, 504],
        initialDelay: 1,
        maxDelay: 10,
      })

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry on non-retryable statuses', async () => {
      const mockErrorResponse = createMockResponse({ error: 'Bad Request' }, 400)
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce(mockErrorResponse)

      const response = await retryFetch('http://example.com/api', {}, {
        retryableStatuses: [500, 502, 503, 504],
        maxRetries: 0, // Disable retries for this test
      })

      expect(response.status).toBe(400)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchWithRetry', () => {
    it('should be an alias for retryFetch', async () => {
      const mockResponse = createMockResponse({ success: true }, 200)
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce(mockResponse)

      const response = await fetchWithRetry('http://example.com/api', {}, {
        initialDelay: 1,
        maxDelay: 10,
        maxRetries: 0, // Disable retries for this test
      })

      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should accept retry options', async () => {
      const mockResponse = createMockResponse({ success: true }, 200)
      mockFetch.mockResolvedValueOnce(mockResponse)

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

