import { GET, OPTIONS } from '@/app/api/rooms/availability/route'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { RoomFactory } from '../factories'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      }))
    }))
  }
}))

const mockSupabase = supabase as any

describe('/api/rooms/availability', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/rooms/availability', () => {
    it('should return room availability for valid date range', async () => {
      const mockRooms = [
        RoomFactory.dorm({ id: 'room-1', capacity: 6 }),
        RoomFactory.private({ id: 'room-2', capacity: 1 })
      ]
      const mockBookings: Array<{ room_id: string; check_in_date: string; check_out_date: string }> = []

      mockSupabase.from.mockImplementation((table: string) => {
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
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        return {
          select: jest.fn(),
          eq: jest.fn(),
          gte: jest.fn(),
          lte: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01&end_date=2026-02-03&guests=2')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.available_rooms).toHaveLength(1) // Only room that can accommodate 2 guests
    })

    it('should handle missing start_date parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/rooms/availability?end_date=2026-02-03')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required parameters: start_date and end_date')
    })

    it('should handle missing end_date parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required parameters: start_date and end_date')
    })

    it('should default guests to 1 when not provided', async () => {
      const mockRooms = [RoomFactory.dorm({ id: 'room-1', capacity: 6 })]
      const mockBookings: Array<{ room_id: string; check_in_date: string; check_out_date: string }> = []

      mockSupabase.from.mockImplementation((table: string) => {
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
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        return {
          select: jest.fn(),
          eq: jest.fn(),
          gte: jest.fn(),
          lte: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01&end_date=2026-02-03')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle database errors when fetching rooms', async () => {
      const dbError = new Error('Database connection failed')
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01&end_date=2026-02-03')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch rooms')
    })

    it('should handle empty rooms list', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: [], 
                error: null 
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: [], 
                    error: null 
                  })
                })
              })
            })
          }
        }
        return {
          select: jest.fn(),
          eq: jest.fn(),
          gte: jest.fn(),
          lte: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01&end_date=2026-02-03')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.available_rooms).toEqual([])
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01&end_date=2026-02-03')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unexpected error')
    })
  })

  describe('OPTIONS /api/rooms/availability', () => {
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
      const mockRooms = [RoomFactory.dorm({ id: 'room-1', capacity: 6 })]
      const mockBookings: Array<{ room_id: string; check_in_date: string; check_out_date: string }> = []

      mockSupabase.from.mockImplementation((table: string) => {
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
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ 
                    data: mockBookings, 
                    error: null 
                  })
                })
              })
            })
          }
        }
        return {
          select: jest.fn(),
          eq: jest.fn(),
          gte: jest.fn(),
          lte: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/rooms/availability?start_date=2026-02-01&end_date=2026-02-03')
      const response = await GET(request)
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('available_rooms')
      expect(data.data).toHaveProperty('requested_dates')
      expect(data.data).toHaveProperty('total_rooms')
    })
  })
})
