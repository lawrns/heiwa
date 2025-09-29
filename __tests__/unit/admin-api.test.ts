// Unit tests for Admin API client
import { AdminApiClient } from '@/lib/admin-api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AdminApiClient', () => {
  let client: AdminApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new AdminApiClient();
  });

  describe('constructor', () => {
    test('should initialize with environment variables', () => {
      expect(client).toBeDefined();
      // Note: We can't easily test private properties, but the client should be created successfully
    });
  });

  describe('makeRequest', () => {
    test('should make successful GET request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({ success: true, data: { test: 'value' } }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await (client as any).makeRequest('/test');

      expect(mockFetch).toHaveBeenCalledWith('https://admin.heiwa.house/api/wordpress/test', {
        headers: {
          'Content-Type': 'application/json',
          'X-Heiwa-API-Key': 'heiwa_wp_test_key_2024_secure_deployment',
        },
      });
      expect(result).toEqual({ success: true, data: { test: 'value' } });
    });

    test('should handle request errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect((client as any).makeRequest('/test')).rejects.toThrow('Network error');
    });

    test('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server error'),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect((client as any).makeRequest('/test')).rejects.toThrow('Admin API request failed: 500 Internal Server Error');
    });

    test('should retry on server errors', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Server error'),
      };

      const mockSuccessResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({ success: true }),
      };

      // Fail twice, succeed on third attempt
      mockFetch
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await (client as any).makeRequest('/test');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });
  });

  describe('getRooms', () => {
    test('should return rooms on success', async () => {
      const mockRooms = [
        { id: '1', name: 'Room 1', capacity: 2, price_per_night: 100, booking_type: 'whole' }
      ];
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({ success: true, data: { rooms: mockRooms } }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getRooms();

      expect(result).toEqual(mockRooms);
    });

    test('should return empty array on API error', async () => {
      mockFetch.mockRejectedValue(new Error('API error'));

      const result = await client.getRooms();

      expect(result).toEqual([]);
    });
  });

  describe('checkAvailability', () => {
    test('should return availability status', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          available: true,
          price: 150,
          message: 'Room available'
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.checkAvailability('room-1', '2025-02-01', '2025-02-03');

      expect(result).toEqual({
        available: true,
        price: 150,
        message: 'Room available',
      });
    });

    test('should handle unavailable rooms', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          available: false,
          message: 'Room not available'
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.checkAvailability('room-1', '2025-02-01', '2025-02-03');

      expect(result).toEqual({
        available: false,
        message: 'Room not available',
      });
    });
  });

  describe('createBooking', () => {
    const bookingData = {
      clientName: 'Test User',
      email: 'test@example.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
      roomId: 'room-1',
      guests: 2,
    };

    test('should create booking successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          success: true,
          bookingId: 'booking-123',
          status: 'confirmed'
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.createBooking(bookingData);

      expect(result).toEqual({
        success: true,
        bookingId: 'booking-123',
        status: 'confirmed',
      });
    });

    test('should handle booking creation errors', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          success: false,
          message: 'Room not available'
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.createBooking(bookingData);

      expect(result).toEqual({
        success: false,
        message: 'Booking submission failed. Please try again or contact us directly.',
      });
    });
  });

  describe('healthCheck', () => {
    test('should return healthy status', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({ version: '1.0.0', status: 'healthy' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.healthCheck();

      expect(result).toEqual({
        available: true,
        responseTime: expect.any(Number),
        version: '1.0.0',
        message: 'Admin system is healthy',
      });
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    test('should handle unhealthy status', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.healthCheck();

      expect(result).toEqual({
        available: false,
        responseTime: expect.any(Number),
        message: 'Health check failed with status 503',
      });
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      const result = await client.healthCheck();

      expect(result).toEqual({
        available: false,
        responseTime: expect.any(Number),
        message: 'Network timeout',
      });
    });
  });
});
