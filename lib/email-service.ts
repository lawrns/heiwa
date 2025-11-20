// Email Service using Resend
// Handles all email notifications for bookings, invoices, payments, and enrollments

import { Resend } from 'resend'

// Lazy initialization of Resend client to avoid build-time errors
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey && process.env.NODE_ENV !== 'development') {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resend = new Resend(apiKey || 'dummy-key-for-build')
  }
  return resend
}

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

export interface PreTripEmailData {
  bookingId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  bookingType: 'room' | 'surfCamp'
  roomName?: string
  surfCampName?: string
  daysUntilTrip: number
  packingList?: string[]
  travelTips?: string[]
  affiliateLinks?: Array<{ title: string; url: string; description?: string }>
  location?: string
  weatherInfo?: string
}

export interface PostTripFeedbackData {
  bookingId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  bookingType: 'room' | 'surfCamp'
  roomName?: string
  surfCampName?: string
  feedbackFormUrl?: string
  reviewLinks?: Array<{ platform: string; url: string }>
  returnOffer?: { discount: number; validUntil: string }
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

      const result = await getResendClient().emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        replyTo: options.replyTo || REPLY_TO_EMAIL,
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
   * Send pre-trip planning email
   */
  async sendPreTripEmail(data: PreTripEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getPreTripEmailTemplate(data)
    const subject = `Your ${data.daysUntilTrip === 1 ? 'Trip Starts Tomorrow' : `Trip Starts in ${data.daysUntilTrip} Days`} - Heiwa House`

    return this.sendEmail({
      to: data.guestEmail,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
  }

  /**
   * Send post-trip feedback request email
   */
  async sendPostTripFeedbackRequest(data: PostTripFeedbackData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.getPostTripFeedbackTemplate(data)
    const subject = `How was your stay at Heiwa House?`

    return this.sendEmail({
      to: data.guestEmail,
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec681c 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0 0 15px 0; font-size: 32px; font-weight: 700;">✅ Booking Confirmed!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 500;">We're excited to have you!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.guestName}! 👋</h2>
              
              <p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px;">
                Thank you for choosing <strong>Heiwa House</strong>! We're thrilled to confirm your ${bookingType.toLowerCase()}.
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #f59e0b;">
                <p style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600; text-align: center;">Booking Reference: ${data.bookingId}</p>
              </div>

              <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #ec681c;">
                <h3 style="color: #ec681c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📋 Booking Details</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Type:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${bookingType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>${data.surfCampName ? 'Surf Camp' : 'Room'}:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${bookingDetails}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Check-in:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${this.formatDate(data.checkIn)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Check-out:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${this.formatDate(data.checkOut)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td style="padding: 12px 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;"><strong>Total Amount:</strong></td>
                    <td style="padding: 12px 0 8px 0; color: #ec681c; font-size: 20px; font-weight: 700; text-align: right;">${this.formatCurrency(data.totalAmount, data.currency)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Status:</strong></td>
                    <td style="padding: 8px 0; color: #059669; font-size: 15px; font-weight: 600; text-align: right;">${data.status}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <p style="color: #1e40af; margin: 0; font-size: 15px; font-weight: 500;">💡 <strong>What's Next?</strong></p>
                <p style="color: #1e3a8a; margin: 10px 0 0 0; font-size: 14px;">You'll receive a pre-trip email with packing lists, travel tips, and everything you need to know before your arrival!</p>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="https://heiwahouse.com" style="display: inline-block; background: #ec681c; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(236, 104, 28, 0.3);">Visit Our Website</a>
              </div>

              <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px;">
                If you have any questions or need to make changes to your booking, please contact us at <a href="mailto:${REPLY_TO_EMAIL}" style="color: #ec681c; text-decoration: none;">${REPLY_TO_EMAIL}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;"><strong>Heiwa House</strong></p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">We look forward to welcoming you! 🏄‍♂️</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">💳 Payment Received</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">Thank you for your payment!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.clientName}! 👋</h2>
              
              <p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px;">
                We have successfully received your payment. Your booking is now confirmed!
              </p>
              
              <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #10b981;">
                <h3 style="color: #059669; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">💰 Payment Details</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Payment ID:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${data.paymentId}</td>
                  </tr>
                  ${data.transactionId ? `
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${data.transactionId}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Payment Method:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${data.paymentMethod}</td>
                  </tr>
                  <tr style="border-top: 2px solid #d1fae5;">
                    <td style="padding: 12px 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;"><strong>Amount Paid:</strong></td>
                    <td style="padding: 12px 0 8px 0; color: #059669; font-size: 20px; font-weight: 700; text-align: right;">${this.formatCurrency(data.amount, data.currency)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Status:</strong></td>
                    <td style="padding: 8px 0; color: #059669; font-size: 15px; font-weight: 600; text-align: right;">✅ ${data.status}</td>
                  </tr>
                  ${data.bookingId ? `
                  <tr>
                    <td style="padding: 8px 0; color: #374151; font-size: 15px;"><strong>Booking ID:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 15px; text-align: right;">${data.bookingId}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <p style="color: #1e40af; margin: 0; font-size: 15px; font-weight: 500;">📧 <strong>Next Steps</strong></p>
                <p style="color: #1e3a8a; margin: 10px 0 0 0; font-size: 14px;">You'll receive your booking confirmation and pre-trip planning emails shortly!</p>
              </div>

              <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px;">
                If you have any questions about this payment, please contact us at <a href="mailto:${REPLY_TO_EMAIL}" style="color: #ec681c; text-decoration: none;">${REPLY_TO_EMAIL}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;"><strong>Heiwa House</strong></p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">Thank you for choosing us! 🏄‍♂️</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

  /**
   * Pre-trip planning email template with packing list, tips, and affiliate links
   */
  private getPreTripEmailTemplate(data: PreTripEmailData): string {
    const bookingName = data.surfCampName || data.roomName || 'Your Booking'
    const defaultPackingList = [
      'Swimsuit / Wetsuit',
      'Surfboard (or rent from us)',
      'Sunscreen (SPF 50+)',
      'Beach towel',
      'Comfortable clothing',
      'Water bottle',
      'Camera / GoPro',
      'Travel adapter (if needed)'
    ]
    const packingItems = data.packingList || defaultPackingList
    const packingListHtml = packingItems.map(item => `
      <li style="margin: 8px 0; padding-left: 5px;">${item}</li>
    `).join('')

    const defaultTravelTips = [
      'Arrive at least 30 minutes early for surf lessons',
      'Stay hydrated - bring water to the beach',
      'Check the surf forecast daily',
      'Respect local surf etiquette',
      'Protect yourself from the sun'
    ]
    const tips = data.travelTips || defaultTravelTips
    const tipsHtml = tips.map(tip => `
      <div style="background: #f0f9ff; padding: 12px; margin: 8px 0; border-left: 3px solid #0ea5e9; border-radius: 4px;">
        <p style="margin: 0; color: #0c4a6e;">${tip}</p>
      </div>
    `).join('')

    const affiliateLinksHtml = data.affiliateLinks?.map(link => `
      <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 8px 0; color: #ec681c; font-size: 16px;">${link.title}</h3>
        ${link.description ? `<p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${link.description}</p>` : ''}
        <a href="${link.url}" style="display: inline-block; background: #ec681c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Shop Now →</a>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">* Affiliate link - we may earn a commission</p>
      </div>
    `).join('') || ''

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Trip is Coming Soon!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec681c 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">🌊 Your Adventure Awaits!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">${data.daysUntilTrip === 1 ? 'Your trip starts tomorrow!' : `Only ${data.daysUntilTrip} days until your trip!`}</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.guestName}! 👋</h2>
              
              <p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px;">
                We're so excited to welcome you to <strong>${bookingName}</strong>! Your check-in is on <strong>${this.formatDate(data.checkIn)}</strong>.
              </p>

              ${data.location ? `<p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px;"><strong>📍 Location:</strong> ${data.location}</p>` : ''}
              
              ${data.weatherInfo ? `
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">🌤️ Weather Forecast</h3>
                <p style="color: #1e3a8a; margin: 0; font-size: 15px;">${data.weatherInfo}</p>
              </div>
              ` : ''}

              <!-- Packing List -->
              <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #ec681c;">
                <h3 style="color: #ec681c; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">📦 Packing Checklist</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  ${packingListHtml}
                </ul>
              </div>

              <!-- Travel Tips -->
              <div style="margin: 30px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">💡 Travel Tips</h3>
                ${tipsHtml}
              </div>

              <!-- Affiliate Links -->
              ${data.affiliateLinks && data.affiliateLinks.length > 0 ? `
              <div style="margin: 30px 0; padding-top: 30px; border-top: 2px solid #e5e7eb;">
                <h3 style="color: #111827; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🛍️ Recommended Gear</h3>
                <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 14px;">We've curated some essential items to enhance your experience:</p>
                ${affiliateLinksHtml}
              </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="https://heiwahouse.com" style="display: inline-block; background: #ec681c; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(236, 104, 28, 0.3);">Visit Our Website</a>
              </div>

              <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px;">
                If you have any questions before your arrival, don't hesitate to reach out to us at <a href="mailto:${REPLY_TO_EMAIL}" style="color: #ec681c; text-decoration: none;">${REPLY_TO_EMAIL}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;"><strong>Heiwa House</strong></p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">We can't wait to see you soon! 🏄‍♂️</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }

  /**
   * Post-trip feedback request email template
   */
  private getPostTripFeedbackTemplate(data: PostTripFeedbackData): string {
    const bookingName = data.surfCampName || data.roomName || 'your stay'
    const reviewLinksHtml = data.reviewLinks?.map(link => `
      <a href="${link.url}" style="display: inline-block; background: #ec681c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px; font-size: 14px;">Review on ${link.platform}</a>
    `).join('') || ''

    const returnOfferHtml = data.returnOffer ? `
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">🎁 Special Return Offer</h3>
        <p style="color: #78350f; margin: 0 0 15px 0; font-size: 16px;">We'd love to have you back! Get <strong>${data.returnOffer.discount}% off</strong> your next booking.</p>
        <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Valid until:</strong> ${this.formatDate(data.returnOffer.validUntil)}</p>
        <a href="https://heiwahouse.com/book" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px; font-size: 14px;">Book Your Return Trip</a>
      </div>
    ` : ''

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How was your stay?</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Thank You! 🙏</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">We hope you had an amazing time</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${data.guestName}! 👋</h2>
              
              <p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px;">
                We hope you had an incredible experience during ${bookingName} from ${this.formatDate(data.checkIn)} to ${this.formatDate(data.checkOut)}.
              </p>

              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">
                Your feedback means the world to us and helps us improve the experience for future guests. Would you mind sharing your thoughts?
              </p>

              ${data.feedbackFormUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.feedbackFormUrl}" style="display: inline-block; background: #10b981; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Share Your Feedback</a>
              </div>
              ` : ''}

              ${data.reviewLinks && data.reviewLinks.length > 0 ? `
              <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 30px 0; border: 2px solid #10b981;">
                <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">⭐ Leave Us a Review</h3>
                <p style="color: #065f46; margin: 0 0 20px 0; font-size: 15px;">Help others discover Heiwa House by leaving a review:</p>
                <div style="text-align: center;">
                  ${reviewLinksHtml}
                </div>
              </div>
              ` : ''}

              ${returnOfferHtml}

              <!-- Social Sharing -->
              <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Share Your Experience</h3>
                <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 14px;">Tag us in your photos and stories!</p>
                <div style="margin: 15px 0;">
                  <a href="https://instagram.com/heiwahouse" style="display: inline-block; margin: 0 10px; color: #ec681c; text-decoration: none; font-weight: 600;">Instagram</a>
                  <a href="https://facebook.com/heiwahouse" style="display: inline-block; margin: 0 10px; color: #ec681c; text-decoration: none; font-weight: 600;">Facebook</a>
                </div>
              </div>

              <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px;">
                We'd love to welcome you back soon! If you have any questions or concerns, please reach out to us at <a href="mailto:${REPLY_TO_EMAIL}" style="color: #ec681c; text-decoration: none;">${REPLY_TO_EMAIL}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;"><strong>Heiwa House</strong></p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">Thank you for choosing us! 🏄‍♂️</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService

