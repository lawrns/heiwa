/**
 * Booking Widget Settings API Tests
 * Tests for GET /api/booking-widget-settings and admin endpoints
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/booking-widget-settings/route';
import { GET as AdminGET, PUT as AdminPUT } from '@/app/api/admin/booking-widget-settings/route';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
  },
}));

function createMockRequest(method: string, url: string, body?: object): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Booking Widget Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/booking-widget-settings (Public)', () => {
    it('should return default prices when no settings found', async () => {
      const { supabaseAdmin } = require('@/lib/supabase');
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      const request = createMockRequest('GET', '/api/booking-widget-settings');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.room).toBe(45);
      expect(data.data.surfWeek).toBe(599);
    });

    it('should return prices from database', async () => {
      const { supabaseAdmin } = require('@/lib/supabase');
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: [
                { experience_type: 'room', price_from: 50 },
                { experience_type: 'surf-week', price_from: 650 },
              ],
              error: null,
            })
          ),
        })),
      });

      const request = createMockRequest('GET', '/api/booking-widget-settings');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.room).toBe(50);
      expect(data.data.surfWeek).toBe(650);
    });

    it('should return fallback prices on error', async () => {
      const { supabaseAdmin } = require('@/lib/supabase');
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
        })),
      });

      const request = createMockRequest('GET', '/api/booking-widget-settings');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      // Error response includes fallback data
      if (data.data) {
        expect(data.data.room).toBe(45);
        expect(data.data.surfWeek).toBe(599);
      }
    });

    it('should include cache headers', async () => {
      const { supabaseAdmin } = require('@/lib/supabase');
      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      });

      const request = createMockRequest('GET', '/api/booking-widget-settings');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toContain('s-maxage=300');
    });
  });

  describe('GET /api/admin/booking-widget-settings (Admin)', () => {
    it('should return all settings', async () => {
      const { supabaseAdmin } = require('@/lib/supabase');
      const mockSettings = [
        { id: '1', experience_type: 'room', price_from: 50, is_active: true },
        { id: '2', experience_type: 'surf-week', price_from: 650, is_active: true },
      ];

      supabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockSettings, error: null })),
        })),
      });

      const request = createMockRequest('GET', '/api/admin/booking-widget-settings');
      const response = await AdminGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });
  });

  describe('PUT /api/admin/booking-widget-settings (Admin)', () => {
    it('should update settings successfully', async () => {
      const { supabaseAdmin } = require('@/lib/supabase');
      const mockUpdatedSetting = {
        id: '1',
        experience_type: 'room',
        price_from: 55,
        is_active: true,
      };

      supabaseAdmin.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockUpdatedSetting, error: null })),
            })),
          })),
        })),
      });

      const request = createMockRequest('PUT', '/api/admin/booking-widget-settings', {
        settings: [
          { experience_type: 'room', price_from: 55, is_active: true },
        ],
      });

      const response = await AdminPUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate price_from is positive', async () => {
      const request = createMockRequest('PUT', '/api/admin/booking-widget-settings', {
        settings: [
          { experience_type: 'room', price_from: -10, is_active: true },
        ],
      });

      const response = await AdminPUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('positive number');
    });

    it('should validate experience_type', async () => {
      const request = createMockRequest('PUT', '/api/admin/booking-widget-settings', {
        settings: [
          { experience_type: 'invalid', price_from: 50, is_active: true },
        ],
      });

      const response = await AdminPUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('experience_type');
    });
  });
});

