/**
 * Surf Camps [id] API Tests
 * Tests for /api/surf-camps/[id] endpoints (GET, PUT)
 */

import { NextRequest } from 'next/server'
import { GET, PUT, OPTIONS } from '@/app/api/surf-camps/[id]/route'
import { supabaseAdmin } from '@/lib/supabase'
import { SurfCampFactory } from '../factories'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
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
    })),
  },
}))

const mockSupabase = supabaseAdmin as any

describe('/api/surf-camps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/surf-camps/[id]', () => {
    it('should return surf camp details with enrollment count', async () => {
      const mockCamp = SurfCampFactory.beginner({
        id: 'camp-1',
        name: 'Test Camp',
        max_participants: 18,
      })

      // Mock surf camp query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCamp,
              error: null,
            }),
          }),
        }),
      })

      // Mock enrollment count query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 5,
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1')
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camp).toBeDefined()
      expect(data.data.surf_camp.confirmed_booked).toBe(5)
      expect(data.data.surf_camp.available_spots).toBe(13)
    })

    it('should return 404 when surf camp not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'non-existent' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/non-existent')
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Surf camp not found')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1')
      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/surf-camps/[id]', () => {
    const validUpdateData = {
      name: 'Updated Camp Name',
      description: 'Updated description',
      start_date: '2026-07-01',
      end_date: '2026-07-08',
      max_participants: 20,
      price: 550,
      level: 'Intermediate',
      includes: ['Accommodation', 'Surf Lessons'],
      images: ['https://example.com/image.jpg'],
      is_active: true,
    }

    it('should update surf camp successfully', async () => {
      const updatedCamp = {
        ...SurfCampFactory.beginner({ id: 'camp-1' }),
        ...validUpdateData,
        updated_at: new Date().toISOString(),
      }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedCamp,
                error: null,
              }),
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
      })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.surf_camp.name).toBe(validUpdateData.name)
      expect(data.data.surf_camp.price).toBe(validUpdateData.price)
    })

    it('should return 400 when required fields are missing', async () => {
      const invalidData = {
        name: 'Test',
        // Missing start_date, end_date, max_participants, price
      }

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
      })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Missing required fields')
    })

    it('should handle database update errors', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
      })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to update surf camp')
    })

    it('should handle invalid JSON in request body', async () => {
      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1', {
        method: 'PUT',
        body: 'invalid json',
      })

      await expect(PUT(request, { params })).rejects.toThrow()
    })

    it('should set updated_at timestamp', async () => {
      const updatedCamp = {
        ...SurfCampFactory.beginner({ id: 'camp-1' }),
        ...validUpdateData,
      }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedCamp,
                error: null,
              }),
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData),
      })
      await PUT(request, { params })

      const updateCall = mockSupabase.from().update
      expect(updateCall).toHaveBeenCalled()
      const updateData = updateCall.mock.calls[0][0]
      expect(updateData.updated_at).toBeDefined()
    })

    it('should handle optional fields with defaults', async () => {
      const minimalData = {
        name: 'Minimal Camp',
        start_date: '2026-07-01',
        end_date: '2026-07-08',
        max_participants: 18,
        price: 450,
      }

      const updatedCamp = {
        ...SurfCampFactory.beginner({ id: 'camp-1' }),
        ...minimalData,
        description: '',
        level: 'All Levels',
        includes: [],
        images: [],
        is_active: true,
      }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedCamp,
                error: null,
              }),
            }),
          }),
        }),
      })

      const params = Promise.resolve({ id: 'camp-1' })
      const request = new NextRequest('http://localhost:3000/api/surf-camps/camp-1', {
        method: 'PUT',
        body: JSON.stringify(minimalData),
      })
      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('OPTIONS /api/surf-camps/[id]', () => {
    it('should return correct CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PUT')
    })
  })
})

