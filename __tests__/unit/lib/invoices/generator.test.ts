/**
 * Invoice Generator Unit Tests
 * Tests for lib/invoices/generator.ts
 */

import { generateInvoiceNumber, createInvoiceFromBooking, calculateDueDate } from '@/lib/invoices/generator'
import { supabaseAdmin } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        like: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-invoice-id', invoice_number: 'HW-INV-2025-0001' },
            error: null,
          })),
        })),
      })),
    })),
  },
}))

describe('Invoice Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateInvoiceNumber', () => {
    it('should generate invoice number in correct format', async () => {
      const invoiceNumber = await generateInvoiceNumber()

      expect(invoiceNumber).toMatch(/^HW-INV-\d{4}-\d{4}$/)
      expect(invoiceNumber).toContain('2025')
    })

        it('should generate sequential invoice numbers', async () => {
          // Mock first invoice
          const mockFrom = supabaseAdmin.from as jest.Mock
          mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { invoice_number: 'HW-INV-2025-0001' },
                  error: null,
                })),
              })),
            })),
          })),
        })),
      }))

      const invoiceNumber = await generateInvoiceNumber()

      expect(invoiceNumber).toBe('HW-INV-2025-0002')
    })

    it('should start from 0001 if no invoices exist', async () => {
      const mockFrom = supabaseAdmin.from as jest.Mock
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { code: 'PGRST116' }, // No rows returned
                })),
              })),
            })),
          })),
        })),
      }))

      const invoiceNumber = await generateInvoiceNumber()

      expect(invoiceNumber).toBe('HW-INV-2025-0001')
    })

    it('should handle database errors', async () => {
      const mockFrom = supabaseAdmin.from as jest.Mock
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { code: 'OTHER_ERROR', message: 'Database error' },
                })),
              })),
            })),
          })),
        })),
      }))

      await expect(generateInvoiceNumber()).rejects.toThrow('Failed to generate invoice number')
    })

    it('should handle year transitions correctly', async () => {
      // Mock year 2024 invoice
      const mockFrom = supabaseAdmin.from as jest.Mock
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { invoice_number: 'HW-INV-2024-9999' },
                  error: null,
                })),
              })),
            })),
          })),
        })),
      }))

      const invoiceNumber = await generateInvoiceNumber()

      // Should start new year sequence
      expect(invoiceNumber).toMatch(/^HW-INV-2025-\d{4}$/)
    })
  })

  describe('createInvoiceFromBooking', () => {
    const invoiceData = {
      booking_id: 'test-booking-id',
      amount: 240,
      currency: 'EUR',
      due_date: '2025-03-01',
      status: 'draft' as const,
    }

    it('should create invoice from booking data', async () => {
      const result = await createInvoiceFromBooking(invoiceData)

      expect(result.id).toBe('test-invoice-id')
      expect(result.invoice_number).toBe('HW-INV-2025-0001')
    })

    it('should use default currency EUR if not provided', async () => {
      const mockFrom = supabaseAdmin.from as jest.Mock
      let insertedData: any = null

      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { code: 'PGRST116' },
                })),
              })),
            })),
          })),
        })),
      })).mockReturnValueOnce({
        insert: jest.fn((data) => {
          insertedData = data
          return {
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-id', invoice_number: 'HW-INV-2025-0001' },
                error: null,
              })),
            })),
          }
        }),
      })

      await createInvoiceFromBooking({
        booking_id: 'test-booking-id',
        amount: 240,
      })

      expect(insertedData.currency).toBe('EUR')
    })

    it('should use default status draft if not provided', async () => {
      const mockFrom = supabaseAdmin.from as jest.Mock
      let insertedData: any = null

      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { code: 'PGRST116' },
                })),
              })),
            })),
          })),
        })),
      })).mockReturnValueOnce({
        insert: jest.fn((data) => {
          insertedData = data
          return {
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'test-id', invoice_number: 'HW-INV-2025-0001' },
                error: null,
              })),
            })),
          }
        }),
      })

      await createInvoiceFromBooking({
        booking_id: 'test-booking-id',
        amount: 240,
      })

      expect(insertedData.status).toBe('draft')
    })

    it('should handle database errors', async () => {
      const mockFrom = supabaseAdmin.from as jest.Mock
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          like: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { code: 'PGRST116' },
                })),
              })),
            })),
          })),
        })),
      })).mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      })

      await expect(
        createInvoiceFromBooking({
          booking_id: 'test-booking-id',
          amount: 240,
        })
      ).rejects.toThrow('Failed to create invoice')
    })
  })

  describe('calculateDueDate', () => {
    it('should calculate due date 30 days from now by default', () => {
      const dueDate = calculateDueDate()
      const expected = new Date()
      expected.setDate(expected.getDate() + 30)

      expect(dueDate).toBe(expected.toISOString().split('T')[0])
    })

    it('should calculate due date with custom days', () => {
      const dueDate = calculateDueDate(60)
      const expected = new Date()
      expected.setDate(expected.getDate() + 60)

      expect(dueDate).toBe(expected.toISOString().split('T')[0])
    })

    it('should handle month boundaries correctly', () => {
      // Set date to end of month
      const testDate = new Date('2025-01-31')
      jest.useFakeTimers()
      jest.setSystemTime(testDate)

      const dueDate = calculateDueDate(1)
      const expected = new Date('2025-02-01')

      expect(dueDate).toBe(expected.toISOString().split('T')[0])

      jest.useRealTimers()
    })

    it('should return date in YYYY-MM-DD format', () => {
      const dueDate = calculateDueDate(30)

      expect(dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})

