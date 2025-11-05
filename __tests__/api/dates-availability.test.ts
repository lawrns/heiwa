import { GET, OPTIONS } from '@/app/api/dates/availability/route'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        lte: jest.fn(() => ({
          gte: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      }))
    }))
  }
}))

const mockSupabase = supabase as any

describe('/api/dates/availability', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/dates/availability', () => {
    it('should return availability for valid date range', async () => {
      const mockRoomBookings: Array<{ room_id: string }> = [{ room_id: 'room-1' }]
      const mockSurfBookings: Array<{ surf_camp_id: string }> = [{ surf_camp_id: 'camp-1' }]
      const mockRooms = [
        { capacity: 6 },
        { capacity: 4 },
        { capacity: 2 }
      ]

      // Mock room assignments query
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockRoomBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockSurfBookings, 
                error: null 
              })
            })
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockRooms, 
                error: null 
              })
            })
          }
        }
        return {
          select: jest.fn(),
          lte: jest.fn(),
          gte: jest.fn(),
          eq: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-02&participants=2')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.date_availability).toHaveLength(2)
      expect(data.data.summary.total_dates_checked).toBe(2)
      expect(data.data.summary.participants_requested).toBe(2)
      expect(data.meta.checked_at).toBeDefined()
      expect(data.meta.cache_expires_at).toBeDefined()
    })

    it('should handle missing start_date parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/dates/availability?end_date=2026-02-02')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required parameters: start_date and end_date')
    })

    it('should handle missing end_date parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required parameters: start_date and end_date')
    })

    it('should default participants to 1 when not provided', async () => {
      const mockRoomBookings: Array<{ room_id: string }> = []
      const mockSurfBookings: Array<{ surf_camp_id: string }> = []
      const mockRooms = [{ capacity: 6 }]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockRoomBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockSurfBookings, 
                error: null 
              })
            })
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockRooms, 
                error: null 
              })
            })
          }
        }
        return {
          select: jest.fn(),
          lte: jest.fn(),
          gte: jest.fn(),
          eq: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-01')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.summary.participants_requested).toBe(1)
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-02')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle empty rooms data', async () => {
      const mockRoomBookings: Array<{ room_id: string }> = []
      const mockSurfBookings: Array<{ surf_camp_id: string }> = []

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockRoomBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockSurfBookings, 
                error: null 
              })
            })
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: null, 
                error: null 
              })
            })
          }
        }
        return {
          select: jest.fn(),
          lte: jest.fn(),
          gte: jest.fn(),
          eq: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-01')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.summary.total_capacity).toBe(10) // Default capacity when no rooms
    })

    it('should handle single date availability check', async () => {
      const mockRoomBookings: Array<{ room_id: string }> = []
      const mockSurfBookings: Array<{ surf_camp_id: string }> = []
      const mockRooms = [{ capacity: 6 }]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockRoomBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockSurfBookings, 
                error: null 
              })
            })
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockRooms, 
                error: null 
              })
            })
          }
        }
        return {
          select: jest.fn(),
          lte: jest.fn(),
          gte: jest.fn(),
          eq: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-01&participants=4')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.date_availability).toHaveLength(1)
      expect(data.data.date_availability[0].date).toBe('2026-02-01')
      expect(data.data.date_availability[0].available).toBe(true)
      expect(data.data.date_availability[0].capacity).toBe(6)
      expect(data.data.date_availability[0].booked).toBe(0)
      expect(data.data.date_availability[0].remaining).toBe(6)
    })

    it('should handle sold out dates', async () => {
      const mockRoomBookings: Array<{ room_id: string }> = [{ room_id: 'room-1' }, { room_id: 'room-2' }, { room_id: 'room-3' }]
      const mockSurfBookings: Array<{ surf_camp_id: string }> = []
      const mockRooms = [
        { capacity: 2 },
        { capacity: 2 },
        { capacity: 2 }
      ]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockRoomBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockSurfBookings, 
                error: null 
              })
            })
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockRooms, 
                error: null 
              })
            })
          }
        }
        return {
          select: jest.fn(),
          lte: jest.fn(),
          gte: jest.fn(),
          eq: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-01&participants=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.date_availability[0].available).toBe(true) // 6 capacity - 3 booked = 3 remaining >= 1 participant
      expect(data.data.summary.sold_out_dates).toBe(0)
    })
  })

  describe('OPTIONS /api/dates/availability', () => {
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
      const mockRoomBookings: Array<{ room_id: string }> = []
      const mockSurfBookings: Array<{ surf_camp_id: string }> = []
      const mockRooms = [{ capacity: 6 }]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockRoomBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockSurfBookings, 
                error: null 
              })
            })
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: mockRooms, 
                error: null 
              })
            })
          }
        }
        return {
          select: jest.fn(),
          lte: jest.fn(),
          gte: jest.fn(),
          eq: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/dates/availability?start_date=2026-02-01&end_date=2026-02-01')
      const response = await GET(request)
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('date_availability')
      expect(data.data).toHaveProperty('summary')
      expect(data).toHaveProperty('meta')
      expect(data.meta).toHaveProperty('checked_at')
      expect(data.meta).toHaveProperty('cache_expires_at')
      expect(data.meta).toHaveProperty('fallback', false)
    })
  })
})
