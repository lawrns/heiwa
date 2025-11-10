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
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}))

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
        },
        {
          id: 'booking-2',
          total_amount: 200,
          created_at: '2025-01-15T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ data: mockBookings, error: null })),
              })),
              order: jest.fn(() => Promise.resolve({ data: mockBookings, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/analytics/revenue')
      const response = await GETRevenue(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('revenue')
    })
  })

  describe('GET /api/analytics/occupancy', () => {
    it('should fetch occupancy data', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/analytics/occupancy')
      const response = await GETOccupancy(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('occupancy')
    })
  })

  describe('GET /api/analytics/clients', () => {
    it('should fetch client growth data', async () => {
      const mockClients = [
        {
          id: 'client-1',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'client-2',
          created_at: '2025-01-15T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockClients, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

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
        {
          id: 'booking-1',
          status: 'confirmed',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'booking-2',
          status: 'pending',
          created_at: '2025-01-15T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockBookings, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/analytics/bookings')
      const response = await GETBookings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('trends')
    })
  })
})

