/**
 * Rooms API Integration Tests
 * Tests for GET /api/rooms endpoint
 */

import { NextResponse } from 'next/server';
import { GET, OPTIONS } from '@/app/api/rooms/route';

// Mock supabase admin client
const mockSupabaseFrom = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseOrder = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  },
}));

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  measurePerformance: jest.fn((name: string, fn: () => Promise<any>) => fn()),
}));

// Re-import after mocks
import { supabaseAdmin } from '@/lib/supabase';

describe('Rooms API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // GET /api/rooms
  // ==========================================================================

  describe('GET /api/rooms', () => {
    it('should return rooms list with success response', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          name: 'Ocean View Suite',
          description: 'Beautiful ocean view room',
          capacity: 2,
          booking_type: 'whole',
          pricing: { standard: 150, offSeason: 120 },
          amenities: ['wifi', 'ac'],
          images: ['https://example.com/room1.jpg'],
          is_active: true,
          bed_types: ['queen'],
        },
        {
          id: 'room-2',
          name: 'Garden Room',
          description: 'Peaceful garden room',
          capacity: 4,
          booking_type: 'per-bed',
          pricing: { standard: 200, offSeason: 160 },
          amenities: ['wifi', 'balcony'],
          images: ['https://example.com/room2.jpg'],
          is_active: true,
          bed_types: ['twin', 'twin'],
        },
      ];

      // Override the mock for this test
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockRooms, error: null }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rooms).toHaveLength(2);
      expect(data.data.rooms[0].name).toBe('Ocean View Suite');
    });

    it('should transform room data correctly', async () => {
      const mockRoom = {
        id: 'room-1',
        name: 'Test Room',
        description: 'Test description',
        capacity: 3,
        booking_type: 'whole',
        pricing: { standard: 100, offSeason: 80 },
        amenities: ['wifi'],
        images: ['https://example.com/image.jpg'],
        is_active: true,
        bed_types: ['double'],
      };

      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockRoom], error: null }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      const room = data.data.rooms[0];
      expect(room.id).toBe('room-1');
      expect(room.name).toBe('Test Room');
      expect(room.capacity).toBe(3);
      expect(room.bookingType).toBe('whole');
      expect(room.isActive).toBe(true);
      expect(room.bedTypes).toEqual(['double']);
      expect(room.price_per_night).toBe(100);
      expect(room.price_per_night_standard).toBe(100);
      expect(room.price_per_night_off_season).toBe(80);
    });

    it('should fix Supabase bucket URLs', async () => {
      const mockRoom = {
        id: 'room-1',
        name: 'Test Room',
        capacity: 2,
        images: [
          'https://example.supabase.co/storage/v1/object/public/rooms/image.jpg',
        ],
        is_active: true,
      };

      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockRoom], error: null }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      const room = data.data.rooms[0];
      expect(room.images[0]).toContain('/room-images/');
      expect(room.images[0]).not.toContain('/rooms/');
    });

    it('should filter out yoga dome images', async () => {
      const mockRoom = {
        id: 'room-1',
        name: 'Test Room',
        capacity: 2,
        images: [
          'https://example.com/room.jpg',
          'https://example.com/yoga_dome.jpg',
          'https://example.com/yoga-dome.jpg',
        ],
        is_active: true,
      };

      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockRoom], error: null }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      const room = data.data.rooms[0];
      expect(room.images).toHaveLength(1);
      expect(room.images[0]).toBe('https://example.com/room.jpg');
    });

    it('should handle database errors gracefully', async () => {
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch rooms');
    });

    it('should return empty array when no rooms exist', async () => {
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rooms).toHaveLength(0);
    });

    it('should include CORS headers', async () => {
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const response = await GET();

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should include cache headers', async () => {
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const response = await GET();

      expect(response.headers.get('Cache-Control')).toContain('public');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=300');
    });
  });

  // ==========================================================================
  // OPTIONS /api/rooms
  // ==========================================================================

  describe('OPTIONS /api/rooms', () => {
    it('should return CORS headers', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
    });
  });

  // ==========================================================================
  // Response Shape
  // ==========================================================================

  describe('Response Shape', () => {
    it('should have consistent success response shape', async () => {
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('rooms');
      expect(Array.isArray(data.data.rooms)).toBe(true);
    });

    it('should have consistent error response shape', async () => {
      (supabaseAdmin.from as jest.Mock) = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Error' },
            }),
          }),
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
    });
  });
});
