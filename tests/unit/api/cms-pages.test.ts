/**
 * CMS Pages API Unit Tests
 * Tests for SEO settings save functionality and page metadata management
 */

import { NextRequest } from 'next/server'
import { GET, PUT } from '@/app/api/cms/pages/[slug]/route'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn(),
}))

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

describe('CMS Pages API - /api/cms/pages/[slug]', () => {
  // Mock functions
  const mockFrom = supabaseAdmin.from as jest.Mock
  const mockRequireAdminAuth = requireAdminAuth as jest.Mock

  // Test data
  const testSlug = 'about'
  const testPageData = {
    id: 1,
    slug: 'about',
    title: 'About Us',
    meta_description: 'Learn more about our company',
    meta_keywords: 'about, company, info',
    og_image: 'https://example.com/og-image.jpg',
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const createMockRequest = (url: string, method: string, body?: object): NextRequest => {
    return new NextRequest(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Helper to create a properly chained mock
  const createChainMock = (finalResult: { data: unknown; error: unknown }) => {
    const mockSingle = jest.fn().mockResolvedValue(finalResult)
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle, eq: jest.fn().mockReturnValue({ single: mockSingle }) })
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle, select: mockSelect })
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })

    return {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      update: mockUpdate,
      insert: mockInsert,
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default: auth passes for PUT requests
    mockRequireAdminAuth.mockReturnValue(null)
  })

  // ==========================================================================
  // GET Request Tests
  // ==========================================================================

  describe('GET /api/cms/pages/[slug]', () => {
    it('should return page metadata for existing page', async () => {
      const chain = createChainMock({ data: testPageData, error: null })
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: testPageData, error: null })
          })
        })
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'GET')
      const response = await GET(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(mockFrom).toHaveBeenCalledWith('pages_meta')
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(testPageData)
    })

    it('should return default values for non-existent page', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' }
            })
          })
        })
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/newpage', 'GET')
      const response = await GET(request, { params: Promise.resolve({ slug: 'newpage' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.slug).toBe('newpage')
      expect(data.data.title).toBe('Newpage')
      expect(data.data.meta_description).toBe('')
      expect(data.data.is_published).toBe(false)
    })

    it('should handle database errors', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'DATABASE_ERROR', message: 'Database connection failed' }
            })
          })
        })
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'GET')
      const response = await GET(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should handle unexpected errors', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'GET')
      const response = await GET(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })

  // ==========================================================================
  // PUT Request Tests - Authentication
  // ==========================================================================

  describe('PUT /api/cms/pages/[slug] - Authentication', () => {
    it('should require admin authentication', async () => {
      const authErrorResponse = { status: 401, json: () => Promise.resolve({ error: 'Unauthorized' }) }
      mockRequireAdminAuth.mockReturnValue(authErrorResponse)

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', {
        title: 'Updated Title',
      })
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })

      expect(mockRequireAdminAuth).toHaveBeenCalledWith(request)
      expect(response).toBe(authErrorResponse)
    })

    it('should allow access with valid admin auth', async () => {
      mockRequireAdminAuth.mockReturnValue(null)

      // Mock for checking if page exists
      const mockExistCheck = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
      // Mock for update
      const mockUpdateResult = jest.fn().mockResolvedValue({ data: testPageData, error: null })

      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: mockExistCheck
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: mockUpdateResult
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', {
        title: 'Updated Title',
        meta_description: 'Updated description',
      })
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })

      expect(mockRequireAdminAuth).toHaveBeenCalledWith(request)
      expect(response.status).toBe(200)
    })
  })

  // ==========================================================================
  // PUT Request Tests - Update Existing Page
  // ==========================================================================

  describe('PUT /api/cms/pages/[slug] - Update Existing', () => {
    it('should update SEO settings successfully', async () => {
      const updatedData = {
        title: 'Updated About Us',
        meta_description: 'Updated SEO description',
        meta_keywords: 'updated, keywords',
        og_image: 'https://example.com/new-og-image.jpg',
        is_published: true,
      }

      // Mock for checking if page exists
      const mockExistCheck = jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
      // Mock for update
      const mockUpdateResult = jest.fn().mockResolvedValue({
        data: { ...testPageData, ...updatedData },
        error: null
      })

      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: mockExistCheck
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: mockUpdateResult
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', updatedData)
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(updatedData.title)
    })

    it('should save seo_title field', async () => {
      const seoData = {
        title: 'Page Title with SEO',
        meta_description: 'SEO optimized description',
      }

      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...testPageData, ...seoData },
                  error: null
                })
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', seoData)
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(seoData.title)
    })

    it('should save seo_description field', async () => {
      const seoData = {
        title: 'Page Title',
        meta_description: 'This is the SEO description for search engines',
      }

      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...testPageData, ...seoData },
                  error: null
                })
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', seoData)
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.meta_description).toBe(seoData.meta_description)
    })
  })

  // ==========================================================================
  // PUT Request Tests - Create New Page
  // ==========================================================================

  describe('PUT /api/cms/pages/[slug] - Create New', () => {
    it('should create new page meta when it does not exist', async () => {
      const newPageData = {
        title: 'New Page Title',
        meta_description: 'New page description',
        meta_keywords: 'new, page',
        og_image: 'https://example.com/og.jpg',
        is_published: true,
      }

      // Mock for checking if page exists - returns null
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 2, slug: 'newpage', ...newPageData },
                error: null
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/newpage', 'PUT', newPageData)
      const response = await PUT(request, { params: Promise.resolve({ slug: 'newpage' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.slug).toBe('newpage')
    })

    it('should set is_published to false by default for new pages', async () => {
      const newPageData = {
        title: 'Unpublished Page',
        meta_description: 'Description',
      }

      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 3, slug: 'draft', ...newPageData, is_published: false },
                error: null
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/draft', 'PUT', newPageData)
      const response = await PUT(request, { params: Promise.resolve({ slug: 'draft' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.is_published).toBe(false)
    })
  })

  // ==========================================================================
  // PUT Request Tests - Error Handling
  // ==========================================================================

  describe('PUT /api/cms/pages/[slug] - Error Handling', () => {
    it('should handle database errors during update', async () => {
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database constraint violation' }
                })
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', {
        title: 'Test',
      })
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database constraint violation')
    })

    it('should handle database errors during insert', async () => {
      mockFrom
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Duplicate key violation' }
              })
            })
          })
        })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/newpage', 'PUT', {
        title: 'Test',
      })
      const response = await PUT(request, { params: Promise.resolve({ slug: 'newpage' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Duplicate key violation')
    })

    it('should handle unexpected errors', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'PUT', {
        title: 'Test',
      })
      const response = await PUT(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })

  // ==========================================================================
  // Response Format Tests
  // ==========================================================================

  describe('Response Format', () => {
    it('should return correct success response structure', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: testPageData, error: null })
          })
        })
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'GET')
      const response = await GET(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('slug')
      expect(data.data).toHaveProperty('title')
    })

    it('should return correct error response structure', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'ERROR', message: 'Test error' }
            })
          })
        })
      })

      const request = createMockRequest('http://localhost:3000/api/cms/pages/about', 'GET')
      const response = await GET(request, { params: Promise.resolve({ slug: testSlug }) })
      const data = await response.json()

      expect(data).toHaveProperty('success', false)
      expect(data).toHaveProperty('error')
    })
  })
})
