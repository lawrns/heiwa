/**
 * Application constants and configuration
 * Centralized location for magic strings, default values, and fallback data
 */

/**
 * Default fallback images for rooms
 */
export const ROOM_FALLBACK_IMAGES = {
  dorm: [
    '/images/rooms/dorm.webp',
    '/images/Freedomroutes-rooms-1.jpg',
    '/images/Freedomroutes-rooms-50.jpg',
    '/images/DSC03521-scaled.jpg'
  ],
  private: [
    '/images/rooms/room1.jpg',
    '/images/rooms/room2.webp',
    '/images/rooms/room3.webp',
    '/images/DSC02099-scaled.jpg'
  ],
  shared: [
    '/images/rooms/room2.webp',
    '/images/rooms/room3.webp',
    '/images/DSC02099-scaled.jpg',
    '/images/DSC02102-scaled.jpg'
  ]
} as const;

/**
 * Invalid image URL patterns to filter out
 */
export const INVALID_IMAGE_PATTERNS = [
  'heiwahouse.com/wp-content'
] as const;

/**
 * Valid image path prefixes
 */
export const VALID_IMAGE_PREFIXES = [
  '/',
  'http://',
  'https://'
] as const;

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'EUR' as const;

/**
 * Default locale for formatting
 */
export const DEFAULT_LOCALE = 'en-US' as const;

