import { rest } from 'msw'

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
  clientName: 'John Doe',
  email: 'john@example.com',
  phone: '+351 912 193 785',
  checkIn: '2026-02-01',
  checkOut: '2026-02-03',
  roomId: 'room-1',
  guests: 2,
  status: 'confirmed',
  total_amount: 60,
  created_at: '2024-01-01T00:00:00Z',
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
  rest.get('/api/rooms', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        createMockRoom(),
        createMockRoom({ id: 'room-2', name: 'Private Room', price_per_night: 80, capacity: 1 }),
        createMockRoom({ id: 'room-3', name: 'Suite', price_per_night: 120, capacity: 2 }),
        createMockRoom({ id: 'room-4', name: 'The Cave', price_per_night: 90, capacity: 3 })
      ])
    )
  }),

  rest.post('/api/rooms', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: 'Room created successfully', room: createMockRoom() })
    )
  }),

  // Bookings API
  rest.get('/api/bookings', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        createMockBooking(),
        createMockBooking({ id: 'booking-2', clientName: 'Jane Smith' })
      ])
    )
  }),

  rest.post('/api/bookings', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ 
        message: 'Booking created successfully', 
        booking: createMockBooking(),
        success: true 
      })
    )
  }),

  // Add-ons API
  rest.get('/api/add-ons', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        createMockAddOn(),
        createMockAddOn({ id: 'addon-2', name: 'Yoga Class', price: 30 }),
        createMockAddOn({ id: 'addon-3', name: 'Bike Rental', price: 25 })
      ])
    )
  }),

  rest.post('/api/add-ons', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: 'Add-on created successfully', addon: createMockAddOn() })
    )
  }),

  // Surf Camps API
  rest.get('/api/surf-camps', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        createMockSurfCamp(),
        createMockSurfCamp({ id: 'camp-2', name: 'Advanced Surf Camp', level: 'advanced', price: 700 })
      ])
    )
  }),

  rest.post('/api/surf-camps', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: 'Surf camp created successfully', surfCamp: createMockSurfCamp() })
    )
  }),

  // Availability API
  rest.get('/api/dates/availability', (req, res, ctx) => {
    const checkIn = req.url.searchParams.get('checkIn')
    const checkOut = req.url.searchParams.get('checkOut')
    
    return res(
      ctx.status(200),
      ctx.json({
        available: true,
        availableRooms: ['room-1', 'room-2'],
        checkIn,
        checkOut,
        message: 'Dates are available'
      })
    )
  }),

  rest.get('/api/rooms/availability', (req, res, ctx) => {
    const roomId = req.url.searchParams.get('roomId')
    const checkIn = req.url.searchParams.get('checkIn')
    const checkOut = req.url.searchParams.get('checkOut')
    
    return res(
      ctx.status(200),
      ctx.json({
        available: roomId !== 'room-1', // Mock room-1 as unavailable
        roomId,
        checkIn,
        checkOut,
        message: roomId === 'room-1' ? 'Room not available for selected dates' : 'Room is available'
      })
    )
  }),

  // Google Reviews API
  rest.get('/api/google-reviews', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Payments API
  rest.get('/api/payments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  rest.post('/api/payments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
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
      })
    )
  }),

  // Invoices API
  rest.get('/api/invoices', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  rest.post('/api/invoices', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
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
      })
    )
  }),

  // Enrollments API
  rest.get('/api/enrollments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  rest.post('/api/enrollments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
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
      })
    )
  }),

  // Assignments API
  rest.get('/api/assignments/participants', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  rest.get('/api/assignments/rooms', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Analytics API
  rest.get('/api/analytics/revenue', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          revenue: [
            { month: '2025-01', amount: 1000, growth: 0 },
            { month: '2025-02', amount: 1200, growth: 20 },
          ],
        },
      })
    )
  }),

  // Calendar Events API
  rest.get('/api/calendar-events', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  rest.post('/api/calendar-events', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
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
      })
    )
  }),

  // Upload API
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
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
    )
  }),

  // Error handlers for testing error scenarios
  rest.get('/api/rooms', (req, res, ctx) => {
    if (req.url.searchParams.get('error') === 'true') {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error' })
      )
    }
  }),

  rest.post('/api/bookings', (req, res, ctx) => {
    if (req.url.searchParams.get('error') === 'true') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Booking failed', message: 'Room not available' })
      )
    }
  })
]
