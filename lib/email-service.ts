// Email Service using Resend
// Handles all email notifications for bookings, invoices, payments, and enrollments

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Heiwa House <noreply@heiwahouse.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@heiwahouse.com'
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'info@heiwahouse.com'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

export interface BookingConfirmationData {
  bookingId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  roomName?: string
  surfCampName?: string
  totalAmount: number
  currency: string
  status: string
  bookingDetails?: any
}

export interface InvoiceData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  amount: number
  currency: string
  dueDate: string
  status: string
  bookingId?: string
  items?: Array<{ description: string; amount: number }>
}

export interface PaymentData {
  paymentId: string
  clientName: string
  clientEmail: string
  amount: number
  currency: string
  paymentMethod: string
  transactionId?: string
  bookingId?: string
  status: string
}

export interface EnrollmentData {
  enrollmentId: string
  participantName: string
  participantEmail: string
  surfCampName: string
  startDate: string
  endDate: string
  skillLevel?: string
  status: string
}

export interface RefundData {
  refundId: string
  clientName: string
  clientEmail: string
  refundAmount: number
  currency: string
  originalPaymentAmount: number
  reason?: string
  bookingId?: string
}

class EmailService {
  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Skip sending in development if RESEND_API_KEY is not set
      if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV] Email would be sent:', {
          to: options.to,
          subject: options.subject,
        })
        return { success: true, messageId: 'dev-mode' }
      }

      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured')
      }

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        reply_to: options.replyTo || REPLY_TO_EMAIL,
        cc: options.cc,
        bcc: options.bcc,
      })

      if (result.error) {
        console.error('Resend API error:', result.error)
        return { success: false, error: result.error.message }
      }

      return { success: true, messageId: result.data?.id }
    } catch (error: any) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message || 'Failed to send email' }
    }
  }

  /**
   * Send booking confirmation email to guest
   */
  async sendBookingConfirmation(data: BookingConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getBookingConfirmationTemplate(data)
    const subject = `Booking Confirmation - ${data.bookingId}`

    return this.sendEmail({
      to: data.guestEmail,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
  }

  /**
   * Send booking notification to admin
   */
  async sendBookingNotificationToAdmin(data: BookingConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getAdminBookingNotificationTemplate(data)
    const subject = `New Booking: ${data.bookingId}`

    return this.sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
      replyTo: data.guestEmail,
    })
  }

  /**
   * Send invoice email to client
   */
  async sendInvoice(data: InvoiceData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getInvoiceTemplate(data)
    const subject = `Invoice ${data.invoiceNumber} - Heiwa House`

    return this.sendEmail({
      to: data.clientEmail,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(data: PaymentData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getPaymentConfirmationTemplate(data)
    const subject = `Payment Confirmation - ${data.transactionId || data.paymentId}`

    return this.sendEmail({
      to: data.clientEmail,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
  }

  /**
   * Send enrollment confirmation email
   */
  async sendEnrollmentConfirmation(data: EnrollmentData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getEnrollmentConfirmationTemplate(data)
    const subject = `Surf Camp Enrollment Confirmation - ${data.surfCampName}`

    return this.sendEmail({
      to: data.participantEmail,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
  }

  /**
   * Send refund notification email
   */
  async sendRefundNotification(data: RefundData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getRefundNotificationTemplate(data)
    const subject = `Refund Processed - ${data.refundId}`

    return this.sendEmail({
      to: data.clientEmail,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
  }

  /**
   * Convert HTML to plain text (simple implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  /**
   * Format date
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Booking confirmation email template
   */
  private getBookingConfirmationTemplate(data: BookingConfirmationData): string {
    const bookingType = data.surfCampName ? 'Surf Camp' : 'Room Booking'
    const bookingDetails = data.surfCampName || data.roomName || 'N/A'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Heiwa House</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Booking Confirmation</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">Thank you for your booking!</h2>
    
    <p>Dear ${data.guestName},</p>
    
    <p>We're excited to confirm your ${bookingType.toLowerCase()} with us. Here are your booking details:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p style="margin: 5px 0;"><strong>Type:</strong> ${bookingType}</p>
      <p style="margin: 5px 0;"><strong>${data.surfCampName ? 'Surf Camp' : 'Room'}:</strong> ${bookingDetails}</p>
      <p style="margin: 5px 0;"><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
      <p style="margin: 5px 0;"><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
      <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${this.formatCurrency(data.totalAmount, data.currency)}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> ${data.status}</p>
    </div>
    
    <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p style="margin: 5px 0;"><strong>Contact Information:</strong></p>
      <p style="margin: 5px 0;">Email: ${REPLY_TO_EMAIL}</p>
      <p style="margin: 5px 0;">We look forward to welcoming you!</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>This is an automated email. Please do not reply directly to this message.</p>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Admin booking notification template
   */
  private getAdminBookingNotificationTemplate(data: BookingConfirmationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f44336; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h2 style="color: white; margin: 0;">New Booking Received</h2>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p><strong>Booking ID:</strong> ${data.bookingId}</p>
    <p><strong>Guest:</strong> ${data.guestName} (${data.guestEmail})</p>
    <p><strong>Check-in:</strong> ${this.formatDate(data.checkIn)}</p>
    <p><strong>Check-out:</strong> ${this.formatDate(data.checkOut)}</p>
    <p><strong>Amount:</strong> ${this.formatCurrency(data.totalAmount, data.currency)}</p>
    <p><strong>Status:</strong> ${data.status}</p>
    
    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
      <p><strong>Action Required:</strong> Please review and confirm this booking in the admin dashboard.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Invoice email template
   */
  private getInvoiceTemplate(data: InvoiceData): string {
    const itemsHtml = data.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatCurrency(item.amount, data.currency)}</td>
      </tr>
    `).join('') || ''

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Invoice</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${data.invoiceNumber}</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear ${data.clientName},</p>
    
    <p>Please find attached your invoice for your booking with Heiwa House.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #667eea;">Description</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #667eea;">Amount</th>
        </tr>
        ${itemsHtml}
        <tr>
          <td style="padding: 10px; font-weight: bold; border-top: 2px solid #667eea;">Total</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #667eea;">${this.formatCurrency(data.amount, data.currency)}</td>
        </tr>
      </table>
      
      <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${this.formatDate(data.dueDate)}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> ${data.status}</p>
        ${data.bookingId ? `<p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>` : ''}
      </div>
    </div>
    
    <p>If you have any questions about this invoice, please contact us at ${REPLY_TO_EMAIL}.</p>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Payment confirmation email template
   */
  private getPaymentConfirmationTemplate(data: PaymentData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Payment Received</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear ${data.clientName},</p>
    
    <p>We have successfully received your payment. Thank you!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
      ${data.transactionId ? `<p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Amount:</strong> ${this.formatCurrency(data.amount, data.currency)}</p>
      <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> ${data.status}</p>
      ${data.bookingId ? `<p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>` : ''}
    </div>
    
    <p>If you have any questions, please contact us at ${REPLY_TO_EMAIL}.</p>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Enrollment confirmation email template
   */
  private getEnrollmentConfirmationTemplate(data: EnrollmentData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enrollment Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Surf Camp Enrollment</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Confirmation</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear ${data.participantName},</p>
    
    <p>We're excited to confirm your enrollment in our surf camp!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 5px 0;"><strong>Enrollment ID:</strong> ${data.enrollmentId}</p>
      <p style="margin: 5px 0;"><strong>Surf Camp:</strong> ${data.surfCampName}</p>
      <p style="margin: 5px 0;"><strong>Start Date:</strong> ${this.formatDate(data.startDate)}</p>
      <p style="margin: 5px 0;"><strong>End Date:</strong> ${this.formatDate(data.endDate)}</p>
      ${data.skillLevel ? `<p style="margin: 5px 0;"><strong>Skill Level:</strong> ${data.skillLevel}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Status:</strong> ${data.status}</p>
    </div>
    
    <p>We look forward to surfing with you! If you have any questions, please contact us at ${REPLY_TO_EMAIL}.</p>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Refund notification email template
   */
  private getRefundNotificationTemplate(data: RefundData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Refund Processed</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear ${data.clientName},</p>
    
    <p>We have processed your refund request.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 5px 0;"><strong>Refund ID:</strong> ${data.refundId}</p>
      <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ${this.formatCurrency(data.refundAmount, data.currency)}</p>
      <p style="margin: 5px 0;"><strong>Original Payment:</strong> ${this.formatCurrency(data.originalPaymentAmount, data.currency)}</p>
      ${data.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
      ${data.bookingId ? `<p style="margin: 5px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>` : ''}
    </div>
    
    <p>The refund will be processed to your original payment method within 5-10 business days.</p>
    
    <p>If you have any questions, please contact us at ${REPLY_TO_EMAIL}.</p>
  </div>
</body>
</html>
    `.trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService

