/**
 * Assignments API Tests
 * Tests for /api/assignments endpoints
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/assignments/route'
import { GET as GETParticipants } from '@/app/api/assignments/participants/route'
import { GET as GETRooms } from '@/app/api/assignments/rooms/route'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}))

describe('Assignments API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/assignments/participants', () => {
    it('should fetch participants for a surf camp', async () => {
      const weekId = '11111111-1111-1111-1111-111111111111'

      const enrollments = [
        {
          id: 'enrollment-1',
          client_id: 'client-1',
          status: 'confirmed',
          skill_level: 'beginner',
          participant_name: 'John Doe',
          participant_email: 'john@example.com',
          participant_phone: '',
        },
      ]

      const clients = [
        {
          id: 'client-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '',
        },
      ]

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'surf_camp_enrollments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                in: jest.fn(() => Promise.resolve({ data: enrollments, error: null })),
              })),
            })),
          }
        }
        if (table === 'clients') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: clients, error: null })),
            })),
          }
        }
        if (table === 'room_assignments') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          }
        }
        return {}
      })

      const request = new NextRequest(`http://localhost/api/assignments/participants?weekId=${weekId}`)
      const response = await GETParticipants(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0]).toHaveProperty('id', 'enrollment-1')
    })
  })

  describe('GET /api/assignments/rooms', () => {
    it('should fetch available rooms', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          name: 'Dorm Room',
          capacity: 6,
          room_assignments: [],
        },
      ]

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'rooms') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ data: mockRooms, error: null })),
              })),
            })),
          }
        }

        if (table === 'room_assignments') {
          return {
            select: jest.fn(() => ({
              lte: jest.fn(() => ({
                gte: jest.fn(() => ({
                  eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
                })),
              })),
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          }
        }

        return {}
      })

      const request = new NextRequest('http://localhost/api/assignments/rooms')
      const response = await GETRooms(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
    })
  })

  describe('GET /api/assignments', () => {
    it('should fetch room assignments', async () => {
      const weekId = '11111111-1111-1111-1111-111111111111'

      const mockAssignments = [
        {
          id: 'assignment-1',
          room_id: 'room-1',
          enrollment_id: 'enrollment-1',
          bed_number: 1,
        },
      ]

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'room_assignments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: mockAssignments, error: null })),
            })),
          }
        }
        return {}
      })

      const request = new NextRequest(`http://localhost/api/assignments?weekId=${weekId}`)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST /api/assignments', () => {
    it('should save room assignments', async () => {
      const weekId = '11111111-1111-1111-1111-111111111111'

      const assignmentsData = {
        weekId,
        assignments: [
          {
            roomId: 'room-1',
            participantIds: ['enrollment-1'],
          },
        ],
      }

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'surf_camps') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: { start_date: '2025-01-01', end_date: '2025-01-08' }, error: null })),
              })),
            })),
          }
        }
        if (table === 'rooms') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => Promise.resolve({ data: [{ id: 'room-1', name: 'Dorm', capacity: 6 }], error: null })),
            })),
          }
        }
        if (table === 'room_assignments') {
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
            insert: jest.fn(() => Promise.resolve({ error: null })),
          }
        }
        if (table === 'surf_camp_enrollments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: { client_id: 'client-1', booking_id: null }, error: null })),
              })),
            })),
          }
        }
        return {}
      })

      const request = new NextRequest('http://localhost/api/assignments', {
        method: 'POST',
        body: JSON.stringify(assignmentsData),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})











