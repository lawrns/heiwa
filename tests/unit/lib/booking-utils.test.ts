/**
 * Booking Utils Unit Tests
 * Tests for room type determination, image processing, and validation
 */

import {
  determineRoomType,
  isValidImageUrl,
  processRoomImages,
  transformApiRoomToRoom,
  validateBookingSubmission,
  getValidationErrorMessage,
  ValidationResult,
} from '@/lib/booking-utils';

// Mock the constants
jest.mock('@/config/constants', () => ({
  ROOM_FALLBACK_IMAGES: {
    private: ['/images/fallback/private-room.jpg'],
    dorm: ['/images/fallback/dorm-room.jpg'],
  },
  INVALID_IMAGE_PATTERNS: ['placeholder', 'undefined', 'null'],
  VALID_IMAGE_PREFIXES: ['/', 'https://', 'http://'],
}));

describe('Booking Utils', () => {
  // ==========================================================================
  // determineRoomType Tests
  // ==========================================================================

  describe('determineRoomType', () => {
    it('should return "dorm" for perBed booking type', () => {
      expect(determineRoomType('perBed', 4)).toBe('dorm');
    });

    it('should return "private" for capacity of 1', () => {
      expect(determineRoomType('whole', 1)).toBe('private');
    });

    it('should return "shared" for whole booking with capacity > 1', () => {
      expect(determineRoomType('whole', 2)).toBe('shared');
      expect(determineRoomType('whole', 4)).toBe('shared');
    });

    it('should handle empty booking type', () => {
      expect(determineRoomType('', 1)).toBe('private');
      expect(determineRoomType('', 2)).toBe('shared');
    });

    it('should prioritize perBed over capacity', () => {
      expect(determineRoomType('perBed', 1)).toBe('dorm');
    });
  });

  // ==========================================================================
  // isValidImageUrl Tests
  // ==========================================================================

  describe('isValidImageUrl', () => {
    it('should accept local image URLs', () => {
      expect(isValidImageUrl('/images/room.jpg')).toBe(true);
      expect(isValidImageUrl('/rooms/photo.png')).toBe(true);
    });

    it('should accept https URLs', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('https://storage.supabase.co/room.jpg')).toBe(true);
    });

    it('should accept http URLs', () => {
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(isValidImageUrl('')).toBe(false);
    });

    it('should reject invalid patterns', () => {
      expect(isValidImageUrl('placeholder.jpg')).toBe(false);
      expect(isValidImageUrl('undefined')).toBe(false);
      expect(isValidImageUrl('null')).toBe(false);
    });

    it('should reject invalid URL formats', () => {
      expect(isValidImageUrl('not-a-url')).toBe(false);
      expect(isValidImageUrl('ftp://invalid.com/image.jpg')).toBe(false);
    });
  });

  // ==========================================================================
  // processRoomImages Tests
  // ==========================================================================

  describe('processRoomImages', () => {
    it('should return CMS images when valid', () => {
      const images = ['/images/room1.jpg', '/images/room2.jpg'];
      const result = processRoomImages(images, undefined, 'private');

      expect(result).toEqual(images);
    });

    it('should filter out invalid images', () => {
      const images = ['/images/valid.jpg', 'placeholder.jpg', '/images/another.jpg'];
      const result = processRoomImages(images, undefined, 'private');

      expect(result).toContain('/images/valid.jpg');
      expect(result).toContain('/images/another.jpg');
      expect(result).not.toContain('placeholder.jpg');
    });

    it('should use featured image as fallback', () => {
      const result = processRoomImages([], '/images/featured.jpg', 'private');

      expect(result).toEqual(['/images/featured.jpg']);
    });

    it('should use default fallback for private rooms', () => {
      const result = processRoomImages([], undefined, 'private');

      expect(result).toEqual(['/images/fallback/private-room.jpg']);
    });

    it('should use default fallback for dorm rooms', () => {
      const result = processRoomImages([], undefined, 'dorm');

      expect(result).toEqual(['/images/fallback/dorm-room.jpg']);
    });

    it('should handle undefined images array', () => {
      const result = processRoomImages(undefined, '/images/featured.jpg', 'private');

      expect(result).toEqual(['/images/featured.jpg']);
    });

    it('should filter out yoga dome images', () => {
      const images = ['/images/room.jpg', '/images/yoga_dome.jpg'];
      const result = processRoomImages(images, undefined, 'private');

      expect(result).not.toContain('/images/yoga_dome.jpg');
    });
  });

  // ==========================================================================
  // transformApiRoomToRoom Tests
  // ==========================================================================

  describe('transformApiRoomToRoom', () => {
    it('should transform API room data correctly', () => {
      const apiRoom = {
        id: 'room_1',
        name: 'Ocean View',
        description: 'Beautiful room',
        capacity: 2,
        booking_type: 'whole',
        price_per_night: 100,
        images: ['/images/room.jpg'],
        amenities: ['WiFi', 'AC'],
      };

      const result = transformApiRoomToRoom(apiRoom);

      expect(result.id).toBe('room_1');
      expect(result.name).toBe('Ocean View');
      expect(result.description).toBe('Beautiful room');
      expect(result.maxOccupancy).toBe(2);
      expect(result.type).toBe('shared');
      expect(result.bookingType).toBe('entire_room');
      expect(result.pricePerNight).toBe(100);
      expect(result.amenities).toEqual(['WiFi', 'AC']);
      expect(result.isAvailable).toBe(true);
    });

    it('should handle perBed booking type', () => {
      const apiRoom = {
        id: 'room_1',
        name: 'Dorm Room',
        capacity: 6,
        booking_type: 'perBed',
        price_per_night: 30,
      };

      const result = transformApiRoomToRoom(apiRoom);

      expect(result.type).toBe('dorm');
      expect(result.bookingType).toBe('per_bed');
    });

    it('should handle missing optional fields', () => {
      const apiRoom = {
        id: 'room_1',
        name: 'Basic Room',
      };

      const result = transformApiRoomToRoom(apiRoom);

      expect(result.description).toBe('');
      expect(result.amenities).toEqual([]);
    });

    it('should extract pricing data', () => {
      const apiRoom = {
        id: 'room_1',
        name: 'Room',
        pricing: {
          standard: 100,
          offSeason: 80,
          surfCamp: {
            strategy: 'perBed',
            perBed: 50,
          },
        },
      };

      const result = transformApiRoomToRoom(apiRoom);

      expect(result.pricing?.standard).toBe(100);
      expect(result.pricing?.offSeason).toBe(80);
      expect(result.pricing?.surfCamp?.perBed).toBe(50);
    });
  });

  // ==========================================================================
  // validateBookingSubmission Tests
  // ==========================================================================

  describe('validateBookingSubmission', () => {
    const validRoomState = {
      experienceType: 'room' as const,
      dates: {
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      selectedOption: 'room_1',
      selectedSurfWeek: null,
      guests: 2,
      guestDetails: [
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      ],
      paymentMethod: 'card_stripe' as const,
    };

    it('should pass validation for valid room booking', () => {
      const result = validateBookingSubmission(validRoomState);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require experience type', () => {
      const state = { ...validRoomState, experienceType: null };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please select an experience type (Room or Surf Week)');
    });

    it('should require check-in date for room bookings', () => {
      const state = {
        ...validRoomState,
        dates: { ...validRoomState.dates, checkIn: null },
      };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Check-in date is required');
    });

    it('should require check-out date for room bookings', () => {
      const state = {
        ...validRoomState,
        dates: { ...validRoomState.dates, checkOut: null },
      };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Check-out date is required');
    });

    it('should require room selection', () => {
      const state = { ...validRoomState, selectedOption: null };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please select a room (or assign guests to rooms)');
    });

    it('should require at least 1 guest', () => {
      const state = { ...validRoomState, guests: 0 };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('guests');
    });

    it('should reject more than 20 guests', () => {
      const state = { ...validRoomState, guests: 21 };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Maximum 20 guests'))).toBe(true);
    });

    it('should require payment method', () => {
      const state = { ...validRoomState, paymentMethod: null };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please select a payment method');
    });

    it('should validate guest details count matches guest count', () => {
      const state = {
        ...validRoomState,
        guests: 3,
        guestDetails: [
          { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        ],
      };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('only provided details for 1'))).toBe(true);
    });

    it('should validate guest first name', () => {
      const state = {
        ...validRoomState,
        guestDetails: [
          { firstName: '', lastName: 'Doe', email: 'john@example.com' },
          { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        ],
      };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Guest 1: First name is required');
    });

    it('should validate guest email format', () => {
      const state = {
        ...validRoomState,
        guestDetails: [
          { firstName: 'John', lastName: 'Doe', email: 'invalid-email' },
          { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        ],
      };
      const result = validateBookingSubmission(state);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Guest 1: Invalid email format');
    });

    it('should validate surf week selection', () => {
      const surfWeekState = {
        ...validRoomState,
        experienceType: 'surf-week' as const,
        selectedOption: null,
        selectedSurfWeek: null,
      };
      const result = validateBookingSubmission(surfWeekState);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please select a surf week');
    });

    it('should accept room assignments as alternative to selectedOption', () => {
      const state = {
        ...validRoomState,
        selectedOption: null,
        roomAssignments: [{ roomId: 'room_1', guestIds: ['guest_1'] }],
      };
      const result = validateBookingSubmission(state);

      // Should not have room selection error
      expect(result.errors).not.toContain('Please select a room (or assign guests to rooms)');
    });
  });

  // ==========================================================================
  // getValidationErrorMessage Tests
  // ==========================================================================

  describe('getValidationErrorMessage', () => {
    it('should return empty string for valid result', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        missingFields: [],
      };

      expect(getValidationErrorMessage(result)).toBe('');
    });

    it('should return single error directly', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Check-in date is required'],
        missingFields: ['checkIn'],
      };

      expect(getValidationErrorMessage(result)).toBe('Check-in date is required');
    });

    it('should join multiple errors with comma', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2', 'Error 3'],
        missingFields: [],
      };

      expect(getValidationErrorMessage(result)).toBe('Error 1, Error 2, Error 3');
    });

    it('should summarize more than 3 errors', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2', 'Error 3', 'Error 4', 'Error 5'],
        missingFields: [],
      };

      const message = getValidationErrorMessage(result);
      expect(message).toContain('Error 1');
      expect(message).toContain('Error 2');
      expect(message).toContain('3 more issues');
    });
  });
});
