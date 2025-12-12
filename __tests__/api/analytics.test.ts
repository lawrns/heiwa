/**
 * Analytics API Tests
 * Tests for /api/analytics endpoints
 */

import { NextRequest } from 'next/server'
import { GET as GETRevenue } from '@/app/api/analytics/revenue/route'
import { GET as GETOccupancy } from '@/app/api/analytics/occupancy/route'
import { GET as GETClients } from '@/app/api/analytics/clients/route'
import { GET as GETBookings } from '@/app/api/analytics/bookings/route'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}))

const mockSupabaseAdmin = require('@/lib/supabase').supabaseAdmin

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/analytics/revenue', () => {
    it('should fetch revenue data', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          total_amount: 100,
          created_at: '2025-01-01T00:00:00Z',
          payment_status: 'paid',
        },
        {
          id: 'booking-2',
          total_amount: 200,
          created_at: '2025-01-15T00:00:00Z',
          payment_status: 'completed',
        },
      ]

      // Route chain: .select().in().order()
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockBookings, error: null }),
          }),
        }),
      })

      const request = new NextRequest('http://localhost/api/analytics/revenue')
      const response = await GETRevenue(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('totalRevenue')
    })
  })

  describe('GET /api/analytics/occupancy', () => {
    it('should fetch occupancy data', async () => {
      // Occupancy route makes 2 queries: rooms with .eq(), then room_assignments with .select()
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [{ id: 'room-1', name: 'Room 1', capacity: 4, is_active: true }], error: null }),
            }),
          }
        }
        if (table === 'room_assignments') {
          return {
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        return { select: jest.fn() }
      })

      const request = new NextRequest('http://localhost/api/analytics/occupancy')
      const response = await GETOccupancy(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('overallOccupancyRate')
    })
  })

  describe('GET /api/analytics/clients', () => {
    it('should fetch client growth data', async () => {
      const mockClients = [
        { id: 'client-1', created_at: '2025-01-01T00:00:00Z' },
        { id: 'client-2', created_at: '2025-01-15T00:00:00Z' },
      ]

      // Clients route: .select().order() (no date filters without params)
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
        }),
      })

      const request = new NextRequest('http://localhost/api/analytics/clients')
      const response = await GETClients(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('growth')
    })
  })

  describe('GET /api/analytics/bookings', () => {
    it('should fetch booking trends', async () => {
      const mockBookings = [
        { id: 'booking-1', status: 'confirmed', created_at: '2025-01-01T00:00:00Z' },
        { id: 'booking-2', status: 'pending', created_at: '2025-01-15T00:00:00Z' },
      ]

      // Bookings route: .select().order() (no date filters without params)
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockBookings, error: null }),
        }),
      })

      const request = new NextRequest('http://localhost/api/analytics/bookings')
      const response = await GETBookings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('statusCounts')
    })
  })
})











