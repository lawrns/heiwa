/**
 * BookingService Unit Tests
 * Tests for booking submission, validation, and cost calculation
 */

import { BookingService, BookingSubmission } from '@/lib/booking-service';
import {
  setupFetchMock,
  restoreFetch,
  mockApiResponse,
  mockApiError,
  mockNetworkError,
} from '../../utils/api-mocks';
import {
  createMockBooking,
  getFutureDate,
  getPastDate,
} from '../../utils/test-helpers';

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
    setupFetchMock();
  });

  afterEach(() => {
    restoreFetch();
  });

  // ==========================================================================
  // submitBooking Tests
  // ==========================================================================

  describe('submitBooking', () => {
    it('should submit valid booking successfully', async () => {
      const booking: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        checkIn: getFutureDate(7),
        checkOut: getFutureDate(10),
        roomId: 'room_1',
        guests: 2,
        message: 'Test booking',
      };

      mockApiResponse('/api/bookings', {
        booking: { id: 'booking_123', status: 'pending' },
      });

      const result = await bookingService.submitBooking(booking);

      expect(result.success).toBe(true);
      expect(result.bookingId).toBe('booking_123');
      expect(result.status).toBe('pending');
      expect(result.loading).toBe(false);
      expect(result.submittedAt).toBeInstanceOf(Date);
    });

    it('should return validation errors for invalid booking', async () => {
      const invalidBooking: BookingSubmission = {
        clientName: '',
        email: 'invalid-email',
        checkIn: '',
        checkOut: '',
        roomId: '',
        guests: 0,
      };

      const result = await bookingService.submitBooking(invalidBooking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
      expect(result.loading).toBe(false);
    });

    it('should handle API error responses', async () => {
      const booking = createMockBooking();

      mockApiError('/api/bookings', 400, 'Room not available');

      const result = await bookingService.submitBooking(booking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Room not available');
      expect(result.loading).toBe(false);
    });

    it('should handle network failures gracefully', async () => {
      const booking = createMockBooking();

      mockNetworkError('/api/bookings');

      const result = await bookingService.submitBooking(booking);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Please try again');
      expect(result.loading).toBe(false);
    });

    it('should include submission timestamp', async () => {
      const booking = createMockBooking();
      const beforeSubmit = new Date();

      mockApiResponse('/api/bookings', {
        booking: { id: 'booking_123', status: 'pending' },
      });

      const result = await bookingService.submitBooking(booking);
      const afterSubmit = new Date();

      expect(result.submittedAt).toBeDefined();
      expect(result.submittedAt!.getTime()).toBeGreaterThanOrEqual(beforeSubmit.getTime());
      expect(result.submittedAt!.getTime()).toBeLessThanOrEqual(afterSubmit.getTime());
    });
  });

  // ==========================================================================
  // validateBooking Tests
  // ==========================================================================

  describe('validateBooking', () => {
    it('should validate required fields', () => {
      const emptyBooking: BookingSubmission = {
        clientName: '',
        email: '',
        checkIn: '',
        checkOut: '',
        roomId: '',
        guests: 0,
      };

      const result = bookingService.validateBooking(emptyBooking);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Client name is required');
      expect(result.errors).toContain('Email is required');
      expect(result.errors).toContain('Check-in date is required');
      expect(result.errors).toContain('Check-out date is required');
      expect(result.errors).toContain('Room selection is required');
      expect(result.errors).toContain('Number of guests must be at least 1');
    });

    it('should validate email format', () => {
      const bookingWithInvalidEmail: BookingSubmission = {
        clientName: 'John Doe',
        email: 'not-an-email',
        checkIn: getFutureDate(7),
        checkOut: getFutureDate(10),
        roomId: 'room_1',
        guests: 2,
      };

      const result = bookingService.validateBooking(bookingWithInvalidEmail);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
      ];

      validEmails.forEach(email => {
        const booking: BookingSubmission = {
          clientName: 'John Doe',
          email,
          checkIn: getFutureDate(7),
          checkOut: getFutureDate(10),
          roomId: 'room_1',
          guests: 2,
        };

        const result = bookingService.validateBooking(booking);
        expect(result.errors).not.toContain('Invalid email format');
      });
    });

    it('should validate date ranges', () => {
      const bookingWithInvalidDates: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        checkIn: getFutureDate(10),
        checkOut: getFutureDate(7), // Check-out before check-in
        roomId: 'room_1',
        guests: 2,
      };

      const result = bookingService.validateBooking(bookingWithInvalidDates);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Check-out date must be after check-in date');
    });

    it('should reject past check-in dates', () => {
      const bookingWithPastDate: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        checkIn: getPastDate(1),
        checkOut: getFutureDate(3),
        roomId: 'room_1',
        guests: 2,
      };

      const result = bookingService.validateBooking(bookingWithPastDate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Check-in date cannot be in the past');
    });

    it('should validate minimum stay requirement (2 nights)', () => {
      const bookingWithShortStay: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        checkIn: getFutureDate(7),
        checkOut: getFutureDate(8), // Only 1 night
        roomId: 'room_1',
        guests: 2,
      };

      const result = bookingService.validateBooking(bookingWithShortStay);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum stay is 2 nights');
    });

    it('should return warnings for large groups', () => {
      const largeGroupBooking: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        checkIn: getFutureDate(7),
        checkOut: getFutureDate(10),
        roomId: 'room_1',
        guests: 6,
      };

      const result = bookingService.validateBooking(largeGroupBooking);

      expect(result.warnings).toContain('Large group bookings may require special arrangements');
    });

    it('should return warnings for late bookings', () => {
      const lateBooking: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        checkIn: getFutureDate(1), // Tomorrow
        checkOut: getFutureDate(4),
        roomId: 'room_1',
        guests: 2,
      };

      const result = bookingService.validateBooking(lateBooking);

      expect(result.warnings).toContain('Late bookings may not be confirmed immediately');
    });

    it('should pass validation for valid booking', () => {
      const validBooking: BookingSubmission = {
        clientName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        checkIn: getFutureDate(7),
        checkOut: getFutureDate(10),
        roomId: 'room_1',
        guests: 2,
        message: 'Looking forward to my stay!',
      };

      const result = bookingService.validateBooking(validBooking);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ==========================================================================
  // calculateEstimatedCost Tests
  // ==========================================================================

  describe('calculateEstimatedCost', () => {
    it('should calculate correct number of nights', () => {
      const checkIn = getFutureDate(7);
      const checkOut = getFutureDate(10);

      const result = bookingService.calculateEstimatedCost(
        'room_1',
        checkIn,
        checkOut,
        2
      );

      expect(result.breakdown.nights).toBe(3);
    });

    it('should return correct currency', () => {
      const result = bookingService.calculateEstimatedCost(
        'room_1',
        getFutureDate(7),
        getFutureDate(10),
        2
      );

      expect(result.currency).toBe('EUR');
    });

    it('should include breakdown details', () => {
      const result = bookingService.calculateEstimatedCost(
        'room_1',
        getFutureDate(7),
        getFutureDate(10),
        2
      );

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.baseRate).toBeDefined();
      expect(result.breakdown.nights).toBeDefined();
      expect(result.breakdown.subtotal).toBeDefined();
      expect(result.breakdown.taxes).toBeDefined();
      expect(result.breakdown.total).toBeDefined();
    });

    it('should calculate total correctly', () => {
      const result = bookingService.calculateEstimatedCost(
        'room_1',
        getFutureDate(7),
        getFutureDate(12), // 5 nights
        2
      );

      expect(result.breakdown.nights).toBe(5);
      expect(result.estimatedTotal).toBe(result.breakdown.total);
      expect(result.breakdown.subtotal).toBe(result.breakdown.baseRate * result.breakdown.nights);
    });
  });

  // ==========================================================================
  // getBookingPolicies Tests
  // ==========================================================================

  describe('getBookingPolicies', () => {
    it('should return booking policies', () => {
      const policies = bookingService.getBookingPolicies();

      expect(policies.minimumStay).toBe(2);
      expect(policies.cancellationHours).toBe(48);
      expect(policies.checkInTime).toBe('15:00');
      expect(policies.checkOutTime).toBe('11:00');
      expect(policies.paymentRequired).toBe(true);
      expect(policies.maxGuestsPerRoom).toBe(4);
    });
  });

  // ==========================================================================
  // checkBookingConflicts Tests
  // ==========================================================================

  describe('checkBookingConflicts', () => {
    it('should return no conflicts by default', async () => {
      const booking = createMockBooking();

      const result = await bookingService.checkBookingConflicts(booking);

      expect(result.hasConflicts).toBe(false);
    });
  });

  // ==========================================================================
  // sendConfirmationEmail Tests
  // ==========================================================================

  describe('sendConfirmationEmail', () => {
    it('should return true for valid booking ID', async () => {
      const result = await bookingService.sendConfirmationEmail('booking_123');

      expect(result).toBe(true);
    });
  });
});
