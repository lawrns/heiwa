/**
 * Invoices API Tests
 * Tests for /api/invoices endpoints
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/invoices/route'
import { GET as GETById, PUT, DELETE } from '@/app/api/invoices/[id]/route'
import { supabaseAdmin } from '@/lib/supabase'

jest.mock('@/lib/invoices/generator', () => ({
  createInvoiceFromBooking: jest.fn(async () => ({ id: 'invoice-1', invoice_number: 'HW-INV-2025-0001' })),
  calculateDueDate: jest.fn(() => '2025-02-01'),
}))

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

describe('Invoices API', () => {
  const adminCookie = 'admin_auth=heiwa_admin_2024'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/invoices', () => {
    it('should fetch all invoices', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          booking_id: 'booking-1',
          invoice_number: 'HW-INV-2025-0001',
          amount: 100,
          currency: 'EUR',
          status: 'sent',
          created_at: '2025-01-20T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: mockInvoices, error: null, count: 1 })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/invoices', {
        headers: { cookie: adminCookie },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.invoices).toEqual(mockInvoices)
    })

    it('should filter invoices by status', async () => {
      const mockEq = jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
      }))

      const mockQuery = {
        select: jest.fn(() => ({
          eq: mockEq,
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/invoices?status=sent', {
        headers: { cookie: adminCookie },
      })
      await GET(request)

      expect(mockEq).toHaveBeenCalledWith('status', 'sent')
    })
  })

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        booking_id: 'booking-1',
        amount: 100,
        currency: 'EUR',
        status: 'draft',
      }

      const mockInvoice = {
        id: 'invoice-1',
        ...invoiceData,
        invoice_number: 'HW-INV-2025-0001',
        due_date: '2025-02-01',
      }

      ;(supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'invoices') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
              })),
            })),
          }
        }
        if (table === 'bookings') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: null, error: null })),
              })),
            })),
          }
        }
        return {}
      })

      const request = new NextRequest('http://localhost/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
        headers: { cookie: adminCookie },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.invoice).toEqual(mockInvoice)
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/invoices', {
        method: 'POST',
        body: JSON.stringify({ amount: 100 }),
        headers: { cookie: adminCookie },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/invoices/[id]', () => {
    it('should fetch a single invoice', async () => {
      const mockInvoice = {
        id: 'invoice-1',
        booking_id: 'booking-1',
        invoice_number: 'HW-INV-2025-0001',
        amount: 100,
        currency: 'EUR',
        status: 'sent',
      }

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockInvoice, error: null })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost/api/invoices/invoice-1', {
        headers: { cookie: adminCookie },
      })
      const response = await GETById(request, { params: Promise.resolve({ id: 'invoice-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.invoice).toEqual(mockInvoice)
    })
  })

  describe('PUT /api/invoices/[id]', () => {
    it('should update an invoice', async () => {
      const updateData = { status: 'paid', paid_date: '2025-01-21T00:00:00Z' }

      const mockUpdate = {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { id: 'invoice-1', ...updateData }, error: null })),
            })),
          })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockUpdate)

      const request = new NextRequest('http://localhost/api/invoices/invoice-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { cookie: adminCookie },
      })
      const response = await PUT(request, { params: Promise.resolve({ id: 'invoice-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('DELETE /api/invoices/[id]', () => {
    it('should delete an invoice', async () => {
      const mockDelete = {
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }

      ;(supabaseAdmin.from as jest.Mock).mockReturnValue(mockDelete)

      const request = new NextRequest('http://localhost/api/invoices/invoice-1', {
        method: 'DELETE',
        headers: { cookie: adminCookie },
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'invoice-1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})











