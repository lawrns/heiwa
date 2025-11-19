/**
 * Payments API Tests
 * Tests for /api/payments endpoints
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/payments/route'
import { GET as GETById, PUT, DELETE } from '@/app/api/payments/[id]/route'
import { POST as POSTRefund } from '@/app/api/payments/[id]/refund/route'
import { supabaseAdmin } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(),
        })),
        range: jest.fn(),
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
  },
}))

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/payments', () => {
    it('should fetch all payments', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          booking_id: 'booking-1',
          amount: 100,
          currency: 'EUR',
          payment_method: 'stripe',
          payment_status: 'completed',
          created_at: '2025-01-20T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: mockPayments, error: null, count: 1 })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/payments')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.payments).toEqual(mockPayments)
    })

    it('should filter payments by status', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/payments?status=completed')
      await GET(request)

      expect(mockQuery.select().eq).toHaveBeenCalledWith('payment_status', 'completed')
    })

    it('should handle errors', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' }, count: 0 })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/payments')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/payments', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        booking_id: 'booking-1',
        amount: 100,
        currency: 'EUR',
        payment_method: 'stripe',
        payment_status: 'completed',
      }

      const mockPayment = { id: 'payment-1', ...paymentData, created_at: '2025-01-20T00:00:00Z' }

      const mockInsert = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockInsert)

      const request = new NextRequest('http://localhost/api/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.payment).toEqual(mockPayment)
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/payments', {
        method: 'POST',
        body: JSON.stringify({ amount: 100 }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/payments/[id]', () => {
    it('should fetch a single payment', async () => {
      const mockPayment = {
        id: 'payment-1',
        booking_id: 'booking-1',
        amount: 100,
        currency: 'EUR',
        payment_method: 'stripe',
        payment_status: 'completed',
      }

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/payments/payment-1')
      const response = await GETById(request, { params: Promise.resolve({ id: 'payment-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.payment).toEqual(mockPayment)
    })
  })

  describe('PUT /api/payments/[id]', () => {
    it('should update a payment', async () => {
      const updateData = { payment_status: 'refunded', refund_amount: 100 }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: 'payment-1', ...updateData }, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/payments/payment-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'payment-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('DELETE /api/payments/[id]', () => {
    it('should delete a payment', async () => {
      const mockDelete = {
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/payments/payment-1', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'payment-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('POST /api/payments/[id]/refund', () => {
    it('should process a full refund', async () => {
      const mockPayment = {
        id: 'payment-1',
        booking_id: 'booking-1',
        amount: 100,
        refund_amount: 0,
        payment_status: 'completed',
      }

      const mockGet = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
      }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { ...mockPayment, refund_amount: 100, payment_status: 'refunded' },
                  error: null,
                })
              ),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce(mockGet)
        .mockReturnValueOnce(mockUpdate)
        .mockReturnValueOnce(mockUpdate)

      const request = new NextRequest('http://localhost/api/payments/payment-1/refund', {
        method: 'POST',
        body: JSON.stringify({ amount: 100, reason: 'Customer cancellation' }),
      })
      const response = await POSTRefund(request, { params: Promise.resolve({ id: 'payment-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.payment.payment_status).toBe('refunded')
    })

    it('should process a partial refund', async () => {
      const mockPayment = {
        id: 'payment-1',
        booking_id: 'booking-1',
        amount: 100,
        refund_amount: 0,
        payment_status: 'completed',
      }

      const mockGet = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
      }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { ...mockPayment, refund_amount: 50, payment_status: 'partially_refunded' },
                  error: null,
                })
              ),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock)
        .mockReturnValueOnce(mockGet)
        .mockReturnValueOnce(mockUpdate)

      const request = new NextRequest('http://localhost/api/payments/payment-1/refund', {
        method: 'POST',
        body: JSON.stringify({ amount: 50 }),
      })
      const response = await POSTRefund(request, { params: Promise.resolve({ id: 'payment-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.payment.payment_status).toBe('partially_refunded')
    })

    it('should reject refund exceeding payment amount', async () => {
      const mockPayment = {
        id: 'payment-1',
        booking_id: 'booking-1',
        amount: 100,
        refund_amount: 0,
        payment_status: 'completed',
      }

      const mockGet = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockGet)

      const request = new NextRequest('http://localhost/api/payments/payment-1/refund', {
        method: 'POST',
        body: JSON.stringify({ amount: 150 }),
      })
      const response = await POSTRefund(request, { params: Promise.resolve({ id: 'payment-1' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})








