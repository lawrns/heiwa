/**
 * Mock Data Factories
 * Generate test data for various entities
 */

// Simple mock data generators (no external dependencies)

/**
 * Create a mock client
 */
export function createMockClient(overrides: Partial<any> = {}) {
  return {
    id: `client-${Math.random().toString(36).substr(2, 9)}`,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+351912345678',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock booking
 */
export function createMockBooking(overrides: Partial<any> = {}) {
  const checkIn = new Date()
  checkIn.setDate(checkIn.getDate() + 7)
  const checkOut = new Date(checkIn)
  checkOut.setDate(checkOut.getDate() + 3)

  return {
    id: `booking-${Math.random().toString(36).substr(2, 9)}`,
    client_ids: [createMockClient().id],
    items: [
      {
        type: 'room',
        itemId: 'room-1',
        quantity: 1,
        unitPrice: 80,
        totalPrice: 240,
        dates: {
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
        },
      },
    ],
    total_amount: 240,
    status: 'pending',
    payment_status: 'pending',
    payment_method: null,
    notes: '',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock room
 */
export function createMockRoom(overrides: Partial<any> = {}) {
  return {
    id: `room-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Ocean View Room',
    description: 'Beautiful room with ocean view',
    capacity: 2,
    booking_type: 'whole',
    pricing: {
      standard: 100,
      offSeason: 80,
    },
    amenities: ['wifi', 'kitchen', 'ocean-view'],
    images: ['/images/rooms/room1.jpg'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock surf camp
 */
export function createMockSurfCamp(overrides: Partial<any> = {}) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 30)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)

  return {
    id: `camp-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Beginner Surf Week',
    description: '7-day surf camp for beginners',
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    price: 500,
    max_participants: 10,
    total_spots: 10,
    available_spots: 8,
    enrolled_count: 2,
    is_full: false,
    level: 'beginner',
    images: ['/images/surf-camp.jpg'],
    includes: ['Surf lessons', 'Equipment', 'Accommodation'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock invoice
 */
export function createMockInvoice(overrides: Partial<any> = {}) {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  return {
    id: `invoice-${Math.random().toString(36).substr(2, 9)}`,
    booking_id: createMockBooking().id,
    invoice_number: `HW-INV-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    amount: 240,
    currency: 'EUR',
    status: 'draft',
    due_date: dueDate.toISOString().split('T')[0],
    sent_date: null,
    paid_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock payment
 */
export function createMockPayment(overrides: Partial<any> = {}) {
  return {
    id: `payment-${Math.random().toString(36).substr(2, 9)}`,
    booking_id: createMockBooking().id,
    amount: 240,
    currency: 'EUR',
    payment_method: 'stripe',
    payment_status: 'completed',
    transaction_id: `txn_${Math.random().toString(36).substr(2, 20)}`,
    payment_date: new Date().toISOString(),
    refund_amount: 0,
    refund_reason: null,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock testimonial
 */
export function createMockTestimonial(overrides: Partial<any> = {}) {
  return {
    id: `testimonial-${Math.random().toString(36).substr(2, 9)}`,
    author_name: 'Jane Smith',
    author_email: 'jane@example.com',
    author_image: '/images/avatar.jpg',
    content: 'Amazing experience!',
    rating: Math.floor(Math.random() * 5) + 1,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create mock CMS page content
 */
export function createMockPageContent(overrides: Partial<any> = {}) {
  return {
    id: `content-${Math.random().toString(36).substr(2, 9)}`,
    page_slug: 'surf',
    section_type: 'hero',
    section_name: 'Hero Section',
    content: {
      title: 'Surf Page',
      description: 'Amazing surf experiences',
    },
    order_index: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

