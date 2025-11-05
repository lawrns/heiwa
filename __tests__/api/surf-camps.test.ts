import { GET, OPTIONS } from '@/app/api/surf-camps/route'
import { supabase } from '@/lib/supabase'
import { SurfCampFactory } from '../factories'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}))

const mockSupabase = supabase as any

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

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: mockSurfCamps, 
              error: null 
            })
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camps).toHaveLength(2)
      expect(data.data.surf_camps).toEqual(mockSurfCamps)

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('surf_camps')
      expect(mockSupabase.from('').select).toHaveBeenCalledWith('*')
      expect(mockSupabase.from('').select('').eq).toHaveBeenCalledWith('is_active', true)
      expect(mockSupabase.from('').select('').eq('').order).toHaveBeenCalledWith('name')
    })

    it('should handle empty surf camps list', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camps).toEqual([])
    })

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed')
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: dbError 
            })
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch surf camps')
    })

    it('should handle null data from database', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: null 
            })
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camps).toEqual([])
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unexpected error')
    })

    it('should handle Error objects in catch block', async () => {
      const customError = new Error('Custom error message')
      mockSupabase.from.mockImplementation(() => {
        throw customError
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Custom error message')
    })

    it('should handle non-Error objects in catch block', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw 'String error'
      })

      const response = await GET()
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
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS')
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
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: [SurfCampFactory.beginner()], 
              error: null 
            })
          })
        })
      })

      const response = await GET()
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

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: manySurfCamps, 
              error: null 
            })
          })
        })
      })

      const startTime = Date.now()
      const response = await GET()
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms
      
      const data = await response.json()
      expect(data.data.surf_camps).toHaveLength(20)
    })
  })
})
