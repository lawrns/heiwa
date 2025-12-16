import { NextRequest } from 'next/server'
import { GET, OPTIONS } from '@/app/api/surf-camps/route'
import { SurfCampFactory } from '../factories'

jest.mock('@/lib/supabase-timeout', () => ({
  executeWithTimeout: async <T>(promise: Promise<any>) => promise,
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
            limit: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          gte: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          limit: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }))
    }))
  }
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabaseAdmin } = require('@/lib/supabase')
const mockSupabaseAdmin = supabaseAdmin as any

// Mock NextRequest
const createMockRequest = (url: string = 'http://localhost:3000/api/surf-camps') => new NextRequest(url)

describe('/api/surf-camps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/surf-camps', () => {
    it('should return active surf camps ordered by name', async () => {
      const mockSurfCamps = [
        SurfCampFactory.beginner({ 
          id: 'camp-1',
          name: 'Beginner Surf Camp',
          level: 'beginner',
          price: 500,
          is_active: true
        }),
        SurfCampFactory.advanced({ 
          id: 'camp-2',
          name: 'Advanced Surf Camp',
          level: 'advanced',
          price: 700,
          is_active: true
        })
      ]

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ data: mockSurfCamps, error: null })),
                })),
              })),
            })),
          }
        }

        if (table === 'rooms') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }

        if (table === 'surf_camp_enrollments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                in: jest.fn(() => Promise.resolve({ count: 0, error: null })),
              })),
            })),
          }
        }

        if (table === 'room_assignments') {
          return {
            select: jest.fn(() => ({
              gt: jest.fn(() => ({
                lt: jest.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          }
        }

        return {}
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camps).toHaveLength(2)
    })

    it('should handle empty surf camps list', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ data: [], error: null })),
                })),
              })),
            })),
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }
        return {}
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camps).toEqual([])
    })

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed')
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ data: null, error: dbError })),
                })),
              })),
            })),
          }
        }
        return {}
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch surf camps')
    })

    it('should handle null data from database', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ data: null, error: null })),
                })),
              })),
            })),
          }
        }
        return {}
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camps).toEqual([])
    })

    it('should handle unexpected errors', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unexpected error')
    })

    it('should handle Error objects in catch block', async () => {
      const customError = new Error('Custom error message')
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw customError
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Custom error message')
    })

    it('should handle non-Error objects in catch block', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw 'String error'
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('OPTIONS /api/surf-camps', () => {
    it('should return correct CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    })

    it('should return empty body', async () => {
      const response = await OPTIONS()
      const text = await response.text()

      expect(text).toBe('')
    })
  })

  describe('Integration Tests', () => {
    it('should maintain consistent response structure', async () => {
      const one = SurfCampFactory.beginner()
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ data: [one], error: null })),
                })),
              })),
            })),
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }
        if (table === 'surf_camp_enrollments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                in: jest.fn(() => Promise.resolve({ count: 0, error: null })),
              })),
            })),
          }
        }
        if (table === 'room_assignments') {
          return {
            select: jest.fn(() => ({
              gt: jest.fn(() => ({
                lt: jest.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          }
        }
        return {}
      })

      const response = await GET(createMockRequest())
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('surf_camps')
      expect(Array.isArray(data.data.surf_camps)).toBe(true)
    })

    it('should handle large number of surf camps efficiently', async () => {
      const manySurfCamps = Array.from({ length: 20 }, (_, i) => 
        SurfCampFactory.beginner({ 
          id: `camp-${i}`, 
          name: `Surf Camp ${i}`,
          level: i % 2 === 0 ? 'beginner' : 'advanced'
        })
      )

      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ data: manySurfCamps, error: null })),
                })),
              })),
            })),
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }
        if (table === 'surf_camp_enrollments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                in: jest.fn(() => Promise.resolve({ count: 0, error: null })),
              })),
            })),
          }
        }
        if (table === 'room_assignments') {
          return {
            select: jest.fn(() => ({
              gt: jest.fn(() => ({
                lt: jest.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          }
        }
        return {}
      })

      const startTime = Date.now()
      const response = await GET(createMockRequest())
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms
      
      const data = await response.json()
      expect(data.data.surf_camps).toHaveLength(20)
    })
  })
})
