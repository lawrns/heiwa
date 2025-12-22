/**
 * Admin API Integration Tests
 * Feature: comprehensive-testing
 * 
 * Tests for admin API routes including authentication, CRUD operations, and authorization
 */

import { NextRequest } from 'next/server';

// Mock Supabase admin client
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  rateLimiters: {
    auth: jest.fn(() => ({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 })),
  },
  getClientIP: jest.fn(() => '127.0.0.1'),
  createRateLimitHeaders: jest.fn(() => ({})),
}));

// Mock admin auth
jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn(() => null),
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Admin API Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, ADMIN_PASSWORD: 'test_admin_password' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Admin Login API', () => {
    let loginHandler: { GET: Function; POST: Function };

    beforeEach(async () => {
      loginHandler = await import('@/app/api/admin/login/route');
    });

    describe('GET /api/admin/login', () => {
      it('should return authenticated: true when valid cookie present', async () => {
        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'GET',
        });
        
        // Mock cookie
        Object.defineProperty(request, 'cookies', {
          value: {
            get: jest.fn((name: string) => 
              name === 'admin_auth' ? { value: 'test_admin_password' } : undefined
            ),
          },
        });

        const response = await loginHandler.GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.authenticated).toBe(true);
      });

      it('should return authenticated: false when no cookie present', async () => {
        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'GET',
        });
        
        Object.defineProperty(request, 'cookies', {
          value: {
            get: jest.fn(() => undefined),
          },
        });

        const response = await loginHandler.GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.authenticated).toBe(false);
      });

      it('should return authenticated: false when cookie value is wrong', async () => {
        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'GET',
        });
        
        Object.defineProperty(request, 'cookies', {
          value: {
            get: jest.fn((name: string) => 
              name === 'admin_auth' ? { value: 'wrong_password' } : undefined
            ),
          },
        });

        const response = await loginHandler.GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.authenticated).toBe(false);
      });
    });

    describe('POST /api/admin/login', () => {
      it('should return success with valid password', async () => {
        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: 'test_admin_password' }),
        });

        const response = await loginHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Login successful');
      });

      it('should return 401 with invalid password', async () => {
        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: 'wrong_password' }),
        });

        const response = await loginHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Invalid password');
      });

      it('should return 401 with empty password', async () => {
        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: '' }),
        });

        const response = await loginHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.message).toBe('Invalid password');
      });

      it('should handle rate limiting', async () => {
        const { rateLimiters } = require('@/lib/rate-limiter');
        rateLimiters.auth.mockReturnValueOnce({
          allowed: false,
          remaining: 0,
          resetAt: Date.now() + 60000,
        });

        const request = new NextRequest('http://localhost/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: 'test_admin_password' }),
        });

        const response = await loginHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.message).toContain('Too many login attempts');
      });
    });
  });

  describe('Admin Rooms API', () => {
    let roomsHandler: { GET: Function; POST: Function };

    beforeEach(async () => {
      jest.resetModules();
      roomsHandler = await import('@/app/api/admin/rooms/route');
    });

    describe('GET /api/admin/rooms', () => {
      it('should return all rooms including inactive', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        
        const mockRooms = [
          { id: 'room-1', name: 'Ocean View', capacity: 2, is_active: true, images: [], amenities: [] },
          { id: 'room-2', name: 'Garden Room', capacity: 3, is_active: false, images: [], amenities: [] },
        ];

        supabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockRooms, error: null }),
        });

        const response = await roomsHandler.GET();
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.rooms).toHaveLength(2);
      });

      it('should handle database errors gracefully', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        
        supabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        });

        const response = await roomsHandler.GET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
      });
    });

    describe('POST /api/admin/rooms', () => {
      it('should create a new room with valid data', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        
        const newRoom = {
          id: 'room-new',
          name: 'New Room',
          capacity: 4,
          is_active: true,
        };

        supabaseAdmin.from.mockReturnValue({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: newRoom, error: null }),
        });

        const request = new NextRequest('http://localhost/api/admin/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'New Room',
            capacity: 4,
            price_per_night: 100,
          }),
        });

        const response = await roomsHandler.POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.room).toBeDefined();
      });

      it('should return 400 when name is missing', async () => {
        const request = new NextRequest('http://localhost/api/admin/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            capacity: 4,
          }),
        });

        const response = await roomsHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('required');
      });

      it('should return 400 when capacity is missing', async () => {
        const request = new NextRequest('http://localhost/api/admin/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'New Room',
          }),
        });

        const response = await roomsHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });
    });
  });

  describe('Admin Pages API', () => {
    let pagesHandler: { GET: Function; POST: Function };

    beforeEach(async () => {
      jest.resetModules();
      pagesHandler = await import('@/app/api/admin/pages/route');
    });

    describe('GET /api/admin/pages', () => {
      it('should return page content when authenticated', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        const { requireAdminAuth } = require('@/lib/admin-auth');
        
        requireAdminAuth.mockReturnValue(null);

        const mockContent = [
          { id: '1', page_slug: 'flow', section: 'hero', content: {} },
        ];

        supabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockContent, error: null }),
        });

        const request = new NextRequest('http://localhost/api/admin/pages?page_slug=flow');

        const response = await pagesHandler.GET(request);
        const data = await response.json();

        expect(data.success).toBe(true);
      });

      it('should return error when not authenticated', async () => {
        const { requireAdminAuth } = require('@/lib/admin-auth');
        
        // Mock auth failure
        const authErrorResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
        });
        requireAdminAuth.mockReturnValue(authErrorResponse);

        const request = new NextRequest('http://localhost/api/admin/pages');

        const response = await pagesHandler.GET(request);

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/admin/pages', () => {
      it('should create page content with valid data', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        const { requireAdminAuth } = require('@/lib/admin-auth');
        
        requireAdminAuth.mockReturnValue(null);

        supabaseAdmin.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          insert: jest.fn().mockReturnThis(),
        });

        // Mock insert chain
        const mockInsertResult = { data: { id: 'new-1' }, error: null };
        supabaseAdmin.from.mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }).mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockInsertResult),
        });

        const request = new NextRequest('http://localhost/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_slug: 'flow',
            section_type: 'hero',
            content: { title: 'Test' },
          }),
        });

        const response = await pagesHandler.POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
      });

      it('should return 400 when required fields are missing', async () => {
        const { requireAdminAuth } = require('@/lib/admin-auth');
        requireAdminAuth.mockReturnValue(null);

        const request = new NextRequest('http://localhost/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_slug: 'flow',
            // Missing section_type and content
          }),
        });

        const response = await pagesHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Missing required fields');
      });

      it('should return 400 for invalid page_slug', async () => {
        const { requireAdminAuth } = require('@/lib/admin-auth');
        requireAdminAuth.mockReturnValue(null);

        const request = new NextRequest('http://localhost/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_slug: 'invalid-page',
            section_type: 'hero',
            content: { title: 'Test' },
          }),
        });

        const response = await pagesHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid page_slug');
      });

      it('should return 400 for invalid section_type', async () => {
        const { requireAdminAuth } = require('@/lib/admin-auth');
        requireAdminAuth.mockReturnValue(null);

        const request = new NextRequest('http://localhost/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_slug: 'flow',
            section_type: 'invalid-section',
            content: { title: 'Test' },
          }),
        });

        const response = await pagesHandler.POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid section_type');
      });
    });
  });

  describe('Authorization Checks', () => {
    it('should require authentication for protected routes', async () => {
      const { requireAdminAuth } = require('@/lib/admin-auth');
      
      // Mock auth failure
      const authErrorResponse = new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
      requireAdminAuth.mockReturnValue(authErrorResponse);

      const pagesHandler = await import('@/app/api/admin/pages/route');
      const request = new NextRequest('http://localhost/api/admin/pages');

      const response = await pagesHandler.GET(request);

      expect(response.status).toBe(401);
    });
  });
});
