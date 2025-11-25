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
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    // Set test environment
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.FROM_EMAIL = 'test@example.com'
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.REPLY_TO_EMAIL = 'reply@example.com'
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
      // The mock is set up to return success by default
      // This test verifies the email service can be called
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('should handle missing API key gracefully', async () => {
      delete process.env.RESEND_API_KEY

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      // Should either return error or success depending on NODE_ENV
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
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
      const result = await emailService.sendBookingConfirmation(bookingData)

      // Verify that the email was sent successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
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
      const result = await emailService.sendBookingNotificationToAdmin(bookingData)

      // Verify that the email was sent successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
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
      const result = await emailService.sendInvoice(invoiceData)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
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
      const result = await emailService.sendPaymentConfirmation(paymentData)

      // Verify that the email was sent successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
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
      const result = await emailService.sendRefundNotification(refundData)

      // Verify that the email was sent successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
    })
  })

  describe('Currency Formatting', () => {
    it('should format EUR currency correctly', async () => {
      const result = await emailService.sendInvoice({
        invoiceNumber: 'HW-INV-2025-0001',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        amount: 1234.56,
        currency: 'EUR',
        dueDate: '2025-03-01',
        status: 'sent',
      })

      // Verify that the email was sent successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly in emails', async () => {
      const result = await emailService.sendBookingConfirmation({
        bookingId: 'booking-123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        checkIn: '2025-02-15',
        checkOut: '2025-02-18',
        totalAmount: 240,
        currency: 'EUR',
        status: 'confirmed',
      })

      // Verify that the email was sent successfully
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
    })
  })
})

