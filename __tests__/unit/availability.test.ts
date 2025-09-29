// Unit tests for Availability Service
import { AvailabilityService } from '@/lib/availability';

// Mock the admin API
jest.mock('@/lib/admin-api', () => ({
  adminApi: {
    checkAvailability: jest.fn(),
  },
}));

const mockAdminApi = require('@/lib/admin-api').adminApi;

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new AvailabilityService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkAvailability', () => {
    const query = {
      roomId: 'room-1',
      checkIn: '2025-02-01',
      checkOut: '2025-02-03',
    };

    test('should return availability result on success', async () => {
      const mockResult = {
        available: true,
        price: 150,
        message: 'Room available',
      };
      mockAdminApi.checkAvailability.mockResolvedValue(mockResult);

      const result = await service.checkAvailability(query);

      expect(result).toEqual({
        ...mockResult,
        roomId: query.roomId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        loading: false,
        lastChecked: expect.any(Date),
      });
      expect(mockAdminApi.checkAvailability).toHaveBeenCalledWith(
        query.roomId,
        query.checkIn,
        query.checkOut
      );
    });

    test('should handle API errors gracefully', async () => {
      mockAdminApi.checkAvailability.mockRejectedValue(new Error('API error'));

      const result = await service.checkAvailability(query);

      expect(result).toEqual({
        roomId: query.roomId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        available: false,
        loading: false,
        error: 'Unable to check availability. Please try again.',
        lastChecked: expect.any(Date),
      });
    });

    test('should validate required dates', async () => {
      const invalidQuery = {
        roomId: 'room-1',
        checkIn: '',
        checkOut: '2025-02-03',
      };

      const result = await service.checkAvailability(invalidQuery as any);

      expect(result).toEqual({
        roomId: 'room-1',
        checkIn: '',
        checkOut: '2025-02-03',
        available: false,
        loading: false,
        error: 'Unable to check availability. Please try again.',
        lastChecked: expect.any(Date),
      });
    });

    test('should cache results', async () => {
      const mockResult = { available: true, price: 100 };
      mockAdminApi.checkAvailability.mockResolvedValue(mockResult);

      // First call
      const result1 = await service.checkAvailability(query);
      expect(result1.available).toBe(true);

      // Second call should use cache
      const result2 = await service.checkAvailability(query);
      expect(result2.available).toBe(true);

      // Should only call API once due to caching
      expect(mockAdminApi.checkAvailability).toHaveBeenCalledTimes(1);
    });

    test('should return cached results within TTL', async () => {
      const mockResult = { available: true, price: 100 };
      mockAdminApi.checkAvailability.mockResolvedValue(mockResult);

      // First call
      await service.checkAvailability(query);

      // Mock time passing (but still within cache TTL)
      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(Date.now() + 1000);

      // Second call should use cache
      const result = await service.checkAvailability(query);
      expect(result.available).toBe(true);
      expect(mockAdminApi.checkAvailability).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkMultipleRoomsAvailability', () => {
    test('should check multiple rooms in parallel', async () => {
      const queries = [
        { roomId: 'room-1', checkIn: '2025-02-01', checkOut: '2025-02-03' },
        { roomId: 'room-2', checkIn: '2025-02-01', checkOut: '2025-02-03' },
      ];

      mockAdminApi.checkAvailability
        .mockResolvedValueOnce({ available: true, price: 100 })
        .mockResolvedValueOnce({ available: false, message: 'Booked' });

      const results = await service.checkMultipleRoomsAvailability(queries);

      expect(results).toHaveLength(2);
      expect(results[0].available).toBe(true);
      expect(results[1].available).toBe(false);
      expect(mockAdminApi.checkAvailability).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCachedAvailability', () => {
    test('should return cached result if available', async () => {
      const query = { roomId: 'room-1', checkIn: '2025-02-01', checkOut: '2025-02-03' };
      const mockResult = { available: true, price: 100 };
      mockAdminApi.checkAvailability.mockResolvedValue(mockResult);

      // Populate cache
      await service.checkAvailability(query);

      // Get cached result
      const cached = service.getCachedAvailability(query);

      expect(cached?.available).toBe(true);
    });

    test('should return null for expired cache', async () => {
      const query = { roomId: 'room-1', checkIn: '2025-02-01', checkOut: '2025-02-03' };

      // Populate cache first
      mockAdminApi.checkAvailability.mockResolvedValue({ available: true, price: 100, message: 'Available' });
      await service.checkAvailability(query);

      // Advance time to make cache expired (5 minutes + 1 second)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1000);

      const cached = service.getCachedAvailability(query);

      expect(cached).toBeNull();
    });
  });

  describe('clearCache', () => {
    test('should clear all cached results', async () => {
      const query = { roomId: 'room-1', checkIn: '2025-02-01', checkOut: '2025-02-03' };
      mockAdminApi.checkAvailability.mockResolvedValue({ available: true });

      // Populate cache
      await service.checkAvailability(query);
      expect(service.getCachedAvailability(query)).not.toBeNull();

      // Clear cache
      service.clearCache();

      // Cache should be empty
      expect(service.getCachedAvailability(query)).toBeNull();
    });
  });

  describe('clearRoomCache', () => {
    test('should clear cache for specific room', async () => {
      const room1Query = { roomId: 'room-1', checkIn: '2025-02-01', checkOut: '2025-02-03' };
      const room2Query = { roomId: 'room-2', checkIn: '2025-02-01', checkOut: '2025-02-03' };

      mockAdminApi.checkAvailability.mockResolvedValue({ available: true });

      // Populate cache for both rooms
      await service.checkAvailability(room1Query);
      await service.checkAvailability(room2Query);

      expect(service.getCachedAvailability(room1Query)).not.toBeNull();
      expect(service.getCachedAvailability(room2Query)).not.toBeNull();

      // Clear cache for room-1 only
      service.clearRoomCache('room-1');

      // room-1 cache should be cleared, room-2 should remain
      expect(service.getCachedAvailability(room1Query)).toBeNull();
      expect(service.getCachedAvailability(room2Query)).not.toBeNull();
    });
  });

  describe('getCacheStats', () => {
    test('should return cache statistics', async () => {
      const query = { roomId: 'room-1', checkIn: '2025-02-01', checkOut: '2025-02-03' };
      mockAdminApi.checkAvailability.mockResolvedValue({ available: true });

      // No cache initially
      let stats = service.getCacheStats();
      expect(stats.totalEntries).toBe(0);

      // Add cached entry
      await service.checkAvailability(query);

      stats = service.getCacheStats();
      expect(stats.totalEntries).toBe(1);
      expect(stats.validEntries).toBe(1);
      expect(stats.expiredEntries).toBe(0);
      expect(stats.cacheHitRatio).toBe(1);
    });
  });
});
