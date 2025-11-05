import { GET, OPTIONS } from '@/app/api/add-ons/route'
import { supabase } from '@/lib/supabase'
import { AddOnFactory } from '../factories'

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

describe('/api/add-ons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/add-ons', () => {
    it('should return active add-ons ordered by category and name', async () => {
      const mockAddOns = [
        AddOnFactory.surfLesson({ 
          id: 'addon-1',
          name: 'Surf Lesson',
          category: 'activity',
          price: 50,
          is_active: true
        }),
        AddOnFactory.yogaClass({ 
          id: 'addon-2',
          name: 'Yoga Class',
          category: 'wellness',
          price: 30,
          is_active: true
        }),
        AddOnFactory.bikeRental({ 
          id: 'addon-3',
          name: 'Bike Rental',
          category: 'activity',
          price: 25,
          is_active: true
        })
      ]

      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: mockAddOns, 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toHaveLength(3)
      expect(data.addOns).toEqual(mockAddOns)

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith('add_ons')
      expect(mockSelectChain.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockEqChain.order).toHaveBeenCalledWith('category', { ascending: true })
      expect(mockOrderChain.order).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('should handle empty add-ons list', async () => {
      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: [], 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed')
      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: null, 
          error: dbError 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })

    it('should handle null data from database', async () => {
      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: null, 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })

    it('should handle Error objects in catch block', async () => {
      const customError = new Error('Custom error message')
      mockSupabase.from.mockImplementation(() => {
        throw customError
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })

    it('should handle non-Error objects in catch block', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw 'String error'
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })

    it('should handle add-ons with different categories', async () => {
      const mockAddOns = [
        AddOnFactory.surfLesson({ category: 'activity' }),
        AddOnFactory.yogaClass({ category: 'wellness' }),
        AddOnFactory.bikeRental({ category: 'activity' }),
        AddOnFactory.surfLesson({ 
          id: 'addon-4',
          name: 'Massage',
          category: 'wellness',
          price: 80,
          duration: '1 hour'
        })
      ]

      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: mockAddOns, 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toHaveLength(4)

      // Verify ordering by category then name
      expect(mockEqChain.order).toHaveBeenCalledWith('category', { ascending: true })
      expect(mockOrderChain.order).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('should handle add-ons with complete data structure', async () => {
      const completeAddOn = AddOnFactory.surfLesson({ 
          id: 'addon-complete',
          name: 'Complete Surf Package',
          description: 'Full day surf experience with equipment and instruction',
          category: 'activity',
          price: 150,
          duration: '8 hours',
          max_participants: 4,
          requirements: 'Basic swimming skills',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        })

      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: [completeAddOn], 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toHaveLength(1)
      expect(data.addOns[0]).toEqual(completeAddOn)
    })
  })

  describe('OPTIONS /api/add-ons', () => {
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
      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: [AddOnFactory.surfLesson()], 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('addOns')
      expect(Array.isArray(data.addOns)).toBe(true)
    })

    it('should handle large number of add-ons efficiently', async () => {
      const manyAddOns = Array.from({ length: 50 }, (_, i) => 
        AddOnFactory.surfLesson({ 
          id: `addon-${i}`, 
          name: `Add On ${i}`,
          category: i % 2 === 0 ? 'activity' : 'wellness'
        })
      )

      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: manyAddOns, 
          error: null 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const startTime = Date.now()
      const response = await GET()
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(500) // Should complete within 500ms
      
      const data = await response.json()
      expect(data.addOns).toHaveLength(50)
    })

    it('should handle database timeout gracefully', async () => {
      const timeoutError = new Error('Connection timeout')
      timeoutError.name = 'TimeoutError'

      const mockOrderChain = {
        order: jest.fn().mockReturnValue({ 
          data: null, 
          error: timeoutError 
        })
      }

      const mockEqChain = {
        order: jest.fn().mockReturnValue(mockOrderChain)
      }

      const mockSelectChain = {
        eq: jest.fn().mockReturnValue(mockEqChain)
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.addOns).toEqual([])
    })
  })
})
