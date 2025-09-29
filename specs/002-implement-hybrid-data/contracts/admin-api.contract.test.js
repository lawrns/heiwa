// Contract tests for Admin API integration
// These tests validate the API contracts without implementation

const axios = require('axios');

const ADMIN_API_BASE = process.env.ADMIN_API_BASE || 'https://admin.heiwa.house/api/wordpress';
const API_KEY = process.env.HEIWA_API_KEY;

describe('Admin API Contracts', () => {
  const client = axios.create({
    baseURL: ADMIN_API_BASE,
    headers: {
      'X-Heiwa-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });

  describe('GET /rooms', () => {
    test('should return rooms array with required fields', async () => {
      // This test will fail until API is implemented
      const response = await client.get('/rooms');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data.rooms');
      expect(Array.isArray(response.data.data.rooms)).toBe(true);

      if (response.data.data.rooms.length > 0) {
        const room = response.data.data.rooms[0];
        expect(room).toHaveProperty('id');
        expect(room).toHaveProperty('name');
        expect(room).toHaveProperty('capacity');
        expect(room).toHaveProperty('price_per_night');
        expect(room).toHaveProperty('booking_type');
        expect(['whole', 'perBed']).toContain(room.booking_type);
      }
    });

    test('should require valid API key', async () => {
      const badClient = axios.create({
        baseURL: ADMIN_API_BASE,
        headers: {
          'X-Heiwa-API-Key': 'invalid-key',
          'Content-Type': 'application/json'
        }
      });

      await expect(badClient.get('/rooms')).rejects.toThrow();
    });
  });

  describe('GET /availability', () => {
    const validParams = {
      roomId: 'room-1',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03'
    };

    test('should return availability status', async () => {
      // This test will fail until API is implemented
      const response = await client.get('/availability', { params: validParams });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('available');
      expect(typeof response.data.available).toBe('boolean');

      if (response.data.available) {
        expect(response.data).toHaveProperty('price');
        expect(typeof response.data.price).toBe('number');
      }
    });

    test('should reject invalid date range', async () => {
      const invalidParams = {
        ...validParams,
        checkIn: '2025-02-03',
        checkOut: '2025-02-01' // Before check-in
      };

      await expect(client.get('/availability', { params: invalidParams }))
        .rejects.toMatchObject({
          response: { status: 400 }
        });
    });
  });

  describe('POST /bookings', () => {
    const validBooking = {
      clientName: 'Test User',
      email: 'test@example.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
      roomId: 'room-1',
      guests: 2
    };

    test('should create booking successfully', async () => {
      // This test will fail until API is implemented
      const response = await client.post('/bookings', validBooking);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('bookingId');
      expect(typeof response.data.bookingId).toBe('string');
    });

    test('should validate required fields', async () => {
      const invalidBooking = {
        clientName: 'Test User'
        // Missing required fields
      };

      await expect(client.post('/bookings', invalidBooking))
        .rejects.toMatchObject({
          response: { status: 400 }
        });
    });

    test('should handle booking conflicts', async () => {
      // Assuming room is already booked for these dates
      const conflictingBooking = {
        ...validBooking,
        checkIn: '2025-01-01', // Assume these dates are taken
        checkOut: '2025-01-03'
      };

      await expect(client.post('/bookings', conflictingBooking))
        .rejects.toMatchObject({
          response: { status: 409 }
        });
    });
  });
});

