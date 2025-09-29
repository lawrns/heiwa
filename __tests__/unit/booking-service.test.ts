// Unit tests for Booking Service
import { BookingService } from '@/lib/booking-service';

// Mock the admin API
jest.mock('@/lib/admin-api', () => ({
  adminApi: {
    createBooking: jest.fn(),
  },
}));

const mockAdminApi = require('@/lib/admin-api').adminApi;

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BookingService();
  });

  describe('submitBooking', () => {
    const validBooking = {
      clientName: 'John Doe',
      email: 'john@example.com',
      phone: '+351 912 193 785',
      checkIn: '2026-02-01',
      checkOut: '2026-02-03',
      roomId: 'room-1',
      guests: 2,
      message: 'Looking forward to our stay',
    };

    test('should submit booking successfully', async () => {
      const mockResponse = {
        success: true,
        bookingId: 'booking-123',
        status: 'confirmed',
        message: 'Booking confirmed',
      };
      mockAdminApi.createBooking.mockResolvedValue(mockResponse);

      const result = await service.submitBooking(validBooking);

      expect(result).toEqual({
        ...mockResponse,
        loading: false,
        submittedAt: expect.any(Date),
      });
      expect(mockAdminApi.createBooking).toHaveBeenCalledWith({
        clientName: 'John Doe',
        email: 'john@example.com',
        phone: '+351 912 193 785',
        checkIn: '2026-02-01',
        checkOut: '2026-02-03',
        roomId: 'room-1',
        guests: 2,
        message: 'Looking forward to our stay',
      });
    });

    test('should handle booking submission errors', async () => {
      mockAdminApi.createBooking.mockRejectedValue(new Error('API error'));

      const result = await service.submitBooking(validBooking);

      expect(result).toEqual({
        success: false,
        message: 'Booking submission failed. Please try again or contact us directly.',
        loading: false,
        submittedAt: expect.any(Date),
      });
    });

    test('should validate required fields', async () => {
      const invalidBooking = {
        clientName: '',
        email: '',
        checkIn: '',
        checkOut: '',
        roomId: '',
        guests: 0,
      };

      const result = await service.submitBooking(invalidBooking as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
      expect(result.message).toContain('Client name is required');
      expect(result.message).toContain('Email is required');
      expect(result.message).toContain('Check-in date is required');
      expect(result.message).toContain('Check-out date is required');
      expect(result.message).toContain('Room selection is required');
      expect(result.message).toContain('Number of guests must be at least 1');
    });

    test('should validate email format', async () => {
      const invalidEmailBooking = {
        ...validBooking,
        email: 'not-an-email',
      };

      const result = await service.submitBooking(invalidEmailBooking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid email format');
    });

    test('should validate date range', async () => {
      const invalidDateBooking = {
        ...validBooking,
        checkIn: '2026-02-03',
        checkOut: '2026-02-01', // Before check-in
      };

      const result = await service.submitBooking(invalidDateBooking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Check-out date must be after check-in date');
    });

    test('should validate past check-in dates', async () => {
      const pastDateBooking = {
        ...validBooking,
        checkIn: '2020-01-01', // Past date
        checkOut: '2020-01-03',
      };

      const result = await service.submitBooking(pastDateBooking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Check-in date cannot be in the past');
    });

    test('should validate minimum stay', async () => {
      const shortStayBooking = {
        ...validBooking,
        checkIn: '2026-02-01',
        checkOut: '2026-02-01', // Same day
      };

      const result = await service.submitBooking(shortStayBooking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Minimum stay is 2 nights');
    });

    test('should handle API validation errors', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Room not available for selected dates',
      };
      mockAdminApi.createBooking.mockResolvedValue(mockErrorResponse);

      const result = await service.submitBooking(validBooking);

      expect(result).toEqual({
        success: false,
        message: 'Room not available for selected dates',
        loading: false,
        submittedAt: expect.any(Date),
      });
    });
  });

  describe('validateBooking', () => {
    const validBooking = {
      clientName: 'John Doe',
      email: 'john@example.com',
      checkIn: '2026-02-01',
      checkOut: '2026-02-03',
      roomId: 'room-1',
      guests: 2,
    };

    test('should validate correct booking data', () => {
      const result = service.validateBooking(validBooking);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should detect validation errors', () => {
      const invalidBooking = {
        clientName: '',
        email: 'invalid-email',
        checkIn: '2025-02-03',
        checkOut: '2025-02-01',
        roomId: '',
        guests: 0,
      };

      const result = service.validateBooking(invalidBooking as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Client name is required');
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Check-out date must be after check-in date');
      expect(result.errors).toContain('Room selection is required');
      expect(result.errors).toContain('Number of guests must be at least 1');
    });

    test('should provide warnings for edge cases', () => {
      const warningBooking = {
        ...validBooking,
        guests: 6, // Large group
        checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      };

      const result = service.validateBooking(warningBooking);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Large group bookings may require special arrangements');
      expect(result.warnings).toContain('Late bookings may not be confirmed immediately');
    });
  });

  describe('getBookingPolicies', () => {
    test('should return booking policies', () => {
      const policies = service.getBookingPolicies();

      expect(policies).toEqual({
        minimumStay: 2,
        cancellationHours: 48,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        paymentRequired: true,
        maxGuestsPerRoom: 4,
      });
    });
  });

  describe('calculateEstimatedCost', () => {
    test('should calculate estimated booking cost', () => {
      const cost = service.calculateEstimatedCost(
        'room-1',
        '2025-02-01',
        '2025-02-03',
        2
      );

      expect(cost.estimatedTotal).toBe(200); // 2 nights * 100
      expect(cost.currency).toBe('EUR');
      expect(cost.breakdown).toEqual({
        baseRate: 100,
        nights: 2,
        subtotal: 200,
        taxes: 0,
        total: 200,
      });
    });

    test('should handle longer stays', () => {
      const cost = service.calculateEstimatedCost(
        'room-1',
        '2025-02-01',
        '2025-02-08', // 7 nights
        2
      );

      expect(cost.estimatedTotal).toBe(700); // 7 nights * 100
      expect(cost.breakdown.nights).toBe(7);
    });
  });
});
