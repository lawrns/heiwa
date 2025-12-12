import { NextRequest } from 'next/server'
import { GET, OPTIONS } from '@/app/api/rooms/route'
import { RoomFactory } from '../factories'

jest.mock('@/lib/monitoring', () => ({
  measurePerformance: (_name: string, fn: () => any) => fn(),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabaseAdmin } = require('@/lib/supabase')
const mockSupabaseAdmin = supabaseAdmin as any

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

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockRooms, error: null }),
          }),
        }),
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
      expect(firstRoom.bookingType).toBe('whole')
      expect(firstRoom.featured_image).toBe('/images/dorm.jpg')
      expect(firstRoom.amenities).toEqual(['wifi', 'kitchen'])
      expect(firstRoom.isActive).toBe(true)

      // Check third room uses offSeason pricing
      const thirdRoom = data.data.rooms[2]
      expect(thirdRoom.price_per_night).toBe(120)
    })

    it('should handle rooms with default values', async () => {
      const mockRoom = {
        id: 'room-minimal',
        name: 'Minimal Room',
        capacity: 2,
        // No pricing, images, amenities, description
      }

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockRoom], error: null }),
          }),
        }),
      })

      const response = await GET()
      const data = await response.json()

      const room = data.data.rooms[0]
      expect(room.description).toBe('Comfortable accommodation with capacity for 2 guests')
      expect(room.price_per_night).toBeNull()
      expect(room.bookingType).toBe('whole') // Default booking type
      expect(room.amenities).toEqual([]) // Default empty array
      expect(room.featured_image).toBeNull() // No images
      expect(room.images).toEqual([]) // Default empty array
    })

  })

  describe('OPTIONS /api/rooms', () => {
    it('should return correct CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization, X-Heiwa-API-Key')
    })

    it('should return empty body', async () => {
      const response = await OPTIONS()
      const text = await response.text()

      expect(text).toBe('')
    })
  })
})
