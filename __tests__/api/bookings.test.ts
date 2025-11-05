import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '@/app/api/bookings/route'
import { supabase } from '@/lib/supabase'
import { BookingFactory, FormDataFactory } from '../factories'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}))

const mockSupabase = supabase as any

describe('/api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/bookings', () => {
    const mockRoomBooking = {
      booking_type: 'room',
      room_id: 'room-1',
      start_date: '2026-02-01',
      end_date: '2026-02-03',
      participants: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+351 912 193 785'
        }
      ],
      guests: 1,
      pricing: {
        total: 60,
        breakdown: {
          room: 60,
          add_ons: 0
        }
      }
    }

    const mockSurfWeekBooking = {
      booking_type: 'surf_week',
      camp_id: 'camp-1',
      participants: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+351 912 193 786',
          surfExperience: 'beginner'
        }
      ],
      guests: 1,
      pricing: {
        total: 500,
        breakdown: {
          camp: 500,
          add_ons: 0
        }
      }
    }

    it('should create a room booking successfully', async () => {
      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })
      const mockClient = { id: 'client-123', first_name: 'John', last_name: 'Doe' }

      // Mock booking insertion
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(mockRoomBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.booking_id).toBe('booking-123')
      expect(data.data.booking_type).toBe('room')
      expect(data.data.participants_created).toBe(1)
      expect(data.data.status).toBe('confirmed')
    })

    it('should create a surf week booking successfully', async () => {
      const mockBooking = BookingFactory.confirmed({ id: 'booking-456' })
      const mockClient = { id: 'client-456', first_name: 'Jane', last_name: 'Smith' }

      // Mock booking insertion
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'surf_week_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(mockSurfWeekBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.booking_id).toBe('booking-456')
      expect(data.data.booking_type).toBe('surf_week')
      expect(data.data.participants_created).toBe(1)
    })

    it('should handle multiple participants', async () => {
      const multiParticipantBooking = {
        ...mockRoomBooking,
        participants: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+351 912 193 785'
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: '+351 912 193 786'
          }
        ],
        guests: 2
      }

      const mockBooking = BookingFactory.confirmed({ id: 'booking-789' })
      const mockClients = [
        { id: 'client-789', first_name: 'John', last_name: 'Doe' },
        { id: 'client-790', first_name: 'Jane', last_name: 'Smith' }
      ]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: mockClients.shift(), 
                  error: null 
                })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(multiParticipantBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.participants_created).toBe(2)
    })

    it('should validate missing booking_type', async () => {
      const invalidBooking = { ...mockRoomBooking }
      delete invalidBooking.booking_type

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields: booking_type and participants')
    })

    it('should validate missing participants', async () => {
      const invalidBooking = { ...mockRoomBooking, participants: [] }

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields: booking_type and participants')
    })

    it('should validate missing room booking fields', async () => {
      const invalidBooking = {
        booking_type: 'room',
        participants: mockRoomBooking.participants
        // Missing room_id, start_date, end_date
      }

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields for room booking: room_id, start_date, end_date')
    })

    it('should validate missing surf week booking fields', async () => {
      const invalidBooking = {
        booking_type: 'surf_week',
        participants: mockSurfWeekBooking.participants
        // Missing camp_id
      }

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required field for surf week booking: camp_id')
    })

    it('should handle booking creation failure', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: new Error('DB Error') })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(mockRoomBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create booking')
    })

    it('should handle client creation failure', async () => {
      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: new Error('Client Error') })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(mockRoomBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create participant 1')
    })

    it('should handle room assignment creation failure', async () => {
      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })
      const mockClient = { id: 'client-123', first_name: 'John', last_name: 'Doe' }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockRejectedValue(new Error('Assignment Error'))
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(mockRoomBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Assignment Error')
    })

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should handle participant with all optional fields', async () => {
      const completeParticipantBooking = {
        ...mockRoomBooking,
        participants: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+351 912 193 785',
            dateOfBirth: '1990-01-01',
            emergencyContactName: 'Jane Doe',
            emergencyContactPhone: '+351 912 193 786',
            dietaryRestrictions: 'Vegetarian',
            medicalConditions: 'None',
            surfExperience: 'beginner'
          }
        ]
      }

      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })
      const mockClient = { id: 'client-123', first_name: 'John', last_name: 'Doe' }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(completeParticipantBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle booking with add-ons', async () => {
      const bookingWithAddOns = {
        ...mockRoomBooking,
        add_ons: [
          { id: 'addon-1', name: 'Surf Lesson', price: 50 },
          { id: 'addon-2', name: 'Bike Rental', price: 25 }
        ],
        pricing: {
          total: 135,
          breakdown: {
            room: 60,
            add_ons: 75
          }
        }
      }

      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })
      const mockClient = { id: 'client-123', first_name: 'John', last_name: 'Doe' }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingWithAddOns),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle booking with source URL', async () => {
      const bookingWithSource = {
        ...mockRoomBooking,
        source_url: 'https://heiwa-house.com/rooms'
      }

      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })
      const mockClient = { id: 'client-123', first_name: 'John', last_name: 'Doe' }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingWithSource),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('OPTIONS /api/bookings', () => {
    it('should return correct CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
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
      const mockBooking = BookingFactory.confirmed({ id: 'booking-123' })
      const mockClient = { id: 'client-123', first_name: 'John', last_name: 'Doe' }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockClient, error: null })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          booking_type: 'room',
          room_id: 'room-1',
          start_date: '2026-02-01',
          end_date: '2026-02-03',
          participants: [
            {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+351 912 193 785'
            }
          ],
          guests: 1
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('booking_id')
      expect(data.data).toHaveProperty('booking_type')
      expect(data.data).toHaveProperty('participants_created')
      expect(data.data).toHaveProperty('status')
    })

    it('should handle large number of participants efficiently', async () => {
      const manyParticipants = Array.from({ length: 10 }, (_, i) => ({
        firstName: `Participant${i}`,
        lastName: `Doe${i}`,
        email: `participant${i}@example.com`,
        phone: `+351 912 193 78${i}`
      }))

      const largeBooking = {
        booking_type: 'room',
        room_id: 'room-1',
        start_date: '2026-02-01',
        end_date: '2026-02-03',
        participants: manyParticipants,
        guests: 10
      }

      const mockBooking = BookingFactory.confirmed({ id: 'booking-large' })
      const mockClients = manyParticipants.map((_, i) => ({
        id: `client-${i}`,
        first_name: `Participant${i}`,
        last_name: `Doe${i}`
      }))

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockBooking, error: null })
              })
            })
          }
        }
        if (table === 'clients') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: mockClients.shift(), 
                  error: null 
                })
              })
            })
          }
        }
        if (table === 'room_assignments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: {}, error: null })
              })
            })
          }
        }
        return {
          insert: jest.fn(),
          select: jest.fn(),
          single: jest.fn()
        }
      })

      const startTime = Date.now()
      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(largeBooking),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(2000) // Should complete within 2 seconds
      
      const data = await response.json()
      expect(data.data.participants_created).toBe(10)
    })
  })
})
