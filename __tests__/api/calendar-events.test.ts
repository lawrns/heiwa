/**
 * Calendar Events API Tests
 * Tests for /api/calendar-events endpoints
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/calendar-events/route'
import { GET as GETById, PUT, DELETE } from '@/app/api/calendar-events/[id]/route'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}))

describe('Calendar Events API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/calendar-events', () => {
    it('should fetch calendar events', async () => {
      const booking = {
        id: 'booking-1',
        items: [
          {
            type: 'room',
            dates: { checkIn: '2025-01-20', checkOut: '2025-01-22' },
          },
        ],
        status: 'confirmed',
        payment_status: 'paid',
        client_ids: ['client-1'],
        created_at: '2025-01-10T00:00:00Z',
      }

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'bookings') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [booking], error: null })),
            })),
          }
        }
        if (table === 'clients') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: [{ id: 'client-1', name: 'Test Guest' }], error: null })),
            })),
          }
        }
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: [], error: null })),
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }
        if (table === 'calendar_events') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }
        return {}
      })

      const request = new NextRequest('http://localhost/api/calendar-events')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data.events)).toBe(true)
      expect(data.data.events.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/calendar-events', () => {
    it('should create a new calendar event', async () => {
      const eventData = {
        title: 'Surf Lesson',
        start_date: '2025-01-20T10:00:00Z',
        end_date: '2025-01-20T12:00:00Z',
        event_type: 'surf_camp',
      }

      const mockEvent = {
        id: 'event-1',
        ...eventData,
        created_at: '2025-01-20T00:00:00Z',
      }

      const mockInsert = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockEvent, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockInsert)

      const request = new NextRequest('http://localhost/api/calendar-events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.event).toEqual(mockEvent)
    })
  })

  describe('GET /api/calendar-events/[id]', () => {
    it('should fetch a single calendar event', async () => {
      const mockEvent = {
        id: 'event-1',
        title: 'Surf Lesson',
        start_date: '2025-01-20T10:00:00Z',
        end_date: '2025-01-20T12:00:00Z',
        event_type: 'surf_camp',
      }

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockEvent, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/calendar-events/event-1')
      const response = await GETById(request, { params: Promise.resolve({ id: 'event-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.event).toEqual(mockEvent)
    })
  })

  describe('PUT /api/calendar-events/[id]', () => {
    it('should update a calendar event', async () => {
      const updateData = { title: 'Updated Surf Lesson' }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: 'event-1', ...updateData }, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/calendar-events/event-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'event-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('DELETE /api/calendar-events/[id]', () => {
    it('should delete a calendar event', async () => {
      const mockDelete = {
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/calendar-events/event-1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'event-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})











