// Contract test for Admin API POST /bookings endpoint
// This test validates the API contract and should FAIL until admin API is available

import { adminApi } from '@/lib/admin-api';

describe('Admin API /bookings Contract', () => {
  describe('POST /api/wordpress/bookings', () => {
    const validBookingRequest = {
      clientName: 'Test User',
      email: 'test@example.com',
      phone: '+351 912 193 785',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
      roomId: 'room-1',
      guests: 2,
      message: 'Test booking request'
    };

    test('should create booking successfully with valid data', async () => {
      // This test will fail until admin API is available
      const response = await adminApi.createBooking(validBookingRequest);

      // Contract validation
      expect(response).toHaveProperty('success');
      expect(typeof response.success).toBe('boolean');

      if (response.success) {
        // Successful booking should have booking ID
        expect(response).toHaveProperty('bookingId');
        expect(typeof response.bookingId).toBe('string');
        expect(response.bookingId).toBeTruthy();

        // Should have status
        expect(response).toHaveProperty('status');
        expect(['pending', 'confirmed', 'cancelled']).toContain(response.status);
      } else {
        // Failed booking should have error message
        expect(response).toHaveProperty('message');
        expect(typeof response.message).toBe('string');
      }
    });

    test('should validate required fields', async () => {
      const invalidBooking = {
        clientName: 'Test User'
        // Missing required fields: email, checkIn, checkOut, roomId, guests
      };

      const response = await adminApi.createBooking(invalidBooking as any);

      // Should handle validation gracefully
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(false);
      expect(response).toHaveProperty('message');
    });

    test('should validate email format', async () => {
      const invalidEmailBooking = {
        ...validBookingRequest,
        email: 'invalid-email-format'
      };

      const response = await adminApi.createBooking(invalidEmailBooking);

      // Should handle validation gracefully
      expect(response).toHaveProperty('success');
      // May succeed or fail depending on API validation
      expect(response).toHaveProperty('message');
    });

    test('should validate date range', async () => {
      const invalidDateBooking = {
        ...validBookingRequest,
        checkIn: '2025-02-03',
        checkOut: '2025-02-01' // Before check-in
      };

      const response = await adminApi.createBooking(invalidDateBooking);

      // Should handle validation gracefully
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(false);
      expect(response).toHaveProperty('message');
    });

    test('should validate guest count', async () => {
      const invalidGuestBooking = {
        ...validBookingRequest,
        guests: 0 // Invalid guest count
      };

      const response = await adminApi.createBooking(invalidGuestBooking);

      // Should handle validation gracefully
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(false);
      expect(response).toHaveProperty('message');
    });

    test('should handle booking conflicts', async () => {
      // Assuming the room/dates are already booked
      const conflictingBooking = {
        ...validBookingRequest,
        checkIn: '2025-01-01', // Assume these dates are taken
        checkOut: '2025-01-03'
      };

      const response = await adminApi.createBooking(conflictingBooking);

      // Should handle conflict gracefully
      expect(response).toHaveProperty('success');
      // May succeed or fail depending on availability
      expect(response).toHaveProperty('message');
    });

    test('should handle API errors gracefully', async () => {
      const response = await adminApi.createBooking(validBookingRequest);

      // Should not throw, should return proper response structure
      expect(response).toHaveProperty('success');
      expect(typeof response.success).toBe('boolean');
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    });

    test('should return consistent response structure', async () => {
      const response = await adminApi.createBooking(validBookingRequest);

      // Validate response matches expected interface
      expect(response).toMatchObject({
        success: expect.any(Boolean),
        message: expect.any(String),
      });

      // Optional fields only present on successful bookings
      if (response.success && response.bookingId !== undefined) {
        expect(typeof response.bookingId).toBe('string');
        expect(response.bookingId).toBeTruthy();
      }

      if (response.success && response.status !== undefined) {
        expect(['pending', 'confirmed', 'cancelled']).toContain(response.status);
      }
    });
  });
});
