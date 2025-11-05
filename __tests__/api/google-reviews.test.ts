import { GET } from '@/app/api/google-reviews/route'
import { NextRequest } from 'next/server'

// Mock fetch
global.fetch = jest.fn()

describe('/api/google-reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GOOGLE_PLACES_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.GOOGLE_PLACES_API_KEY
  })

  describe('GET /api/google-reviews', () => {
    it('should return reviews when API key is configured', async () => {
      const mockGoogleResponse = {
        status: 'OK',
        result: {
          rating: 4.5,
          user_ratings_total: 100,
          reviews: [
            {
              author_name: 'John Doe',
              rating: 5,
              text: 'Amazing experience!',
              relative_time_description: '1 week ago'
            }
          ]
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockGoogleResponse)
      })

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockGoogleResponse)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ1234567890&fields=rating,user_ratings_total,reviews&key=test-api-key'
      )
    })

    it('should handle missing API key', async () => {
      delete process.env.GOOGLE_PLACES_API_KEY

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Google Places API not configured')

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle Google API error response', async () => {
      const mockErrorResponse = {
        status: 'INVALID_REQUEST',
        error_message: 'Invalid place ID'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse)
      })

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch reviews from Google')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle unexpected errors', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Unexpected error')
      })

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle empty reviews response', async () => {
      const mockEmptyResponse = {
        status: 'OK',
        result: {
          rating: 0,
          user_ratings_total: 0,
          reviews: []
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockEmptyResponse)
      })

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.result.reviews).toEqual([])
    })

    it('should handle malformed Google API response', async () => {
      const mockMalformedResponse = {
        status: 'OK',
        result: null
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockMalformedResponse)
      })

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockMalformedResponse)
    })
  })

  describe('Integration Tests', () => {
    it('should maintain consistent response structure on success', async () => {
      const mockGoogleResponse = {
        status: 'OK',
        result: {
          rating: 4.5,
          user_ratings_total: 100,
          reviews: []
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockGoogleResponse)
      })

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('status', 'OK')
      expect(data.data).toHaveProperty('result')
    })

    it('should maintain consistent response structure on error', async () => {
      delete process.env.GOOGLE_PLACES_API_KEY

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      // Verify error response structure
      expect(data).toHaveProperty('success', false)
      expect(data).toHaveProperty('error')
      expect(data).not.toHaveProperty('data')
    })

    it('should handle timeout gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('ETIMEDOUT'))

      const request = new NextRequest('http://localhost:3000/api/google-reviews')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })
})
