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
      const mockParticipants = [
        {
          id: 'enrollment-1',
          client_id: 'client-1',
          surf_camp_id: 'camp-1',
          status: 'confirmed',
          clients: {
            id: 'client-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockParticipants, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/assignments/participants?surf_camp_id=camp-1')
      const response = await GETParticipants(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.participants).toEqual(mockParticipants)
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

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockRooms, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/assignments/rooms')
      const response = await GETRooms(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.rooms).toEqual(mockRooms)
    })
  })

  describe('GET /api/assignments', () => {
    it('should fetch room assignments', async () => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          room_id: 'room-1',
          enrollment_id: 'enrollment-1',
          bed_number: 1,
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockAssignments, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/assignments?surf_camp_id=camp-1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.assignments).toEqual(mockAssignments)
    })
  })

  describe('POST /api/assignments', () => {
    it('should save room assignments', async () => {
      const assignmentsData = {
        surf_camp_id: 'camp-1',
        assignments: [
          {
            room_id: 'room-1',
            enrollment_id: 'enrollment-1',
            bed_number: 1,
          },
        ],
      }

      const mockUpsert = {
        upsert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: assignmentsData.assignments, error: null })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockUpsert)

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











