import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '@/app/api/bookings/route'
import { bookingService } from '@/lib/services/booking.service'

jest.mock('@/lib/services/booking.service', () => ({
  bookingService: {
    createRoomBooking: jest.fn(),
    createSurfWeekBooking: jest.fn(),
    getBookings: jest.fn(),
  },
}))

const mockBookingService = bookingService as any

describe('/api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/bookings', () => {
    it('creates a room booking (success)', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: true,
        bookingId: 'booking-123',
        clientId: 'client-123',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          room_id: 'room-1',
          start_date: '2026-02-01',
          end_date: '2026-02-03',
          participants: [{ firstName: 'John', lastName: 'Doe' }],
          clientName: 'John Doe',
          email: 'john@example.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.booking.id).toBe('booking-123')
      expect(data.data.client.id).toBe('client-123')
    })

    it('creates a surf week booking (success)', async () => {
      mockBookingService.createSurfWeekBooking.mockResolvedValue({
        success: true,
        bookingId: 'booking-456',
        clientId: 'client-456',
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          camp_id: 'camp-1',
          participants: [{ firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }],
          pricing: { total: 500 },
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.booking.id).toBe('booking-456')
      expect(data.data.client.id).toBe('client-456')
    })

    it('returns 400 when bookingService rejects input', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: false,
        error: 'Missing required fields: room_id, start_date, end_date, clientName, email',
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ participants: [{ firstName: 'John', lastName: 'Doe' }] }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(typeof data.error).toBe('string')
    })
  })

  describe('OPTIONS /api/bookings', () => {
    it('should return correct CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    })

    it('returns correct CORS headers + empty body', async () => {
      const response = await OPTIONS()
      const text = await response.text()

      expect(text).toBe('')
    })
  })
})
