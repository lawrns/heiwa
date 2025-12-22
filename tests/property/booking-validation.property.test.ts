/**
 * Property-Based Tests for Booking Validation
 * Feature: comprehensive-testing
 * 
 * These tests verify universal properties that should hold
 * across all valid inputs using fast-check.
 */

import * as fc from 'fast-check';
import { BookingService } from '@/lib/booking-service';
import {
  validateBookingSubmission,
  getValidationErrorMessage,
  processRoomImages,
  determineRoomType,
} from '@/lib/booking-utils';
import {
  invalidBookingArb,
  validEmailArb,
  invalidEmailArb,
  validDateRangeArb,
  validGuestCountArb,
  validPriceArb,
  currencyCodeArb,
  validRoomImagesArb,
  roomTypeArb,
} from '../utils/generators';

describe('Booking Validation Properties', () => {
  const bookingService = new BookingService();

  /**
   * Property 1: Booking Validation Completeness
   * For any booking with missing required fields, validation SHALL return
   * isValid: false with all missing fields in errors
   * 
   * Validates: Requirements 1.5, 1.6
   */
  describe('Property 1: Booking Validation Completeness', () => {
    it('should return isValid: false for bookings with missing required fields', () => {
      fc.assert(
        fc.property(invalidBookingArb, (booking) => {
          const result = bookingService.validateBooking(booking);
          
          // If any required field is missing/invalid, validation should fail
          const hasMissingFields = 
            !booking.clientName?.trim() ||
            !booking.email?.trim() ||
            !booking.checkIn ||
            !booking.checkOut ||
            !booking.roomId?.trim() ||
            !booking.guests || booking.guests < 1;
          
          if (hasMissingFields) {
            return result.isValid === false && result.errors.length > 0;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should include specific error messages for each missing field', () => {
      // Test with completely empty booking
      const emptyBooking = {
        clientName: '',
        email: '',
        checkIn: '',
        checkOut: '',
        roomId: '',
        guests: 0,
      };

      const result = bookingService.validateBooking(emptyBooking);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(5);
    });
  });

  /**
   * Property 3: Email Validation Consistency
   * For any string matching email regex, isValidEmail SHALL return true;
   * non-matching SHALL return false
   * 
   * Validates: Requirements 1.2, 1.6
   */
  describe('Property 3: Email Validation Consistency', () => {
    it('should accept all valid email formats', () => {
      fc.assert(
        fc.property(validEmailArb, (email) => {
          const booking = {
            clientName: 'Test User',
            email,
            checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            roomId: 'room_1',
            guests: 2,
          };

          const result = bookingService.validateBooking(booking);
          
          // Should not have email format error
          return !result.errors.includes('Invalid email format');
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid email formats', () => {
      fc.assert(
        fc.property(invalidEmailArb, (email) => {
          // Skip empty string as it triggers "required" error instead
          if (email === '') return true;

          const booking = {
            clientName: 'Test User',
            email,
            checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            roomId: 'room_1',
            guests: 2,
          };

          const result = bookingService.validateBooking(booking);
          
          // Should have email format error or be invalid
          return result.isValid === false;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Validation Error Message Completeness
   * For any validation result with errors, getValidationErrorMessage
   * SHALL return non-empty string
   * 
   * Validates: Requirements 1.6, 11.3
   */
  describe('Property 6: Validation Error Message Completeness', () => {
    it('should return non-empty message for any validation with errors', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          (errors) => {
            const result = {
              isValid: false,
              errors,
              missingFields: [],
            };

            const message = getValidationErrorMessage(result);
            
            return message.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty string for valid results', () => {
      const result = {
        isValid: true,
        errors: [],
        missingFields: [],
      };

      const message = getValidationErrorMessage(result);
      expect(message).toBe('');
    });
  });

  /**
   * Property 7: Guest Details Validation Consistency
   * For any guest details array, validation SHALL pass if all required
   * fields present, fail otherwise
   * 
   * Validates: Requirements 9.3, 9.5
   */
  describe('Property 7: Guest Details Validation Consistency', () => {
    it('should pass validation when all guest details are complete', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (guestCount) => {
            // Generate valid guest details for the count
            const guestDetails = Array.from({ length: guestCount }, (_, i) => ({
              firstName: `Guest${i + 1}`,
              lastName: `Test`,
              email: `guest${i + 1}@example.com`,
            }));

            const state = {
              experienceType: 'room' as const,
              dates: {
                checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
              },
              selectedOption: 'room_1',
              selectedSurfWeek: null,
              guests: guestCount,
              guestDetails,
              paymentMethod: 'card_stripe' as const,
            };

            const result = validateBookingSubmission(state);
            
            // Should not have guest-related errors
            const hasGuestErrors = result.errors.some(e => 
              e.includes('Guest') || e.includes('guest')
            );
            
            return !hasGuestErrors;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fail validation when guest details are incomplete', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (guestCount) => {
            // Generate incomplete guest details (missing email)
            const guestDetails = Array.from({ length: guestCount }, (_, i) => ({
              firstName: `Guest${i + 1}`,
              lastName: `Test`,
              email: '', // Missing email
            }));

            const state = {
              experienceType: 'room' as const,
              dates: {
                checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
              },
              selectedOption: 'room_1',
              selectedSurfWeek: null,
              guests: guestCount,
              guestDetails,
              paymentMethod: 'card_stripe' as const,
            };

            const result = validateBookingSubmission(state);
            
            return result.isValid === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Date Range Validity
   * For any valid date range where checkOut > checkIn,
   * calculateEstimatedCost SHALL return positive nights
   * 
   * Validates: Requirements 2.1, 2.3
   */
  describe('Property 2: Date Range Validity', () => {
    it('should calculate positive nights for valid date ranges', () => {
      fc.assert(
        fc.property(validDateRangeArb, ({ checkIn, checkOut }) => {
          const result = bookingService.calculateEstimatedCost(
            'room_1',
            checkIn.toISOString().split('T')[0],
            checkOut.toISOString().split('T')[0],
            2
          );

          return result.breakdown.nights > 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should calculate correct number of nights', () => {
      fc.assert(
        fc.property(validDateRangeArb, ({ checkIn, checkOut }) => {
          const expectedNights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );

          const result = bookingService.calculateEstimatedCost(
            'room_1',
            checkIn.toISOString().split('T')[0],
            checkOut.toISOString().split('T')[0],
            2
          );

          return result.breakdown.nights === expectedNights;
        }),
        { numRuns: 100 }
      );
    });

    it('should return consistent results for same date range', () => {
      fc.assert(
        fc.property(
          validDateRangeArb,
          validGuestCountArb,
          ({ checkIn, checkOut }, guests) => {
            const checkInStr = checkIn.toISOString().split('T')[0];
            const checkOutStr = checkOut.toISOString().split('T')[0];

            const result1 = bookingService.calculateEstimatedCost('room_1', checkInStr, checkOutStr, guests);
            const result2 = bookingService.calculateEstimatedCost('room_1', checkInStr, checkOutStr, guests);

            return result1.breakdown.nights === result2.breakdown.nights &&
                   result1.estimatedTotal === result2.estimatedTotal;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return EUR as currency for all calculations', () => {
      fc.assert(
        fc.property(validDateRangeArb, ({ checkIn, checkOut }) => {
          const result = bookingService.calculateEstimatedCost(
            'room_1',
            checkIn.toISOString().split('T')[0],
            checkOut.toISOString().split('T')[0],
            2
          );

          return result.currency === 'EUR';
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Price Formatting Round-Trip
   * For any valid price and currency, formatting then parsing SHALL produce original value
   * 
   * Validates: Requirements 2.1, 4.3
   */
  describe('Property 4: Price Formatting Round-Trip', () => {
    // Helper function to format price
    const formatPrice = (price: number, currency: string): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };

    // Helper function to parse formatted price
    const parsePrice = (formatted: string): number => {
      // Remove currency symbols and thousands separators, keep decimal
      const cleaned = formatted.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned);
    };

    it('should preserve price value through format/parse cycle', () => {
      fc.assert(
        fc.property(validPriceArb, currencyCodeArb, (price, currency) => {
          // Skip JPY as it has no decimal places
          if (currency === 'JPY') return true;

          const formatted = formatPrice(price, currency);
          const parsed = parsePrice(formatted);

          // Allow for floating point precision (2 decimal places)
          return Math.abs(parsed - price) < 0.01;
        }),
        { numRuns: 100 }
      );
    });

    it('should format all valid prices without throwing', () => {
      fc.assert(
        fc.property(validPriceArb, currencyCodeArb, (price, currency) => {
          try {
            const formatted = formatPrice(price, currency);
            return typeof formatted === 'string' && formatted.length > 0;
          } catch {
            return false;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should produce non-negative parsed values for positive prices', () => {
      fc.assert(
        fc.property(validPriceArb, (price) => {
          const formatted = formatPrice(price, 'EUR');
          const parsed = parsePrice(formatted);
          return parsed >= 0;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Room Image Processing Idempotence
   * For any room with valid images, processRoomImages called multiple times
   * SHALL produce identical output
   * 
   * Validates: Requirements 2.2, 4.7
   */
  describe('Property 5: Room Image Processing Idempotence', () => {
    it('should produce identical output when called multiple times', () => {
      fc.assert(
        fc.property(validRoomImagesArb, roomTypeArb, (images, roomType) => {
          const result1 = processRoomImages(images, undefined, roomType);
          const result2 = processRoomImages(images, undefined, roomType);
          const result3 = processRoomImages(images, undefined, roomType);

          // All results should be identical
          return JSON.stringify(result1) === JSON.stringify(result2) &&
                 JSON.stringify(result2) === JSON.stringify(result3);
        }),
        { numRuns: 100 }
      );
    });

    it('should return array for any valid input', () => {
      fc.assert(
        fc.property(validRoomImagesArb, roomTypeArb, (images, roomType) => {
          const result = processRoomImages(images, undefined, roomType);
          return Array.isArray(result);
        }),
        { numRuns: 100 }
      );
    });

    it('should return non-empty array for valid images', () => {
      fc.assert(
        fc.property(validRoomImagesArb, roomTypeArb, (images, roomType) => {
          const result = processRoomImages(images, undefined, roomType);
          return result.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should use featured image as fallback when images array is empty', () => {
      fc.assert(
        fc.property(roomTypeArb, (roomType) => {
          const featuredImage = '/images/rooms/featured.jpg';
          const result = processRoomImages([], featuredImage, roomType);
          
          // Should contain the featured image
          return result.includes(featuredImage);
        }),
        { numRuns: 100 }
      );
    });

    it('should use default fallback when no images provided', () => {
      fc.assert(
        fc.property(roomTypeArb, (roomType) => {
          const result = processRoomImages(undefined, undefined, roomType);
          
          // Should return fallback images (non-empty array)
          return Array.isArray(result) && result.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should filter out invalid image URLs', () => {
      const invalidImages = [
        'javascript:alert(1)',
        'data:image/png;base64,invalid',
        '',
        'ftp://invalid.com/image.jpg',
      ];

      fc.assert(
        fc.property(roomTypeArb, (roomType) => {
          const result = processRoomImages(invalidImages, undefined, roomType);
          
          // Should not contain any of the invalid images
          return !invalidImages.some(img => result.includes(img));
        }),
        { numRuns: 100 }
      );
    });
  });
});
