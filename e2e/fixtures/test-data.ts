/**
 * Test data fixtures for production admin tests
 */

export interface TestBookingData {
  guestName: string
  guestEmail: string
  guestPhone: string
  experienceType: 'room' | 'surf-week'
  checkIn: string
  checkOut: string
  guests: number
  paymentMethod: 'card_stripe' | 'bank_wire'
  roomId?: string
  surfWeekId?: string
  addOns?: Array<{ id: string; quantity: number }>
  notes?: string
}

export interface TestClientData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface TestRoomData {
  name: string
  description: string
  price: number
  capacity: number
  roomType: 'private' | 'shared'
}

export interface TestSurfCampData {
  name: string
  startDate: string
  endDate: string
  price: number
  capacity: number
  level: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Generate unique test identifiers
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}@test.heiwahouse.com`
}

/**
 * Generate test phone number
 */
export function generateTestPhone(): string {
  return `+351912${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
}

/**
 * Get future date (days from now)
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

/**
 * Get future date object
 */
export function getFutureDateObject(daysFromNow: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

/**
 * Test booking data templates
 */
export const testBookingTemplates = {
  roomBooking: (): TestBookingData => ({
    guestName: `Test Guest ${generateTestId()}`,
    guestEmail: generateTestEmail('room-booking'),
    guestPhone: generateTestPhone(),
    experienceType: 'room',
    checkIn: getFutureDate(7),
    checkOut: getFutureDate(10),
    guests: 2,
    paymentMethod: 'bank_wire',
    notes: `Test room booking - ${generateTestId()}`,
  }),

  surfWeekBooking: (): TestBookingData => ({
    guestName: `Test Guest ${generateTestId()}`,
    guestEmail: generateTestEmail('surf-week'),
    guestPhone: generateTestPhone(),
    experienceType: 'surf-week',
    checkIn: getFutureDate(30),
    checkOut: getFutureDate(37),
    guests: 1,
    paymentMethod: 'bank_wire',
    notes: `Test surf week booking - ${generateTestId()}`,
  }),

  bankTransferBooking: (): TestBookingData => ({
    guestName: `Bank Transfer Guest ${generateTestId()}`,
    guestEmail: generateTestEmail('bank-transfer'),
    guestPhone: generateTestPhone(),
    experienceType: 'room',
    checkIn: getFutureDate(14),
    checkOut: getFutureDate(17),
    guests: 2,
    paymentMethod: 'bank_wire',
    notes: `Bank transfer test booking - ${generateTestId()}`,
  }),
}

/**
 * Test client data templates
 */
export const testClientTemplates = {
  newClient: (): TestClientData => ({
    firstName: `Test${generateTestId().substr(0, 5)}`,
    lastName: `User${generateTestId().substr(0, 5)}`,
    email: generateTestEmail('client'),
    phone: generateTestPhone(),
  }),
}

/**
 * Test room data templates
 */
export const testRoomTemplates = {
  privateRoom: (): TestRoomData => ({
    name: `Test Private Room ${generateTestId().substr(0, 8)}`,
    description: 'Test private room description',
    price: 80,
    capacity: 2,
    roomType: 'private',
  }),

  sharedRoom: (): TestRoomData => ({
    name: `Test Shared Room ${generateTestId().substr(0, 8)}`,
    description: 'Test shared room description',
    price: 30,
    capacity: 6,
    roomType: 'shared',
  }),
}

/**
 * Test surf camp data templates
 */
export const testSurfCampTemplates = {
  beginnerCamp: (): TestSurfCampData => ({
    name: `Test Beginner Camp ${generateTestId().substr(0, 8)}`,
    startDate: getFutureDate(60),
    endDate: getFutureDate(67),
    price: 450,
    capacity: 18,
    level: 'beginner',
  }),

  intermediateCamp: (): TestSurfCampData => ({
    name: `Test Intermediate Camp ${generateTestId().substr(0, 8)}`,
    startDate: getFutureDate(90),
    endDate: getFutureDate(97),
    price: 500,
    capacity: 18,
    level: 'intermediate',
  }),
}


