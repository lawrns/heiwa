// Contract test for Admin API GET /availability endpoint
// This test validates the API contract and should FAIL until admin API is available

import { adminApi } from '@/lib/admin-api';

describe('Admin API /availability Contract', () => {
  describe('GET /api/wordpress/availability', () => {
    const validRoomId = 'room-1';
    const validCheckIn = '2025-02-01';
    const validCheckOut = '2025-02-03';

    test('should return availability status for valid request', async () => {
      // This test will fail until admin API is available
      const response = await adminApi.checkAvailability(validRoomId, validCheckIn, validCheckOut);

      // Contract validation
      expect(response).toHaveProperty('available');
      expect(typeof response.available).toBe('boolean');

      // If available, should have price
      if (response.available) {
        expect(response).toHaveProperty('price');
        expect(typeof response.price).toBe('number');
        expect(response.price).toBeGreaterThan(0);
      }

      // Optional message field
      if (response.message !== undefined) {
        expect(typeof response.message).toBe('string');
      }
    });

    test('should handle invalid date ranges', async () => {
      // Test with check-out before check-in
      const response = await adminApi.checkAvailability(validRoomId, validCheckOut, validCheckIn);

      // Should handle gracefully - either return unavailable or throw handled error
      expect(response).toHaveProperty('available');
      expect(typeof response.available).toBe('boolean');
    });

    test('should handle invalid room IDs', async () => {
      const response = await adminApi.checkAvailability('invalid-room-id', validCheckIn, validCheckOut);

      // Should handle gracefully
      expect(response).toHaveProperty('available');
      expect(typeof response.available).toBe('boolean');
    });

    test('should handle API errors gracefully', async () => {
      // Test error handling - should return unavailable status instead of throwing
      const response = await adminApi.checkAvailability(validRoomId, validCheckIn, validCheckOut);

      // Should not throw, should return proper response structure
      expect(response).toHaveProperty('available');
      expect(typeof response.available).toBe('boolean');

      // Should have message explaining unavailability
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    });

    test('should return consistent response structure', async () => {
      const response = await adminApi.checkAvailability(validRoomId, validCheckIn, validCheckOut);

      // Validate response matches expected interface
      expect(response).toMatchObject({
        available: expect.any(Boolean),
        message: expect.any(String),
      });

      // Price is optional and only present when available is true
      if (response.available && response.price !== undefined) {
        expect(typeof response.price).toBe('number');
      }
    });

    test('should validate date format requirements', async () => {
      // Test with valid ISO date format
      const response = await adminApi.checkAvailability(validRoomId, '2025-02-01', '2025-02-03');

      expect(response).toHaveProperty('available');
      expect(typeof response.available).toBe('boolean');
    });
  });
});
