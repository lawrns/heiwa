/**
 * Enrollments API Tests
 * Tests for /api/enrollments endpoints
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/enrollments/route'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(),
        })),
        range: jest.fn(),
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

describe('Enrollments API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/enrollments', () => {
    it('should fetch enrollments for a surf camp', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment-1',
          surf_camp_id: 'camp-1',
          client_id: 'client-1',
          status: 'confirmed',
          skill_level: 'beginner',
          created_at: '2025-01-20T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockEnrollments, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/enrollments?surf_camp_id=camp-1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.enrollments).toEqual(mockEnrollments)
    })
  })

  describe('POST /api/enrollments', () => {
    it('should create a new enrollment', async () => {
      const enrollmentData = {
        surf_camp_id: 'camp-1',
        client_id: 'client-1',
        status: 'pending',
        skill_level: 'beginner',
        dietary_restrictions: 'Vegetarian',
      }

      const mockEnrollment = {
        id: 'enrollment-1',
        ...enrollmentData,
        created_at: '2025-01-20T00:00:00Z',
      }

      const mockInsert = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockEnrollment, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockInsert)

      const request = new NextRequest('http://localhost/api/enrollments', {
        method: 'POST',
        body: JSON.stringify(enrollmentData),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.enrollment).toEqual(mockEnrollment)
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({ client_id: 'client-1' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/enrollments', () => {
    it('should update an enrollment', async () => {
      const updateData = {
        id: 'enrollment-1',
        status: 'confirmed',
        skill_level: 'intermediate',
      }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { ...updateData }, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/enrollments', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('DELETE /api/enrollments', () => {
    it('should delete an enrollment', async () => {
      const mockDelete = {
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/enrollments?id=enrollment-1', {
        method: 'DELETE',
      })
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})










