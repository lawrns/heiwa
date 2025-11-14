/**
 * Email Service Unit Tests
 * Tests for lib/email-service.ts
 */

import { emailService } from '@/lib/email-service'
import type {
  BookingConfirmationData,
  InvoiceData,
  PaymentData,
  EnrollmentData,
  RefundData,
} from '@/lib/email-service'

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({
          data: { id: 'test-message-id' },
          error: null,
        }),
      },
    })),
  }
})

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set test environment
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.FROM_EMAIL = 'test@example.com'
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.REPLY_TO_EMAIL = 'reply@example.com'
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
    })

    it('should handle email sending errors', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      mockResend.emails.send.mockResolvedValueOnce({
        data: null,
        error: { message: 'API Error' },
      })

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
    })

    it('should skip sending in development without API key', async () => {
      delete process.env.RESEND_API_KEY
      process.env.NODE_ENV = 'development'

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('dev-mode')
    })

    it('should handle array of recipients', async () => {
      const result = await emailService.sendEmail({
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('sendBookingConfirmation', () => {
    const bookingData: BookingConfirmationData = {
      bookingId: 'booking-123',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-04',
      roomName: 'Ocean View Room',
      totalAmount: 240,
      currency: 'EUR',
      status: 'confirmed',
    }

    it('should send booking confirmation email', async () => {
      const result = await emailService.sendBookingConfirmation(bookingData)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('should include booking details in email', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendBookingConfirmation(bookingData)

      expect(sentEmail).toBeDefined()
      expect(sentEmail.to).toBe('john@example.com')
      expect(sentEmail.subject).toContain('booking-123')
      expect(sentEmail.html).toContain('John Doe')
      expect(sentEmail.html).toContain('Ocean View Room')
      expect(sentEmail.html).toContain('€240.00')
    })

    it('should handle surf camp bookings', async () => {
      const surfCampData: BookingConfirmationData = {
        ...bookingData,
        surfCampName: 'Beginner Surf Week',
        roomName: undefined,
      }

      const result = await emailService.sendBookingConfirmation(surfCampData)

      expect(result.success).toBe(true)
    })
  })

  describe('sendBookingNotificationToAdmin', () => {
    const bookingData: BookingConfirmationData = {
      bookingId: 'booking-123',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-04',
      totalAmount: 240,
      currency: 'EUR',
      status: 'pending',
    }

    it('should send admin notification email', async () => {
      const result = await emailService.sendBookingNotificationToAdmin(bookingData)

      expect(result.success).toBe(true)
    })

    it('should send to admin email', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendBookingNotificationToAdmin(bookingData)

      expect(sentEmail.to).toBe('admin@example.com')
      expect(sentEmail.subject).toContain('New Booking')
    })
  })

  describe('sendInvoice', () => {
    const invoiceData: InvoiceData = {
      invoiceNumber: 'HW-INV-2025-0001',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      amount: 240,
      currency: 'EUR',
      dueDate: '2025-03-01',
      status: 'sent',
      items: [
        { description: 'Room booking', amount: 240 },
      ],
    }

    it('should send invoice email', async () => {
      const result = await emailService.sendInvoice(invoiceData)

      expect(result.success).toBe(true)
    })

    it('should include invoice details', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendInvoice(invoiceData)

      expect(sentEmail.html).toContain('HW-INV-2025-0001')
      expect(sentEmail.html).toContain('€240.00')
      expect(sentEmail.html).toContain('Room booking')
    })
  })

  describe('sendPaymentConfirmation', () => {
    const paymentData: PaymentData = {
      paymentId: 'payment-123',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      amount: 240,
      currency: 'EUR',
      paymentMethod: 'stripe',
      transactionId: 'txn_123456',
      status: 'completed',
    }

    it('should send payment confirmation email', async () => {
      const result = await emailService.sendPaymentConfirmation(paymentData)

      expect(result.success).toBe(true)
    })

    it('should include payment details', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendPaymentConfirmation(paymentData)

      expect(sentEmail.html).toContain('payment-123')
      expect(sentEmail.html).toContain('txn_123456')
      expect(sentEmail.html).toContain('€240.00')
    })
  })

  describe('sendEnrollmentConfirmation', () => {
    const enrollmentData: EnrollmentData = {
      enrollmentId: 'enrollment-123',
      participantName: 'John Doe',
      participantEmail: 'john@example.com',
      surfCampName: 'Beginner Surf Week',
      startDate: '2025-03-01',
      endDate: '2025-03-08',
      skillLevel: 'beginner',
      status: 'confirmed',
    }

    it('should send enrollment confirmation email', async () => {
      const result = await emailService.sendEnrollmentConfirmation(enrollmentData)

      expect(result.success).toBe(true)
    })
  })

  describe('sendRefundNotification', () => {
    const refundData: RefundData = {
      refundId: 'refund-123',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      refundAmount: 120,
      currency: 'EUR',
      originalPaymentAmount: 240,
      reason: 'Cancellation',
      bookingId: 'booking-123',
    }

    it('should send refund notification email', async () => {
      const result = await emailService.sendRefundNotification(refundData)

      expect(result.success).toBe(true)
    })

    it('should include refund details', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendRefundNotification(refundData)

      expect(sentEmail.html).toContain('refund-123')
      expect(sentEmail.html).toContain('€120.00')
      expect(sentEmail.html).toContain('Cancellation')
    })
  })

  describe('Currency Formatting', () => {
    it('should format EUR currency correctly', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendInvoice({
        invoiceNumber: 'HW-INV-2025-0001',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        amount: 1234.56,
        currency: 'EUR',
        dueDate: '2025-03-01',
        status: 'sent',
      })

      expect(sentEmail.html).toContain('€1,234.56')
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly in emails', async () => {
      const { Resend } = require('resend')
      const mockResend = new Resend()
      let sentEmail: any = null

      mockResend.emails.send.mockImplementation((params: any) => {
        sentEmail = params
        return Promise.resolve({ data: { id: 'test-id' }, error: null })
      })

      await emailService.sendBookingConfirmation({
        bookingId: 'booking-123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        checkIn: '2025-02-15',
        checkOut: '2025-02-18',
        totalAmount: 240,
        currency: 'EUR',
        status: 'confirmed',
      })

      expect(sentEmail.html).toContain('February 15, 2025')
      expect(sentEmail.html).toContain('February 18, 2025')
    })
  })
})

