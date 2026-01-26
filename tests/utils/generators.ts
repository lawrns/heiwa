/**
 * Property-Based Test Generators
 * Provides fast-check arbitraries for generating test data
 */

import * as fc from 'fast-check';

// ============================================================================
// Date Generators
// ============================================================================

/**
 * Generate a future date (1-365 days from now)
 */
export const futureDateArb = fc.integer({ min: 1, max: 365 }).map(days => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
});

/**
 * Generate a past date (1-365 days ago)
 */
export const pastDateArb = fc.integer({ min: 1, max: 365 }).map(days => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
});

/**
 * Generate a valid date range (checkIn before checkOut, both in future)
 */
export const validDateRangeArb = fc
  .tuple(
    fc.integer({ min: 1, max: 300 }),  // days until check-in
    fc.integer({ min: 2, max: 30 })     // length of stay (min 2 nights)
  )
  .map(([daysUntilCheckIn, stayLength]) => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + daysUntilCheckIn);
    checkIn.setHours(0, 0, 0, 0);
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + stayLength);
    
    return { checkIn, checkOut };
  });

/**
 * Generate an invalid date range (checkOut before or equal to checkIn)
 */
export const invalidDateRangeArb = fc
  .tuple(
    fc.integer({ min: 1, max: 300 }),
    fc.integer({ min: -10, max: 1 })  // negative or zero stay length
  )
  .map(([daysUntilCheckIn, stayLength]) => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + daysUntilCheckIn);
    checkIn.setHours(0, 0, 0, 0);
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + stayLength);
    
    return { checkIn, checkOut };
  });

// ============================================================================
// Email Generators
// ============================================================================

/**
 * Generate a valid email address
 */
export const validEmailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]{1,20}$/),
    fc.stringMatching(/^[a-z0-9]{1,15}$/),
    fc.constantFrom('com', 'org', 'net', 'io', 'co.uk', 'de', 'fr')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/**
 * Generate an invalid email address
 */
export const invalidEmailArb = fc.oneof(
  fc.constant(''),
  fc.constant('notanemail'),
  fc.constant('@nodomain.com'),
  fc.constant('no@domain'),
  fc.stringMatching(/^[a-z ]{5,20}$/).filter(s => !s.includes('@')),
);

// ============================================================================
// Price Generators
// ============================================================================

/**
 * Generate a valid price (positive number with up to 2 decimal places)
 */
export const validPriceArb = fc.double({ min: 0.01, max: 100000, noNaN: true })
  .map(n => Math.round(n * 100) / 100);

/**
 * Generate an invalid price (negative, zero, or NaN)
 */
export const invalidPriceArb = fc.oneof(
  fc.constant(0),
  fc.constant(-1),
  fc.double({ min: -10000, max: -0.01, noNaN: true }),
  fc.constant(NaN),
  fc.constant(Infinity),
);

/**
 * Generate a currency code
 */
