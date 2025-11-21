/**
 * Bulk Operations API Tests
 * Tests for bulk operation endpoints
 */

import { NextRequest } from 'next/server'
import { POST as BookingsBulk } from '@/app/api/bookings/bulk/route'
import { POST as InvoicesBulk } from '@/app/api/invoices/bulk/route'
import { POST as PaymentsBulk } from '@/app/api/payments/bulk/route'
import { supabaseAdmin } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

jest.mock('@/lib/email-service', () => ({
  emailService: {
    sendInvoice: jest.fn(),
  },
}))

const mockSupabase = supabaseAdmin as any

describe('Bulk Operations API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/bookings/bulk', () => {
    it('should update booking status in bulk', async () => {
      const bookingIds = ['booking-1', 'booking-2', 'booking-3']
      const mockUpdate = {
        update: jest.fn(() => ({
          in: jest.fn(() => ({
            select: jest.fn(() =>
              Promise.resolve({
                data: bookingIds.map(id => ({ id })),
                error: null,
              })
            ),
          })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/bookings/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          bookingIds,
          status: 'confirmed',
        }),
      })

      const response = await BookingsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.updated).toBe(3)
      expect(mockUpdate.update).toHaveBeenCalledWith({ status: 'confirmed' })
      expect(mockUpdate.update().in).toHaveBeenCalledWith('id', bookingIds)
    })

    it('should update payment status in bulk', async () => {
      const bookingIds = ['booking-1', 'booking-2']
      const mockUpdate = {
        update: jest.fn(() => ({
          in: jest.fn(() => ({
            select: jest.fn(() =>
              Promise.resolve({
                data: bookingIds.map(id => ({ id })),
                error: null,
              })
            ),
          })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/bookings/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_payment_status',
          bookingIds,
          payment_status: 'paid',
        }),
      })

      const response = await BookingsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.updated).toBe(2)
      expect(mockUpdate.update).toHaveBeenCalledWith({ payment_status: 'paid' })
    })

    it('should delete bookings in bulk', async () => {
      const bookingIds = ['booking-1', 'booking-2', 'booking-3', 'booking-4']
      const mockDelete = {
        delete: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/bookings/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          bookingIds,
        }),
      })

      const response = await BookingsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(4)
      expect(mockDelete.delete().in).toHaveBeenCalledWith('id', bookingIds)
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/bookings/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          // Missing bookingIds
        }),
      })

      const response = await BookingsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required')
    })

    it('should validate action type', async () => {
      const request = new NextRequest('http://localhost/api/bookings/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'invalid_action',
          bookingIds: ['booking-1'],
        }),
      })

      const response = await BookingsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle database errors', async () => {
      const mockUpdate = {
        update: jest.fn(() => ({
          in: jest.fn(() => ({
            select: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: new Error('Database error'),
              })
            ),
          })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/bookings/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          bookingIds: ['booking-1'],
          status: 'confirmed',
        }),
      })

      const response = await BookingsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/invoices/bulk', () => {
    it('should update invoice status in bulk', async () => {
      const invoiceIds = ['invoice-1', 'invoice-2']
      const mockUpdate = {
        update: jest.fn(() => ({
          in: jest.fn(() => ({
            select: jest.fn(() =>
              Promise.resolve({
                data: invoiceIds.map(id => ({ id })),
                error: null,
              })
            ),
          })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/invoices/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          invoiceIds,
          status: 'paid',
        }),
      })

      const response = await InvoicesBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.updated).toBe(2)
    })

    it('should send invoices in bulk', async () => {
      const invoiceIds = ['invoice-1', 'invoice-2']
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoice_number: 'HW-INV-2025-0001',
          amount: 100,
          currency: 'EUR',
          due_date: '2025-02-01',
          status: 'draft',
          booking_id: 'booking-1',
          bookings: {
            client_ids: ['client-1'],
            clients: [{ name: 'John Doe', email: 'john@example.com' }],
          },
        },
        {
          id: 'invoice-2',
          invoice_number: 'HW-INV-2025-0002',
          amount: 200,
          currency: 'EUR',
          due_date: '2025-02-02',
          status: 'draft',
          booking_id: 'booking-2',
          bookings: {
            client_ids: ['client-2'],
            clients: [{ name: 'Jane Smith', email: 'jane@example.com' }],
          },
        },
      ]

      const mockFetch = {
        select: jest.fn(() => ({
          in: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({
                data: mockInvoices,
                error: null,
              })
            ),
          })),
        })),
      }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'invoices') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                eq: jest.fn(() =>
                  Promise.resolve({
                    data: mockInvoices,
                    error: null,
                  })
                ),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          }
        }
        return {}
      })

      ;(emailService.sendInvoice as jest.Mock).mockResolvedValue({ success: true })

      const request = new NextRequest('http://localhost/api/invoices/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'send',
          invoiceIds,
        }),
      })

      const response = await InvoicesBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.sent).toBe(2)
      expect(emailService.sendInvoice).toHaveBeenCalledTimes(2)
    })

    it('should delete invoices in bulk', async () => {
      const invoiceIds = ['invoice-1', 'invoice-2', 'invoice-3']
      const mockDelete = {
        delete: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/invoices/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          invoiceIds,
        }),
      })

      const response = await InvoicesBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(3)
    })
  })

  describe('POST /api/payments/bulk', () => {
    it('should update payment status in bulk', async () => {
      const paymentIds = ['payment-1', 'payment-2', 'payment-3']
      const mockUpdate = {
        update: jest.fn(() => ({
          in: jest.fn(() => ({
            select: jest.fn(() =>
              Promise.resolve({
                data: paymentIds.map(id => ({ id })),
                error: null,
              })
            ),
          })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/payments/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          paymentIds,
          payment_status: 'completed',
        }),
      })

      const response = await PaymentsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.updated).toBe(3)
      expect(mockUpdate.update).toHaveBeenCalledWith({ payment_status: 'completed' })
    })

    it('should delete payments in bulk', async () => {
      const paymentIds = ['payment-1', 'payment-2']
      const mockDelete = {
        delete: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      mockSupabase.from.mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/payments/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          paymentIds,
        }),
      })

      const response = await PaymentsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.deleted).toBe(2)
    })

    it('should validate empty paymentIds array', async () => {
      const request = new NextRequest('http://localhost/api/payments/bulk', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          paymentIds: [],
          payment_status: 'completed',
        }),
      })

      const response = await PaymentsBulk(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})










