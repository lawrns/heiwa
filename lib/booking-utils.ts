/**
 * Booking utility functions
 * Business logic for transforming and processing booking data
 */

import { Room } from '@/components/BookingWidget/types';
import { ROOM_FALLBACK_IMAGES, INVALID_IMAGE_PATTERNS, VALID_IMAGE_PREFIXES } from '@/config/constants';

/**
 * Determine room type based on booking type and capacity
 */
export function determineRoomType(bookingType: string, capacity: number): 'private' | 'shared' | 'dorm' {
  if (bookingType === 'perBed') {
    return 'dorm';
  } else if (capacity === 1) {
    return 'private';
  } else {
    return 'shared';
  }
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  // Skip invalid URL patterns
  if (INVALID_IMAGE_PATTERNS.some(pattern => url.includes(pattern))) return false;
  // Accept local images and valid external URLs
  return VALID_IMAGE_PREFIXES.some(prefix => url.startsWith(prefix));
}

/**
 * Process room images with fallback logic
 */
export function processRoomImages(
  roomImages: string[] | undefined,
  featuredImage: string | undefined,
  roomType: 'private' | 'shared' | 'dorm'
): string[] {
  let images: string[] = [];
  
  // Prefer images array if available
  if (roomImages && Array.isArray(roomImages) && roomImages.length > 0) {
    images = roomImages.filter(isValidImageUrl);
  }
  
  // Fallback to featured image if no images array
  if (images.length === 0 && featuredImage && isValidImageUrl(featuredImage)) {
    images = [featuredImage];
  }
  
  // Final fallback to default images based on room type
  if (images.length === 0) {
    images = roomType === 'dorm' 
      ? [...ROOM_FALLBACK_IMAGES.dorm]
      : [...ROOM_FALLBACK_IMAGES.private];
  }
  
  return images;
}

/**
 * Transform API room data to Room interface
 */
export function transformApiRoomToRoom(apiRoom: any): Room {
  const roomType = determineRoomType(apiRoom.booking_type || '', apiRoom.capacity || 1);
  const images = processRoomImages(apiRoom.images, apiRoom.featured_image, roomType);

  return {
    id: apiRoom.id,
    name: apiRoom.name,
    description: apiRoom.description || '',
    type: roomType,
    maxOccupancy: apiRoom.capacity,
    pricePerNight: apiRoom.price_per_night,
    amenities: apiRoom.amenities || [],
    images: images,
    isAvailable: true, // All returned rooms are available or shown
  };
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: string[];
}

/**
 * Validate booking state before submission
 * Returns detailed validation result with specific field errors
 */
export function validateBookingSubmission(state: {
  experienceType: 'room' | 'surf-week' | null;
  dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  selectedOption: string | null;
  selectedSurfWeek: string | null;
  guests: number;
  guestDetails: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }>;
  paymentMethod: 'card_stripe' | 'bank_wire' | null;
}): ValidationResult {
  const errors: string[] = [];
  const missingFields: string[] = [];

  // Check experience type
  if (!state.experienceType) {
    errors.push('Please select an experience type (Room or Surf Week)');
    missingFields.push('experienceType');
  }

  // Validate based on experience type
  if (state.experienceType === 'room') {
    // Room booking validation
    if (!state.dates.checkIn) {
      errors.push('Check-in date is required');
      missingFields.push('checkIn');
    }
    if (!state.dates.checkOut) {
      errors.push('Check-out date is required');
      missingFields.push('checkOut');
    }
    if (!state.selectedOption) {
      errors.push('Please select a room');
      missingFields.push('selectedOption');
    }
    if (state.guests < 1) {
      errors.push('Number of guests must be at least 1');
      missingFields.push('guests');
    }
  } else if (state.experienceType === 'surf-week') {
    // Surf week booking validation
    // Check both selectedOption (legacy) and selectedSurfWeek (new)
    const surfWeekId = state.selectedSurfWeek || state.selectedOption;
    if (!surfWeekId) {
      errors.push('Please select a surf week');
      missingFields.push('selectedSurfWeek');
    }
  }

  // Validate guest details
  if (!state.guestDetails || state.guestDetails.length === 0) {
    errors.push('At least one guest is required');
    missingFields.push('guestDetails');
  } else {
    state.guestDetails.forEach((guest, index) => {
      if (!guest.firstName?.trim()) {
        errors.push(`Guest ${index + 1}: First name is required`);
        missingFields.push(`guestDetails[${index}].firstName`);
      }
      if (!guest.lastName?.trim()) {
        errors.push(`Guest ${index + 1}: Last name is required`);
        missingFields.push(`guestDetails[${index}].lastName`);
      }
      if (!guest.email?.trim()) {
        errors.push(`Guest ${index + 1}: Email is required`);
        missingFields.push(`guestDetails[${index}].email`);
      } else {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guest.email)) {
          errors.push(`Guest ${index + 1}: Invalid email format`);
        }
      }
    });
  }

  // Validate payment method
  if (!state.paymentMethod) {
    errors.push('Please select a payment method');
    missingFields.push('paymentMethod');
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields,
  };
}

/**
 * Get user-friendly error message from validation result
 */
export function getValidationErrorMessage(validation: ValidationResult): string {
  if (validation.isValid) {
    return '';
  }

  if (validation.errors.length === 1) {
    return validation.errors[0];
  }

  if (validation.errors.length <= 3) {
    return validation.errors.join(', ');
  }

  return `${validation.errors.slice(0, 2).join(', ')} and ${validation.errors.length - 2} more issue${validation.errors.length - 2 > 1 ? 's' : ''}`;
}

