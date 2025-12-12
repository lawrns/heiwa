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
 * Fix Supabase storage bucket name mismatch
 * Maps old /rooms/ bucket URLs to correct /room-images/ bucket
 */
function fixSupabaseBucketUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  
  // Fix bucket name mismatch: /rooms/ -> /room-images/
  // The database has old URLs pointing to /rooms/ bucket which doesn't exist
  // The actual bucket is /room-images/
  if (url.includes('/storage/v1/object/public/rooms/') && !url.includes('/room-images/')) {
    return url.replace('/storage/v1/object/public/rooms/', '/storage/v1/object/public/room-images/');
  }
  
  return url;
}

/**
 * Process room images from CMS/database
 * Always uses CMS images as the source of truth.
 * Fallback to featured_image or defaults only if CMS images array is empty.
 * This ensures the widget always displays what the admin configured in the CMS.
 */
export function processRoomImages(
  roomImages: string[] | undefined,
  featuredImage: string | undefined,
  roomType: 'private' | 'shared' | 'dorm'
): string[] {
  console.log('🔍 processRoomImages called with:', {
    roomImages,
    featuredImage,
    roomType,
    roomImagesLength: roomImages?.length || 0,
    hasFeaturedImage: !!featuredImage
  });

  // PRIMARY: Use images array from CMS (source of truth)
  // IMPORTANT: Do NOT filter out Supabase storage URLs - they are valid!
  if (roomImages && Array.isArray(roomImages) && roomImages.length > 0) {
    console.log('📋 Processing CMS images array:', roomImages);
    
    // Fix bucket name mismatch and filter out only truly invalid patterns
    const fixedImages = roomImages.map(url => {
      const fixed = fixSupabaseBucketUrl(url);
      if (url !== fixed) {
        console.log(`🔧 Fixed bucket URL: ${url} -> ${fixed}`);
      }
      return fixed;
    });

    const validImages = fixedImages.filter(url => {
      if (!url || typeof url !== 'string' || url.trim() === '') {
        console.log(`❌ Filtered out empty/invalid URL:`, url);
        return false;
      }
      // Only filter out known invalid patterns, not Supabase URLs
      if (INVALID_IMAGE_PATTERNS.some(pattern => url.includes(pattern))) {
        console.log(`❌ Filtered out invalid pattern URL:`, url);
        return false;
      }
      // Accept all valid URL formats (including Supabase storage URLs)
      const isValid = VALID_IMAGE_PREFIXES.some(prefix => url.startsWith(prefix));
      if (!isValid) {
        console.log(`❌ Filtered out URL with invalid prefix:`, url);
      }
      return isValid;
    });
    
    if (validImages.length > 0) {
      console.log(`✅ Using ${validImages.length} image(s) from CMS:`, validImages);
      // Check for yoga dome images that shouldn't be here
      const yogaDomeImages = validImages.filter(img => img.includes('yoga_dome') || img.includes('yoga-dome'));
      if (yogaDomeImages.length > 0) {
        console.error(`🚨 ERROR: Found yoga dome images in room images!`, yogaDomeImages);
        // Filter them out!
        const filteredImages = validImages.filter(img => !img.includes('yoga_dome') && !img.includes('yoga-dome'));
        console.log(`🔧 Filtered out yoga dome images, remaining:`, filteredImages);
        return filteredImages.length > 0 ? filteredImages : []; // Return empty to trigger fallback
      }
      return validImages;
    } else {
      console.warn(`⚠️ No valid images after filtering from CMS array`);
    }
  } else {
    console.log(`⚠️ No CMS images array provided`);
  }

  // SECONDARY: Fallback to featured image if images array is empty
  if (featuredImage && isValidImageUrl(featuredImage)) {
    const fixedFeatured = fixSupabaseBucketUrl(featuredImage);
    console.log(`⚠️ Using featured_image fallback:`, fixedFeatured);
    // Check for yoga dome
    if (fixedFeatured.includes('yoga_dome') || fixedFeatured.includes('yoga-dome')) {
      console.error(`🚨 ERROR: Featured image is yoga dome! Rejecting.`);
      // Don't return it, fall through to default fallback
    } else {
      return [fixedFeatured];
    }
  }

  // TERTIARY: Use default placeholder images only if CMS has no images
  // This is a last resort for rooms without any configured images
  console.log(`⚠️ Using default fallback images for room type: ${roomType}`);
  const fallbackImages = roomType === 'dorm'
    ? [...ROOM_FALLBACK_IMAGES.dorm]
    : [...ROOM_FALLBACK_IMAGES.private];
  console.log(`📦 Fallback images:`, fallbackImages);
  return fallbackImages;
}

/**
 * Transform API room data to Room interface
 */
export function transformApiRoomToRoom(apiRoom: any): Room {
  const roomType = determineRoomType(apiRoom.booking_type || '', apiRoom.capacity || 1);
  const images = processRoomImages(apiRoom.images, apiRoom.featured_image, roomType);
  const bookingType: Room['bookingType'] =
    typeof apiRoom.booking_type === 'string' && apiRoom.booking_type.toLowerCase().includes('bed')
      ? 'per_bed'
      : 'entire_room';

  // Extract and normalize pricing data
  const pricing = apiRoom.pricing ? {
    standard: apiRoom.pricing.standard,
    offSeason: apiRoom.pricing.offSeason,
    surfCamp: apiRoom.pricing.surfCamp ? {
      strategy: apiRoom.pricing.surfCamp.strategy || 'perBed',
      perBed: apiRoom.pricing.surfCamp.perBed,
      occupancy: apiRoom.pricing.surfCamp.occupancy,
    } : undefined,
  } : undefined;

  return {
    id: apiRoom.id,
    name: apiRoom.name,
    description: apiRoom.description || '',
    type: roomType,
    bookingType,
    maxOccupancy: apiRoom.capacity,
    pricePerNight: apiRoom.price_per_night,
    amenities: apiRoom.amenities || [],
    images: images,
    isAvailable: true, // All returned rooms are available or shown
    pricing: pricing,
    // NEW: Available beds info from availability API
    availableBeds: apiRoom.available_beds ?? apiRoom.capacity, // Fallback to capacity if not provided
    assignedCount: apiRoom.assigned_count ?? 0,
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
  roomAssignments?: Array<{ roomId: string; guestIds: string[] }>;
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
    const hasRoomSelection = !!state.selectedOption;
    const hasRoomAssignments = (state.roomAssignments?.length || 0) > 0;
    if (!hasRoomSelection && !hasRoomAssignments) {
      errors.push('Please select a room (or assign guests to rooms)');
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

