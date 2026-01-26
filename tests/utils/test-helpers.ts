/**
 * Test Helper Utilities and Mock Factories
 * Provides consistent test data generation and utility functions
 */

import { BookingRequest, Room, ExtendedRoom } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

export interface MockBooking extends BookingRequest {
  id?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
  totalAmount?: number;
  currency?: string;
}

export interface MockClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt?: Date;
}

export interface MockPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer';
  transactionId?: string;
  createdAt?: Date;
}

export interface MockSurfCamp {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  enrolledCount: number;
  status: 'upcoming' | 'active' | 'completed';
}

// ============================================================================
// Mock Factories
// ============================================================================

let mockIdCounter = 0;

/**
 * Generate a unique mock ID
 */
export function generateMockId(prefix = 'mock'): string {
  mockIdCounter += 1;
  return `${prefix}_${Date.now()}_${mockIdCounter}`;
}

/**
 * Create a mock booking with sensible defaults
 */
export function createMockBooking(overrides: Partial<MockBooking> = {}): MockBooking {
  const checkIn = overrides.checkIn || getFutureDate(7);
  const checkOut = overrides.checkOut || getFutureDate(10);
  
  return {
    id: generateMockId('booking'),
    clientName: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    checkIn,
    checkOut,
    roomId: 'room_1',
    guests: 2,
    message: '',
    status: 'pending',
    createdAt: new Date(),
    totalAmount: 300,
    currency: 'EUR',
    ...overrides,
  };
}

/**
 * Create a mock room with sensible defaults
 */
export function createMockRoom(overrides: Partial<ExtendedRoom> = {}): ExtendedRoom {
  return {
    id: generateMockId('room'),
    name: 'Test Room',
    image: '/images/rooms/test-room.jpg',
    images: ['/images/rooms/test-room.jpg', '/images/rooms/test-room-2.jpg'],
    description: 'A comfortable test room',
    capacity: 2,
    pricing: {
      standard: 100,
      offSeason: 80,
    },
    bookingType: 'whole',
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
    isActive: true,
    ...overrides,
  };
}

/**
 * Create a mock client with sensible defaults
 */
export function createMockClient(overrides: Partial<MockClient> = {}): MockClient {
  return {
    id: generateMockId('client'),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+1234567890',
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock payment with sensible defaults
 */
export function createMockPayment(overrides: Partial<MockPayment> = {}): MockPayment {
  return {
    id: generateMockId('payment'),
    bookingId: 'booking_1',
    amount: 300,
    currency: 'EUR',
    status: 'pending',
    paymentMethod: 'card',
    transactionId: undefined,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock surf camp with sensible defaults
 */
export function createMockSurfCamp(overrides: Partial<MockSurfCamp> = {}): MockSurfCamp {
  return {
    id: generateMockId('surfcamp'),
    name: 'Beginner Surf Week',
    startDate: getFutureDate(14),
    endDate: getFutureDate(21),
    price: 899,
    capacity: 12,
    enrolledCount: 0,
    status: 'upcoming',
    ...overrides,
  };
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Create a date N days in the future
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Create a date N days in the past
 */
export function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Create a Date object N days from now
 */
export function createFutureDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Create a Date object N days ago
 */
export function createPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a string is a valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a date string is in valid ISO format
 */
export function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// ============================================================================
// Test Data Collections
// ============================================================================

/**
 * Collection of valid test emails
 */
export const validEmails = [
  'test@example.com',
  'user.name@domain.org',
  'user+tag@example.co.uk',
  'simple@test.io',
];

/**
 * Collection of invalid test emails
 */
export const invalidEmails = [
  '',
  'notanemail',
  '@nodomain.com',
  'no@domain',
  'spaces in@email.com',
  'missing@.com',
];

/**
 * Collection of valid phone numbers
 */
export const validPhones = [
  '+1234567890',
  '+44 20 7946 0958',
  '(555) 123-4567',
  '555.123.4567',
];

/**
 * Reset mock ID counter (useful between tests)
 */
export function resetMockIdCounter(): void {
  mockIdCounter = 0;
}
