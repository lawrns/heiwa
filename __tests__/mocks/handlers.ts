import { http, HttpResponse } from 'msw'

// Mock data factories
export const createMockRoom = (overrides = {}) => ({
  id: 'room-1',
  name: 'Dorm room',
  description: 'Shared dormitory room with ocean views',
  capacity: 6,
  price_per_night: 30,
  images: ['/images/dorm-room.jpg'],
  amenities: ['wifi', 'kitchen', 'ocean-view'],
  available: true,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockBooking = (overrides = {}) => ({
  id: 'booking-1',
  client_ids: ['client-1'],
  check_in: '2026-02-01',
  check_out: '2026-02-03',
  room_type: 'Test Room',
  guests: 2,
  status: 'confirmed',
  payment_status: 'confirmed',
  total_amount: 60,
  source: 'website',
  notes: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockAddOn = (overrides = {}) => ({
  id: 'addon-1',
  name: 'Surf Lesson',
  description: '2-hour surf lesson with instructor',
  price: 50,
  duration: '2 hours',
  available: true,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockSurfCamp = (overrides = {}) => ({
  id: 'camp-1',
  name: 'Beginner Surf Camp',
  description: '7-day surf camp for beginners',
  price: 500,
  duration: '7 days',
  level: 'beginner',
  max_participants: 10,
  available: true,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

// API handlers
export const handlers = [
  // Rooms API
  http.get('/api/rooms', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('error') === 'true') {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    return HttpResponse.json([
      createMockRoom(),
      createMockRoom({ id: 'room-2', name: 'Private Room', price_per_night: 80, capacity: 1 }),
      createMockRoom({ id: 'room-3', name: 'Suite', price_per_night: 120, capacity: 2 }),
      createMockRoom({ id: 'room-4', name: 'The Cave', price_per_night: 90, capacity: 3 })
    ])
  }),

  http.post('/api/rooms', () => {
    return HttpResponse.json({ message: 'Room created successfully', room: createMockRoom() }, { status: 201 })
  }),

  // Bookings API
  http.get('/api/bookings', () => {
    return HttpResponse.json([
      createMockBooking(),
      createMockBooking({ id: 'booking-2', clientName: 'Jane Smith' })
    ])
  }),

  http.post('/api/bookings', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('error') === 'true') {
      return HttpResponse.json({ error: 'Booking failed', message: 'Room not available' }, { status: 400 })
    }
    return HttpResponse.json({
      message: 'Booking created successfully',
      booking: createMockBooking(),
      success: true
    }, { status: 201 })
  }),

  // Add-ons API
  http.get('/api/add-ons', () => {
    return HttpResponse.json([
      createMockAddOn(),
      createMockAddOn({ id: 'addon-2', name: 'Yoga Class', price: 30 }),
      createMockAddOn({ id: 'addon-3', name: 'Bike Rental', price: 25 })
    ])
  }),

  http.post('/api/add-ons', () => {
    return HttpResponse.json({ message: 'Add-on created successfully', addon: createMockAddOn() }, { status: 201 })
  }),

  // Surf Camps API
  http.get('/api/surf-camps', () => {
    return HttpResponse.json([
      createMockSurfCamp(),
      createMockSurfCamp({ id: 'camp-2', name: 'Advanced Surf Camp', level: 'advanced', price: 700 })
    ])
  }),

  http.post('/api/surf-camps', () => {
    return HttpResponse.json({ message: 'Surf camp created successfully', surfCamp: createMockSurfCamp() }, { status: 201 })
  }),

  // Availability API
  http.get('/api/dates/availability', ({ request }) => {
    const url = new URL(request.url)
    const checkIn = url.searchParams.get('checkIn')
    const checkOut = url.searchParams.get('checkOut')

    return HttpResponse.json({
      available: true,
      availableRooms: ['room-1', 'room-2'],
      checkIn,
      checkOut,
      message: 'Dates are available'
    })
  }),

  http.get('/api/rooms/availability', ({ request }) => {
    const url = new URL(request.url)
    const roomId = url.searchParams.get('roomId')
    const checkIn = url.searchParams.get('checkIn')
    const checkOut = url.searchParams.get('checkOut')

    return HttpResponse.json({
      available: roomId !== 'room-1',
      roomId,
      checkIn,
      checkOut,
      message: roomId === 'room-1' ? 'Room not available for selected dates' : 'Room is available'
    })
  }),

  // Google Reviews API
  http.get('/api/google-reviews', () => {
    return HttpResponse.json({
      reviews: [
        {
          id: 'review-1',
          author_name: 'John Doe',
          rating: 5,
          text: 'Amazing experience! Highly recommended.',
          relative_time_description: '1 week ago'
        },
        {
          id: 'review-2',
          author_name: 'Jane Smith',
          rating: 4,
          text: 'Great place to stay, beautiful location.',
          relative_time_description: '2 weeks ago'
        }
      ],
      average_rating: 4.5,
      total_reviews: 128
    })
  }),

  // Payments API
  http.get('/api/payments', () => {
    return HttpResponse.json({
      success: true,
      data: {
        payments: [
          {
            id: 'payment-1',
            booking_id: 'booking-1',
            amount: 100,
            currency: 'EUR',
            payment_method: 'stripe',
            payment_status: 'completed',
            created_at: '2025-01-20T00:00:00Z',
          },
        ],
      },
    })
  }),

  http.post('/api/payments', () => {
    return HttpResponse.json({
      success: true,
      data: {
        payment: {
          id: 'payment-1',
          booking_id: 'booking-1',
          amount: 100,
          currency: 'EUR',
          payment_method: 'stripe',
          payment_status: 'completed',
          created_at: '2025-01-20T00:00:00Z',
        },
      },
    }, { status: 201 })
  }),

  // Invoices API
  http.get('/api/invoices', () => {
    return HttpResponse.json({
      success: true,
      data: {
        invoices: [
          {
            id: 'invoice-1',
            booking_id: 'booking-1',
            invoice_number: 'HW-INV-2025-0001',
            amount: 100,
            currency: 'EUR',
            status: 'sent',
            created_at: '2025-01-20T00:00:00Z',
          },
        ],
      },
    })
  }),

  http.post('/api/invoices', () => {
    return HttpResponse.json({
      success: true,
      data: {
        invoice: {
          id: 'invoice-1',
          booking_id: 'booking-1',
          invoice_number: 'HW-INV-2025-0001',
          amount: 100,
          currency: 'EUR',
          status: 'draft',
          created_at: '2025-01-20T00:00:00Z',
        },
      },
    }, { status: 201 })
  }),

  // Enrollments API
  http.get('/api/enrollments', () => {
    return HttpResponse.json({
      success: true,
      data: {
        enrollments: [
          {
            id: 'enrollment-1',
            surf_camp_id: 'camp-1',
            client_id: 'client-1',
            status: 'confirmed',
            skill_level: 'beginner',
            created_at: '2025-01-20T00:00:00Z',
          },
        ],
      },
    })
  }),

  http.post('/api/enrollments', () => {
    return HttpResponse.json({
      success: true,
      data: {
        enrollment: {
          id: 'enrollment-1',
          surf_camp_id: 'camp-1',
          client_id: 'client-1',
          status: 'pending',
          created_at: '2025-01-20T00:00:00Z',
        },
      },
    }, { status: 201 })
  }),

  // Assignments API
  http.get('/api/assignments/participants', () => {
    return HttpResponse.json({
      success: true,
      data: {
        participants: [
          {
            id: 'enrollment-1',
            client_id: 'client-1',
            surf_camp_id: 'camp-1',
            status: 'confirmed',
          },
        ],
      },
    })
  }),

  http.get('/api/assignments/rooms', () => {
    return HttpResponse.json({
      success: true,
      data: {
        rooms: [
          {
            id: 'room-1',
            name: 'Dorm Room',
            capacity: 6,
          },
        ],
      },
    })
  }),

  // Analytics API
  http.get('/api/analytics/revenue', () => {
    return HttpResponse.json({
      success: true,
      data: {
        revenue: [
          { month: '2025-01', amount: 1000, growth: 0 },
          { month: '2025-02', amount: 1200, growth: 20 },
        ],
      },
    })
  }),

  // Calendar Events API
  http.get('/api/calendar-events', () => {
    return HttpResponse.json({
      success: true,
      data: {
        events: [
          {
            id: 'event-1',
            title: 'Surf Lesson',
            start_date: '2025-01-20T10:00:00Z',
            end_date: '2025-01-20T12:00:00Z',
            event_type: 'surf_camp',
          },
        ],
      },
    })
  }),

  http.post('/api/calendar-events', () => {
    return HttpResponse.json({
      success: true,
      data: {
        event: {
          id: 'event-1',
          title: 'Surf Lesson',
          start_date: '2025-01-20T10:00:00Z',
          end_date: '2025-01-20T12:00:00Z',
          event_type: 'surf_camp',
          created_at: '2025-01-20T00:00:00Z',
        },
      },
    }, { status: 201 })
  }),

  // Upload API
  http.post('/api/upload', () => {
    return HttpResponse.json({
      success: true,
      data: {
        url: 'https://example.com/test/image.jpg',
        path: 'test/image.jpg',
        bucket: 'room-images',
        filename: 'test.jpg',
        size: 1024,
        type: 'image/jpeg',
      },
    })
  })
]
