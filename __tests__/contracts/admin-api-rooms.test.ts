// Contract test for Admin API GET /rooms endpoint
// This test validates the API contract and should FAIL until admin API is available

import { adminApi } from '@/lib/admin-api';

describe('Admin API /rooms Contract', () => {
  describe('GET /api/wordpress/rooms', () => {
    test('should return array of rooms with required fields', async () => {
      // This test will fail until admin API is available
      const rooms = await adminApi.getRooms();

      // Contract validation
      expect(Array.isArray(rooms)).toBe(true);

      if (rooms.length > 0) {
        const room = rooms[0];

        // Required fields per contract
        expect(room).toHaveProperty('id');
        expect(typeof room.id).toBe('string');

        expect(room).toHaveProperty('name');
        expect(typeof room.name).toBe('string');

        expect(room).toHaveProperty('capacity');
        expect(typeof room.capacity).toBe('number');
        expect(room.capacity).toBeGreaterThan(0);

        expect(room).toHaveProperty('price_per_night');
        expect(typeof room.price_per_night).toBe('number');
        expect(room.price_per_night).toBeGreaterThan(0);

        expect(room).toHaveProperty('booking_type');
        expect(['whole', 'perBed']).toContain(room.booking_type);

        // Optional fields
        if (room.amenities) {
          expect(Array.isArray(room.amenities)).toBe(true);
        }

        if (room.featured_image) {
          expect(typeof room.featured_image).toBe('string');
        }

        if (room.description) {
          expect(typeof room.description).toBe('string');
        }
      }
    });

    test('should handle API errors gracefully', async () => {
      // Test error handling - should return empty array instead of throwing
      const rooms = await adminApi.getRooms();

      // Should not throw, should return empty array on error
      expect(Array.isArray(rooms)).toBe(true);
    });

    test('should return valid room data structure', async () => {
      const rooms = await adminApi.getRooms();

      // Validate each room matches expected structure
      rooms.forEach(room => {
        expect(room).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          capacity: expect.any(Number),
          price_per_night: expect.any(Number),
          booking_type: expect.stringMatching(/^(whole|perBed)$/),
        });

        // Validate optional fields if present
        if (room.amenities !== undefined) {
          expect(Array.isArray(room.amenities)).toBe(true);
          room.amenities.forEach(amenity => {
            expect(typeof amenity).toBe('string');
          });
        }

        if (room.featured_image !== undefined) {
          expect(typeof room.featured_image).toBe('string');
          // Should be a valid URL or data URI
          expect(room.featured_image).toMatch(/^https?:\/\/|data:/);
        }

        if (room.description !== undefined) {
          expect(typeof room.description).toBe('string');
        }
      });
    });
  });
});

