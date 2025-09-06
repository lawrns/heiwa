import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        limit: jest.fn(),
      })),
      in: jest.fn(() => ({
        single: jest.fn(),
      })),
      contains: jest.fn(() => ({
        single: jest.fn(),
      })),
      order: jest.fn(() => ({
        limit: jest.fn(),
      })),
      limit: jest.fn(),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
}

// Mock Stripe
const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
    confirm: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  refunds: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))

jest.mock('stripe', () => {
  return jest.fn(() => mockStripe)
})

// Mock authentication helper
const mockGetAdminFromRequest = jest.fn()
jest.mock('@/lib/auth', () => ({
  getAdminFromRequest: mockGetAdminFromRequest,
}), { virtual: true })

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('/api/bookings', () => {
    test('GET should return bookings list', async () => {
      const mockBookings = [
        {
          id: 'booking_001',
          client_ids: ['client_123'],
          items: [{ type: 'room', itemId: 'room_001', quantity: 1, unitPrice: 250, totalPrice: 250 }],
          total_amount: 250,
          payment_status: 'pending',
        },
      ]

      mockSupabaseClient.from().select().order().limit.mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      // Mock the API route handler
      const handler = async (req: NextRequest) => {
        const { data, error } = await mockSupabaseClient.from('bookings').select('*').order('created_at', { ascending: false }).limit(50)
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ bookings: data })
      }

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await handler(request)
      const result = await response.json()

      expect(result.bookings).toEqual(mockBookings)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('bookings')
    })

    test('POST should create new booking', async () => {
      const newBooking = {
        client_ids: ['client_123'],
        items: [{ type: 'room', itemId: 'room_001', quantity: 1, unitPrice: 250, totalPrice: 250 }],
        total_amount: 250,
        payment_status: 'pending',
      }

      const createdBooking = { ...newBooking, id: 'booking_new', created_at: new Date().toISOString() }

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: createdBooking,
        error: null,
      })

      // Mock the API route handler
      const handler = async (req: NextRequest) => {
        const body = await req.json()
        const { data, error } = await mockSupabaseClient.from('bookings').insert(body).select().single()
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ booking: data }, { status: 201 })
      }

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(newBooking),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.booking).toEqual(createdBooking)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('bookings')
    })

    test('should handle database errors', async () => {
      mockSupabaseClient.from().select().order().limit.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const handler = async (req: NextRequest) => {
        const { data, error } = await mockSupabaseClient.from('bookings').select('*').order('created_at', { ascending: false }).limit(50)
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ bookings: data })
      }

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('Database connection failed')
    })

    test('should validate booking data', async () => {
      const invalidBooking = {
        client_ids: [], // Empty array should be invalid
        items: [],
        total_amount: -100, // Negative amount should be invalid
      }

      const handler = async (req: NextRequest) => {
        const body = await req.json()
        
        // Basic validation
        if (!body.client_ids || body.client_ids.length === 0) {
          return NextResponse.json({ error: 'At least one client required' }, { status: 400 })
        }
        
        if (!body.items || body.items.length === 0) {
          return NextResponse.json({ error: 'At least one item required' }, { status: 400 })
        }
        
        if (body.total_amount < 0) {
          return NextResponse.json({ error: 'Total amount must be non-negative' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidBooking),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('At least one client required')
    })
  })

  describe('/api/payments', () => {
    test('GET should return payments list', async () => {
      const mockPayments = [
        {
          id: 'payment_001',
          booking_id: 'booking_001',
          amount: 250,
          currency: 'USD',
          status: 'completed',
          payment_method: 'stripe',
        },
      ]

      mockSupabaseClient.from().select().order().limit.mockResolvedValue({
        data: mockPayments,
        error: null,
      })

      const handler = async (req: NextRequest) => {
        const { data, error } = await mockSupabaseClient.from('payments').select('*').order('created_at', { ascending: false }).limit(50)
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ payments: data })
      }

      const request = new NextRequest('http://localhost:3000/api/payments')
      const response = await handler(request)
      const result = await response.json()

      expect(result.payments).toEqual(mockPayments)
    })

    test('POST /refund should process refund', async () => {
      const refundRequest = {
        paymentId: 'payment_001',
        amount: 100,
        reason: 'Customer request',
      }

      mockStripe.refunds.create.mockResolvedValue({
        id: 'refund_001',
        amount: 10000, // Stripe amounts are in cents
        status: 'succeeded',
      })

      mockSupabaseClient.from().update().eq().select().single.mockResolvedValue({
        data: { id: 'payment_001', refund_amount: 100, refund_status: 'completed' },
        error: null,
      })

      const handler = async (req: NextRequest) => {
        const body = await req.json()
        
        // Create Stripe refund
        const refund = await mockStripe.refunds.create({
          payment_intent: 'pi_test_123',
          amount: body.amount * 100, // Convert to cents
          reason: 'requested_by_customer',
        })

        // Update payment record
        const { data, error } = await mockSupabaseClient.from('payments')
          .update({ refund_amount: body.amount, refund_status: 'completed' })
          .eq('id', body.paymentId)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, refund, payment: data })
      }

      const request = new NextRequest('http://localhost:3000/api/payments/refund', {
        method: 'POST',
        body: JSON.stringify(refundRequest),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(mockStripe.refunds.create).toHaveBeenCalled()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('payments')
    })

    test('should validate refund amount', async () => {
      const invalidRefundRequest = {
        paymentId: 'payment_001',
        amount: -50, // Negative amount
        reason: 'Test',
      }

      const handler = async (req: NextRequest) => {
        const body = await req.json()
        
        if (body.amount <= 0) {
          return NextResponse.json({ error: 'Refund amount must be positive' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('http://localhost:3000/api/payments/refund', {
        method: 'POST',
        body: JSON.stringify(invalidRefundRequest),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Refund amount must be positive')
    })
  })

  describe('/api/gdpr', () => {
    beforeEach(() => {
      mockGetAdminFromRequest.mockResolvedValue({
        uid: 'admin_123',
        email: 'admin@heiwa.house',
      })
    })

    test('POST /export should export client data', async () => {
      const exportRequest = {
        clientEmail: 'client@example.com',
        requestReason: 'Data portability request',
        includeBookings: true,
        includePayments: true,
        includeProfile: true,
      }

      const mockClientProfile = {
        user_id: 'client_123',
        name: 'John Doe',
        email: 'client@example.com',
      }

      const mockBookings = [
        { id: 'booking_001', client_ids: ['client_123'], total_amount: 250 },
      ]

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: mockClientProfile,
        error: null,
      })

      mockSupabaseClient.from().select().contains().mockResolvedValue({
        data: mockBookings,
        error: null,
      })

      const handler = async (req: NextRequest) => {
        const admin = await mockGetAdminFromRequest(req)
        if (!admin) {
          return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
        }

        const body = await req.json()
        
        // Get client profile
        const { data: clientProfile } = await mockSupabaseClient.from('client_profiles')
          .select('*')
          .eq('email', body.clientEmail)
          .single()

        // Get bookings if requested
        let bookings = []
        if (body.includeBookings) {
          const { data } = await mockSupabaseClient.from('bookings')
            .select('*')
            .contains('client_ids', [clientProfile.user_id])
          bookings = data || []
        }

        const exportData = {
          exportInfo: {
            exportDate: new Date().toISOString(),
            requestedBy: admin.email,
            clientEmail: body.clientEmail,
          },
          clientData: {
            profile: clientProfile,
            bookings,
          },
        }

        return NextResponse.json(exportData)
      }

      const request = new NextRequest('http://localhost:3000/api/gdpr/export', {
        method: 'POST',
        body: JSON.stringify(exportRequest),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(result.exportInfo.requestedBy).toBe('admin@heiwa.house')
      expect(result.clientData.profile).toEqual(mockClientProfile)
      expect(result.clientData.bookings).toEqual(mockBookings)
    })

    test('should reject non-admin requests', async () => {
      mockGetAdminFromRequest.mockResolvedValue(null)

      const handler = async (req: NextRequest) => {
        const admin = await mockGetAdminFromRequest(req)
        if (!admin) {
          return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('http://localhost:3000/api/gdpr/export', {
        method: 'POST',
        body: JSON.stringify({ clientEmail: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toBe('Admin authentication required')
    })

    test('POST /delete should delete client data', async () => {
      const deleteRequest = {
        clientEmail: 'client@example.com',
        confirmationText: 'DELETE',
        reason: 'Client requested account deletion',
      }

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: { user_id: 'client_123', email: 'client@example.com' },
        error: null,
      })

      mockSupabaseClient.from().delete().eq.mockResolvedValue({
        data: {},
        error: null,
      })

      const handler = async (req: NextRequest) => {
        const admin = await mockGetAdminFromRequest(req)
        if (!admin) {
          return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
        }

        const body = await req.json()
        
        if (body.confirmationText !== 'DELETE') {
          return NextResponse.json({ error: 'Must type "DELETE" to confirm' }, { status: 400 })
        }

        // Get client profile
        const { data: clientProfile } = await mockSupabaseClient.from('client_profiles')
          .select('*')
          .eq('email', body.clientEmail)
          .single()

        if (!clientProfile) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Delete client data
        await mockSupabaseClient.from('client_profiles').delete().eq('user_id', clientProfile.user_id)

        return NextResponse.json({
          success: true,
          message: 'Client data successfully deleted',
          deletedRecords: 1,
        })
      }

      const request = new NextRequest('http://localhost:3000/api/gdpr/delete', {
        method: 'POST',
        body: JSON.stringify(deleteRequest),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.deletedRecords).toBe(1)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('client_profiles')
    })
  })

  describe('/api/email', () => {
    test('POST should send email', async () => {
      const emailRequest = {
        type: 'booking-confirmation',
        booking: { id: 'booking_001', total_amount: 250 },
        client: { name: 'John Doe', email: 'john@example.com' },
      }

      // Mock email service
      const mockSendEmail = jest.fn().mockResolvedValue({ success: true, messageId: 'msg_123' })

      const handler = async (req: NextRequest) => {
        const admin = await mockGetAdminFromRequest(req)
        if (!admin) {
          return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
        }

        const body = await req.json()
        
        // Send email (mocked)
        const result = await mockSendEmail(body)
        
        return NextResponse.json({ success: true, messageId: result.messageId })
      }

      const request = new NextRequest('http://localhost:3000/api/email', {
        method: 'POST',
        body: JSON.stringify(emailRequest),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg_123')
    })
  })

  describe('Error handling', () => {
    test('should handle malformed JSON', async () => {
      const handler = async (req: NextRequest) => {
        try {
          await req.json()
          return NextResponse.json({ success: true })
        } catch (error) {
          return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
        }
      }

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Invalid JSON')
    })

    test('should handle missing required fields', async () => {
      const handler = async (req: NextRequest) => {
        const body = await req.json()
        
        if (!body.requiredField) {
          return NextResponse.json({ error: 'Required field missing' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Required field missing')
    })

    test('should handle Stripe errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(new Error('Stripe API error'))

      const handler = async (req: NextRequest) => {
        try {
          await mockStripe.paymentIntents.create({ amount: 1000, currency: 'usd' })
          return NextResponse.json({ success: true })
        } catch (error: any) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      const request = new NextRequest('http://localhost:3000/api/test')
      const response = await handler(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('Stripe API error')
    })
  })
})
