/**
 * Page Stats API Route Tests
 * Feature: cms-page-stats-api
 *
 * Tests for the /api/admin/cms/page-stats route that combines data from
 * page_sections, page_content, and homepage_sections tables.
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/cms/page-stats/route';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

import { supabaseAdmin } from '@/lib/supabase';

describe('GET /api/admin/cms/page-stats', () => {
  let mockRequest: NextRequest;
  const mockSupabaseFrom = supabaseAdmin.from as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock NextRequest
    mockRequest = {
      cookies: {
        get: jest.fn(),
      },
    } as any;
  });

  describe('Authentication', () => {
    it('should return 401 when admin_auth cookie is missing', async () => {
      (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when admin_auth cookie is incorrect', async () => {
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: 'wrong_password' });
      process.env.ADMIN_PASSWORD = 'correct_password';

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should allow access with correct admin_auth cookie', async () => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;

      // Mock empty database responses
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
    });
  });

  describe('Page Sections Data', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should count page_sections for each page', async () => {
      const mockPageSections = [
        { page_slug: 'homepage', updated_at: '2024-01-01T00:00:00Z' },
        { page_slug: 'homepage', updated_at: '2024-01-02T00:00:00Z' },
        { page_slug: 'flow', updated_at: '2024-01-03T00:00:00Z' },
        { page_slug: 'surf-weeks', updated_at: '2024-01-04T00:00:00Z' },
        { page_slug: 'surf-weeks', updated_at: '2024-01-05T00:00:00Z' },
        { page_slug: 'surf-weeks', updated_at: '2024-01-06T00:00:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'page_sections' ? mockPageSections : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats.homepage.count).toBe(2);
      expect(data.stats.flow.count).toBe(1);
      expect(data.stats['surf-weeks'].count).toBe(3);
      expect(data.stats.play.count).toBe(0);
    });

    it('should include surf-weeks in the pages list', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.stats).toHaveProperty('surf-weeks');
    });
  });

  describe('Legacy page_content Data', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should count legacy page_content data', async () => {
      const mockPageContent = [
        { page_slug: 'about', updated_at: '2024-01-01T00:00:00Z' },
        { page_slug: 'about', updated_at: '2024-01-02T00:00:00Z' },
        { page_slug: 'contact', updated_at: '2024-01-03T00:00:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'page_content' ? mockPageContent : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.about.count).toBe(2);
      expect(data.stats.contact.count).toBe(1);
    });
  });

  describe('Legacy homepage_sections Data', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should count homepage_sections for homepage only', async () => {
      const mockHomepageSections = [
        { section_type: 'hero', updated_at: '2024-01-01T00:00:00Z' },
        { section_type: 'features', updated_at: '2024-01-02T00:00:00Z' },
        { section_type: 'testimonials', updated_at: '2024-01-03T00:00:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'homepage_sections' ? mockHomepageSections : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.homepage.count).toBe(3);
      expect(data.stats.flow.count).toBe(0);
    });

    it('should not count homepage_sections for non-homepage pages', async () => {
      const mockHomepageSections = [
        { section_type: 'hero', updated_at: '2024-01-01T00:00:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'homepage_sections' ? mockHomepageSections : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.stats.flow.count).toBe(0);
      expect(data.stats.surf.count).toBe(0);
      expect(data.stats['surf-weeks'].count).toBe(0);
    });
  });

  describe('Combined Data Sources', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should combine counts from all three sources', async () => {
      const mockPageSections = [
        { page_slug: 'homepage', updated_at: '2024-01-01T00:00:00Z' },
        { page_slug: 'flow', updated_at: '2024-01-02T00:00:00Z' },
      ];

      const mockPageContent = [
        { page_slug: 'flow', updated_at: '2024-01-03T00:00:00Z' },
        { page_slug: 'surf', updated_at: '2024-01-04T00:00:00Z' },
      ];

      const mockHomepageSections = [
        { section_type: 'hero', updated_at: '2024-01-05T00:00:00Z' },
        { section_type: 'features', updated_at: '2024-01-06T00:00:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data:
              table === 'page_sections'
                ? mockPageSections
                : table === 'page_content'
                ? mockPageContent
                : table === 'homepage_sections'
                ? mockHomepageSections
                : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      // homepage: 1 from page_sections + 2 from homepage_sections = 3
      expect(data.stats.homepage.count).toBe(3);
      // flow: 1 from page_sections + 1 from page_content = 2
      expect(data.stats.flow.count).toBe(2);
      // surf: 1 from page_content = 1
      expect(data.stats.surf.count).toBe(1);
    });
  });

  describe('Last Modified Calculation', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should return null lastModified when no sections exist', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.stats.homepage.lastModified).toBeNull();
      expect(data.stats.flow.lastModified).toBeNull();
    });

    it('should calculate lastModified as the most recent updated_at', async () => {
      const mockPageSections = [
        { page_slug: 'flow', updated_at: '2024-01-01T10:00:00Z' },
        { page_slug: 'flow', updated_at: '2024-01-05T15:30:00Z' },
        { page_slug: 'flow', updated_at: '2024-01-03T12:00:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'page_sections' ? mockPageSections : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.stats.flow.lastModified).toBe('2024-01-05T15:30:00.000Z');
    });

    it('should calculate lastModified across all data sources', async () => {
      const mockPageSections = [
        { page_slug: 'homepage', updated_at: '2024-01-01T10:00:00Z' },
      ];

      const mockPageContent = [
        { page_slug: 'homepage', updated_at: '2024-01-03T12:00:00Z' },
      ];

      const mockHomepageSections = [
        { section_type: 'hero', updated_at: '2024-01-05T15:30:00Z' },
      ];

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data:
              table === 'page_sections'
                ? mockPageSections
                : table === 'page_content'
                ? mockPageContent
                : table === 'homepage_sections'
                ? mockHomepageSections
                : [],
            error: null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      // Should pick the latest date from all sources
      expect(data.stats.homepage.lastModified).toBe('2024-01-05T15:30:00.000Z');
    });
  });

  describe('All Pages Coverage', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });
    });

    it('should return stats for all expected pages', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.stats).toHaveProperty('homepage');
      expect(data.stats).toHaveProperty('flow');
      expect(data.stats).toHaveProperty('play');
      expect(data.stats).toHaveProperty('surf');
      expect(data.stats).toHaveProperty('surf-weeks');
      expect(data.stats).toHaveProperty('about');
      expect(data.stats).toHaveProperty('contact');
    });

    it('should initialize all pages with count 0 and null lastModified when no data', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      const pages = ['homepage', 'flow', 'play', 'surf', 'surf-weeks', 'about', 'contact'];
      pages.forEach(page => {
        expect(data.stats[page]).toEqual({
          count: 0,
          lastModified: null,
        });
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should continue when page_sections query fails', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'page_sections' ? null : [],
            error: table === 'page_sections' ? { message: 'Table not found' } : null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      // Should still return success with data from other tables
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle page_content query errors gracefully', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'page_content' ? null : [],
            error: table === 'page_content' ? { message: 'Error' } : null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle homepage_sections query errors gracefully', async () => {
      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: table === 'homepage_sections' ? null : [],
            error: table === 'homepage_sections' ? { message: 'Error' } : null,
          }),
        }),
      }));

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 on unexpected errors', async () => {
      (mockRequest.cookies.get as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Unexpected error' });
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });
    });

    it('should return correct response structure', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('stats');
      expect(typeof data.success).toBe('boolean');
      expect(typeof data.stats).toBe('object');
    });

    it('should return stats with count and lastModified for each page', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      Object.values(data.stats).forEach((stat: any) => {
        expect(stat).toHaveProperty('count');
        expect(stat).toHaveProperty('lastModified');
        expect(typeof stat.count).toBe('number');
        expect(stat.lastModified === null || typeof stat.lastModified === 'string').toBe(true);
      });
    });
  });

  describe('Database Queries', () => {
    beforeEach(() => {
      const correctPassword = 'heiwa_admin_2024';
      (mockRequest.cookies.get as jest.Mock).mockReturnValue({ value: correctPassword });
      process.env.ADMIN_PASSWORD = correctPassword;
    });

    it('should query page_sections with correct filters', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: mockSelect,
      }));

      await GET(mockRequest);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('page_sections');
      expect(mockSelect).toHaveBeenCalledWith('page_slug, updated_at');
    });

    it('should query page_content with correct filters', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: mockSelect,
      }));

      await GET(mockRequest);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('page_content');
      expect(mockSelect).toHaveBeenCalledWith('page_slug, updated_at');
    });

    it('should query homepage_sections with correct filters', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      mockSupabaseFrom.mockImplementation((table: string) => ({
        select: mockSelect,
      }));

      await GET(mockRequest);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('homepage_sections');
      expect(mockSelect).toHaveBeenCalledWith('section_type, updated_at');
    });

    it('should filter for active records only', async () => {
      const mockEq = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabaseFrom.mockReturnValue({
        select: mockSelect,
      });

      await GET(mockRequest);

      // Should call .eq('is_active', true) for each table query
      expect(mockEq).toHaveBeenCalledWith('is_active', true);
      // Called 3 times: page_sections, page_content, homepage_sections
      expect(mockEq).toHaveBeenCalledTimes(3);
    });
  });
});
