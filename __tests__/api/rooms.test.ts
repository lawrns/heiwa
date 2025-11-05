import { NextRequest } from 'next/server'
import { GET, OPTIONS } from '@/app/api/rooms/route'
import { supabase } from '@/lib/supabase'
import { RoomFactory } from '../factories'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}))

const mockSupabase = supabase as any

describe('/api/rooms', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/rooms', () => {
    it('should return active rooms with correct transformation', async () => {
      const mockRooms = [
        RoomFactory.dorm({ 
          id: 'room-1',
          name: 'Dorm room',
          capacity: 6,
          pricing: { standard: 30 },
          images: ['/images/dorm.jpg'],
          amenities: ['wifi', 'kitchen']
        }),
        RoomFactory.private({ 
          id: 'room-2',
          name: 'Private Room',
          capacity: 1,
          pricing: { standard: 80 },
          images: ['/images/private.jpg'],
          amenities: ['wifi']
        }),
        RoomFactory.suite({ 
          id: 'room-3',
          name: 'Suite',
          capacity: 2,
          pricing: { offSeason: 120 },
          images: ['/images/suite.jpg'],
          amenities: ['wifi', 'kitchen', 'ocean-view']
        })
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: mockRooms, 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.rooms).toHaveLength(3)

      // Check first room transformation
      const firstRoom = data.data.rooms[0]
      expect(firstRoom.id).toBe('room-1')
      expect(firstRoom.name).toBe('Dorm room')
      expect(firstRoom.capacity).toBe(6)
      expect(firstRoom.price_per_night).toBe(30)
      expect(firstRoom.booking_type).toBe('whole')
      expect(firstRoom.featured_image).toBe('/images/dorm.jpg')
      expect(firstRoom.amenities).toEqual(['wifi', 'kitchen'])
      expect(firstRoom.is_active).toBe(true)

      // Check third room uses offSeason pricing
      const thirdRoom = data.data.rooms[2]
      expect(thirdRoom.price_per_night).toBe(120)
    })

    it('should filter out inactive rooms', async () => {
      const mockRooms = [
        RoomFactory.dorm({ isActive: true }),
        RoomFactory.private({ isActive: false }), // Should be filtered out
        RoomFactory.suite({ is_active: true }),
        RoomFactory.cave({ is_active: false }) // Should be filtered out
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: mockRooms, 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(data.data.rooms).toHaveLength(2)
      expect(data.data.rooms.map((r: any) => r.id)).toEqual(['room-dorm', 'room-suite'])
    })

    it('should handle rooms with default values', async () => {
      const mockRoom = {
        id: 'room-minimal',
        name: 'Minimal Room',
        capacity: 2,
        // No pricing, images, amenities, description
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: [mockRoom], 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      const room = data.data.rooms[0]
      expect(room.description).toBe('Comfortable accommodation with capacity for 2 guests')
      expect(room.price_per_night).toBe(80) // Default price
      expect(room.booking_type).toBe('whole') // Default booking type
      expect(room.amenities).toEqual([]) // Default empty array
      expect(room.featured_image).toBeNull() // No images
      expect(room.images).toEqual([]) // Default empty array
    })

    it('should handle empty rooms list', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: [], 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.rooms).toHaveLength(0)
    })

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed')
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: null, 
            error: dbError 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch rooms')
    })

    it('should handle null data from database', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.rooms).toHaveLength(0)
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
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockRejectedValue(customError)
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Custom error message')
    })

    it('should handle non-Error objects in catch block', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockRejectedValue('String error')
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('should call supabase with correct parameters', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: [], 
            error: null 
          })
        })
      })

      await GET()

      expect(mockSupabase.from).toHaveBeenCalledWith('rooms')
      expect(mockSupabase.from('').select).toHaveBeenCalledWith('*')
      expect(mockSupabase.from('').select('').order).toHaveBeenCalledWith('name')
    })

    it('should handle rooms with mixed field names', async () => {
      const mockRooms = [
        { id: 'room-1', name: 'Room 1', capacity: 2, isActive: true },
        { id: 'room-2', name: 'Room 2', capacity: 3, is_active: true },
        { id: 'room-3', name: 'Room 3', capacity: 4, isActive: false },
        { id: 'room-4', name: 'Room 4', capacity: 5, is_active: false }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: mockRooms, 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      // Should only include active rooms (both isActive and is_active true)
      expect(data.data.rooms).toHaveLength(2)
      expect(data.data.rooms.map((r: any) => r.id)).toEqual(['room-1', 'room-2'])
    })

    it('should handle complex pricing structures', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          name: 'Room with standard pricing',
          capacity: 2,
          pricing: { standard: 100, offSeason: 80 }
        },
        {
          id: 'room-2', 
          name: 'Room with only offSeason',
          capacity: 2,
          pricing: { offSeason: 90 }
        },
        {
          id: 'room-3',
          name: 'Room with no pricing',
          capacity: 2
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: mockRooms, 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      expect(data.data.rooms[0].price_per_night).toBe(100) // Uses standard
      expect(data.data.rooms[1].price_per_night).toBe(90)  // Uses offSeason
      expect(data.data.rooms[2].price_per_night).toBe(80)  // Uses default
    })
  })

  describe('OPTIONS /api/rooms', () => {
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
          order: jest.fn().mockResolvedValue({ 
            data: [RoomFactory.dorm()], 
            error: null 
          })
        })
      })

      const response = await GET()
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('rooms')
      expect(Array.isArray(data.data.rooms)).toBe(true)

      // Verify room structure
      const room = data.data.rooms[0]
      expect(room).toHaveProperty('id')
      expect(room).toHaveProperty('name')
      expect(room).toHaveProperty('description')
      expect(room).toHaveProperty('capacity')
      expect(room).toHaveProperty('booking_type')
      expect(room).toHaveProperty('price_per_night')
      expect(room).toHaveProperty('amenities')
      expect(room).toHaveProperty('featured_image')
      expect(room).toHaveProperty('images')
      expect(room).toHaveProperty('is_active')
    })

    it('should handle large number of rooms efficiently', async () => {
      const manyRooms = Array.from({ length: 100 }, (_, i) => 
        RoomFactory.dorm({ id: `room-${i}`, name: `Room ${i}` })
      )

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ 
            data: manyRooms, 
            error: null 
          })
        })
      })

      const startTime = Date.now()
      const response = await GET()
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
      
      const data = await response.json()
      expect(data.data.rooms).toHaveLength(100)
    })
  })
})
