/**
 * Image Upload API Tests
 * Tests for /api/upload endpoints
 */

import { NextRequest } from 'next/server'
import { POST, DELETE } from '@/app/api/upload/route'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'test/path.jpg' }, error: null })),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/test/path.jpg' },
        })),
        remove: jest.fn(() => Promise.resolve({ error: null })),
      })),
    },
  },
}))

describe('Image Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/upload', () => {
    it('should upload an image file', async () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'room-images')
      formData.append('path', 'featured')

      const request = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('url')
      expect(data.data.bucket).toBe('room-images')
    })

    it('should validate file type', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'room-images')

      const request = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('image')
    })

    it('should validate file size', async () => {
      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'room-images')

      const request = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('size')
    })

    it('should handle upload errors', async () => {
      ;(supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
        upload: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Upload failed' } })),
        getPublicUrl: jest.fn(),
      })

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'room-images')

      const request = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/upload', () => {
    it('should delete an uploaded file', async () => {
      const request = new NextRequest('http://localhost/api/upload?path=test/path.jpg&bucket=room-images', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should require path parameter', async () => {
      const request = new NextRequest('http://localhost/api/upload?bucket=room-images', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})


