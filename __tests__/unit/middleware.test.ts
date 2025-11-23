/**
 * Middleware Tests
 * Tests for middleware.ts authentication and route protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextResponse
const mockNext = jest.fn(() => ({ type: 'next' }))
const mockRedirect = jest.fn((url: URL) => ({ type: 'redirect', url }))

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: mockNext,
      redirect: mockRedirect,
    },
  }
})

describe('Admin Middleware', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      ADMIN_PASSWORD: 'test-admin-password',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Route Protection', () => {
    beforeEach(() => {
      mockNext.mockClear()
      mockRedirect.mockClear()
    })

    it('should allow access to /admin/login without authentication', () => {
      const request = new NextRequest('http://localhost:3000/admin/login')
      middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should redirect unauthenticated users from /admin to login', () => {
      const request = new NextRequest('http://localhost:3000/admin')
      middleware(request)

      expect(mockRedirect).toHaveBeenCalled()
      const redirectCall = mockRedirect.mock.calls[0][0]
      expect(redirectCall.pathname).toBe('/admin/login')
    })

    it('should redirect unauthenticated users from /admin/bookings to login', () => {
      const request = new NextRequest('http://localhost:3000/admin/bookings')
      middleware(request)

      expect(mockRedirect).toHaveBeenCalled()
    })

    it('should allow authenticated users to access /admin routes', () => {
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: 'admin_auth=test-admin-password',
        },
      })
      middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should allow authenticated users to access /admin/bookings', () => {
      const request = new NextRequest('http://localhost:3000/admin/bookings', {
        headers: {
          cookie: 'admin_auth=test-admin-password',
        },
      })
      middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('Cookie Validation', () => {
    it('should reject invalid password in cookie', () => {
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: 'admin_auth=wrong-password',
        },
      })
      middleware(request)

      expect(mockRedirect).toHaveBeenCalled()
    })

    it('should reject missing cookie', () => {
      const request = new NextRequest('http://localhost:3000/admin')
      middleware(request)

      expect(mockRedirect).toHaveBeenCalled()
    })

    it('should use NEXT_PUBLIC_ADMIN_PASSWORD if ADMIN_PASSWORD not set', () => {
      const originalAdminPassword = process.env.ADMIN_PASSWORD
      delete process.env.ADMIN_PASSWORD
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD = 'public-password'

      const request = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: 'admin_auth=public-password',
        },
      })
      middleware(request)

      expect(mockNext).toHaveBeenCalled()

      // Restore
      if (originalAdminPassword) {
        process.env.ADMIN_PASSWORD = originalAdminPassword
      }
      delete process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    })

    it('should use default password if neither env var is set', () => {
      const originalAdminPassword = process.env.ADMIN_PASSWORD
      const originalPublicPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      delete process.env.ADMIN_PASSWORD
      delete process.env.NEXT_PUBLIC_ADMIN_PASSWORD

      const request = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: 'admin_auth=heiwa_admin_2024',
        },
      })
      middleware(request)

      expect(mockNext).toHaveBeenCalled()

      // Restore
      if (originalAdminPassword) {
        process.env.ADMIN_PASSWORD = originalAdminPassword
      }
      if (originalPublicPassword) {
        process.env.NEXT_PUBLIC_ADMIN_PASSWORD = originalPublicPassword
      }
    })
  })

  describe('Non-Admin Routes', () => {
    it('should allow access to non-admin routes', () => {
      const request = new NextRequest('http://localhost:3000/')
      middleware(request)

      // Middleware only processes /admin routes, so this should pass through
      expect(mockNext).toHaveBeenCalled()
    })

    it('should allow access to /api routes', () => {
      const request = new NextRequest('http://localhost:3000/api/bookings')
      middleware(request)

      // Middleware only processes /admin routes
      expect(mockNext).toHaveBeenCalled()
    })

    it('should allow access to /rooms routes', () => {
      const request = new NextRequest('http://localhost:3000/rooms')
      middleware(request)

      // Middleware only processes /admin routes
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle /admin/(auth)/login path', () => {
      const request = new NextRequest('http://localhost:3000/admin/(auth)/login')
      middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should handle nested admin routes', () => {
      const request = new NextRequest('http://localhost:3000/admin/cms/pages', {
        headers: {
          cookie: 'admin_auth=test-admin-password',
        },
      })
      middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should handle admin routes with query parameters', () => {
      const request = new NextRequest('http://localhost:3000/admin/bookings?status=pending', {
        headers: {
          cookie: 'admin_auth=test-admin-password',
        },
      })
      middleware(request)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })
})