export const currencyCodeArb = fc.constantFrom('EUR', 'USD', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD');

// ============================================================================
// Guest Generators
// ============================================================================

/**
 * Generate a valid guest count (1-20)
 */
export const validGuestCountArb = fc.integer({ min: 1, max: 20 });

/**
 * Generate an invalid guest count
 */
export const invalidGuestCountArb = fc.oneof(
  fc.constant(0),
  fc.constant(-1),
  fc.integer({ min: 21, max: 100 }),
);

/**
 * Generate valid guest details
 */
export const validGuestDetailsArb = fc.record({
  firstName: fc.stringMatching(/^[A-Za-z]{1,30}$/),
  lastName: fc.stringMatching(/^[A-Za-z]{1,30}$/),
  email: validEmailArb,
  phone: fc.option(fc.stringMatching(/^[0-9+\- ()]{7,20}$/), { nil: undefined }),
});

/**
 * Generate an array of valid guest details
 */
export const validGuestDetailsArrayArb = (count: number) => 
  fc.array(validGuestDetailsArb, { minLength: count, maxLength: count });

// ============================================================================
// Booking Generators
// ============================================================================

/**
 * Generate a valid booking submission
 */
export const validBookingArb = fc.record({
  clientName: fc.stringMatching(/^[A-Za-z ]{2,50}$/),
  email: validEmailArb,
  phone: fc.option(fc.stringMatching(/^[0-9+\- ()]{7,20}$/), { nil: undefined }),
  checkIn: futureDateArb.map(d => d.toISOString().split('T')[0]),
  checkOut: fc.integer({ min: 2, max: 30 }).map(days => {
    const date = new Date();
    date.setDate(date.getDate() + 7 + days); // At least 7 days from now + stay length
    return date.toISOString().split('T')[0];
  }),
  roomId: fc.stringMatching(/^[a-z0-9\-_]{1,36}$/),
  guests: validGuestCountArb,
  message: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
});

/**
 * Generate an invalid booking (missing required fields)
 */
export const invalidBookingArb = fc.oneof(
  // Missing client name
  validBookingArb.map(b => ({ ...b, clientName: '' })),
  // Missing email
  validBookingArb.map(b => ({ ...b, email: '' })),
  // Invalid email
  validBookingArb.map(b => ({ ...b, email: 'notanemail' })),
  // Missing room
  validBookingArb.map(b => ({ ...b, roomId: '' })),
  // Invalid guest count
  validBookingArb.map(b => ({ ...b, guests: 0 })),
  // Missing check-in
  validBookingArb.map(b => ({ ...b, checkIn: '' })),
  // Missing check-out
  validBookingArb.map(b => ({ ...b, checkOut: '' })),
);

// ============================================================================
// Room Generators
// ============================================================================

/**
 * Generate a valid room type
 */
export const roomTypeArb = fc.constantFrom('private', 'shared', 'dorm');

/**
 * Generate a valid booking type
 */
export const bookingTypeArb = fc.constantFrom('whole', 'perBed');

/**
 * Generate valid room images
 */
export const validRoomImagesArb = fc.array(
  fc.constantFrom(
    '/images/rooms/room1.jpg',
    '/images/rooms/room2.jpg',
    'https://example.com/room.jpg',
    'https://storage.supabase.co/room-images/room.jpg'
  ),
  { minLength: 1, maxLength: 5 }
);

/**
 * Generate a valid room
 */
export const validRoomArb = fc.record({
  id: fc.uuid(),
  name: fc.stringMatching(/^[A-Za-z0-9 ]{3,50}$/),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  capacity: fc.integer({ min: 1, max: 10 }),
  booking_type: bookingTypeArb,
  price_per_night: validPriceArb,
  images: validRoomImagesArb,
  amenities: fc.array(fc.constantFrom('WiFi', 'AC', 'TV', 'Bathroom', 'Balcony'), { maxLength: 5 }),
  isActive: fc.boolean(),
});

// ============================================================================
// Image URL Generators
// ============================================================================

/**
 * Generate a valid image URL
 */
export const validImageUrlArb = fc.oneof(
  fc.constant('/images/rooms/room1.jpg'),
  fc.constant('/images/rooms/room2.jpg'),
  fc.stringMatching(/^[a-z0-9\-_]{5,20}$/)
    .map(name => `https://example.com/images/${name}.jpg`),
  fc.stringMatching(/^[a-z0-9\-_]{5,20}$/)
    .map(name => `https://storage.supabase.co/room-images/${name}.jpg`),
);

/**
 * Generate an invalid image URL
 */
export const invalidImageUrlArb = fc.oneof(
  fc.constant(''),
  fc.constant('not-a-url'),
  fc.constant('ftp://invalid-protocol.com/image.jpg'),
  fc.constant('javascript:alert(1)'),
  fc.constant('data:image/png;base64,invalid'),
);

// ============================================================================
// API Response Generators
// ============================================================================

/**
 * Generate a success API response
 */
export const successResponseArb = <T>(dataArb: fc.Arbitrary<T>) =>
  dataArb.map(data => ({
    success: true as const,
    data,
  }));

/**
 * Generate an error API response
 */
export const errorResponseArb = fc.record({
  success: fc.constant(false as const),
  error: fc.stringMatching(/^[A-Za-z ]{5,100}$/),
  message: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
});

// ============================================================================
// Component Prop Generators
// ============================================================================

/**
 * Generate button variants
 */
export const buttonVariantArb = fc.constantFrom(
  'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
);

/**
 * Generate button sizes
 */
export const buttonSizeArb = fc.constantFrom('default', 'sm', 'lg', 'icon');

/**
 * Generate input types
 */
export const inputTypeArb = fc.constantFrom('text', 'email', 'password', 'number', 'tel', 'url');

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a generator that produces N items
 */
export function arrayOfN<T>(arb: fc.Arbitrary<T>, n: number): fc.Arbitrary<T[]> {
  return fc.array(arb, { minLength: n, maxLength: n });
}

/**
 * Create a generator that produces unique items
 */
export function uniqueArray<T>(arb: fc.Arbitrary<T>, maxLength: number = 10): fc.Arbitrary<T[]> {
  return fc.uniqueArray(arb, { maxLength });
}
