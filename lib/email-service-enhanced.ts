// Enhanced Email Service using Resend with Beautiful Templates
// Handles all email notifications including new pre-trip and post-trip emails

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

// Brand colors and styles
const BRAND_COLORS = {
  primary: '#ec681c',
  primaryDark: '#d65d16',
  secondary: '#1a202c',
  text: '#4a5568',
  lightBg: '#f7fafc',
  white: '#ffffff',
  success: '#48bb78',
  info: '#4299e1',
  warning: '#ed8936'
}

// Base email template with modern design
const getBaseTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Heiwa House</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }

    /* Remove default styling */
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; }

    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-hide { display: none !important; }
      .mobile-center { text-align: center !important; }
      .mobile-full-width { width: 100% !important; max-width: 100% !important; }
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
      .button { width: 100% !important; max-width: 300px !important; }
      h1 { font-size: 28px !important; line-height: 36px !important; }
      h2 { font-size: 24px !important; line-height: 32px !important; }
      p { font-size: 16px !important; line-height: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND_COLORS.lightBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>` : ''}

  <!-- Email wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: ${BRAND_COLORS.lightBg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Container -->
        <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: ${BRAND_COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">

          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%); padding: 40px 20px;">
              <h1 style="margin: 0; color: ${BRAND_COLORS.white}; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                HEIWA HOUSE
              </h1>
              <p style="margin: 8px 0 0 0; color: ${BRAND_COLORS.white}; font-size: 14px; opacity: 0.95; letter-spacing: 2px; text-transform: uppercase;">
                Surf & Stay Paradise
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND_COLORS.lightBg}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: ${BRAND_COLORS.text}; font-size: 14px;">
                Heiwa House - Your Home Away From Home
              </p>
              <p style="margin: 0 0 10px 0; color: ${BRAND_COLORS.text}; font-size: 13px;">
                Taghazout, Morocco
              </p>
              <div style="margin-top: 20px;">
                <a href="https://heiwahouse.com" style="color: ${BRAND_COLORS.primary}; text-decoration: none; margin: 0 10px; font-size: 13px;">Website</a>
                <a href="https://instagram.com/heiwahousesurf" style="color: ${BRAND_COLORS.primary}; text-decoration: none; margin: 0 10px; font-size: 13px;">Instagram</a>
                <a href="https://facebook.com/heiwahouse" style="color: ${BRAND_COLORS.primary}; text-decoration: none; margin: 0 10px; font-size: 13px;">Facebook</a>
              </div>
              <p style="margin: 20px 0 0 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} Heiwa House. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`

// Helper function to create a button
const getButton = (text: string, href: string, bgColor?: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
    <tr>
      <td align="center" style="border-radius: 8px; background-color: ${bgColor || BRAND_COLORS.primary};">
        <a href="${href}" style="display: inline-block; padding: 16px 32px; color: ${BRAND_COLORS.white}; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`

// Helper function for info boxes
const getInfoBox = (title: string, content: string, icon?: string) => `
  <div style="background-color: ${BRAND_COLORS.lightBg}; border-left: 4px solid ${BRAND_COLORS.primary}; padding: 20px; margin: 20px 0; border-radius: 4px;">
    ${icon ? `<div style="font-size: 24px; margin-bottom: 10px;">${icon}</div>` : ''}
    <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.secondary}; font-size: 18px; font-weight: 600;">
      ${title}
    </h3>
    <div style="color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6;">
      ${content}
    </div>
  </div>
`

// Helper function for key-value pairs
const getKeyValue = (key: string, value: string) => `
  <tr>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: ${BRAND_COLORS.text}; font-size: 14px;">
      <strong>${key}:</strong>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: ${BRAND_COLORS.secondary}; font-size: 14px;">
      ${value}
    </td>
  </tr>
`

export interface PreTripEmailData {
  bookingId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  roomName?: string
  surfCampName?: string
  daysUntilArrival: number
}

export interface PostTripFeedbackData {
  bookingId: string
  guestName: string
  guestEmail: string
  checkOut: string
  roomName?: string
  surfCampName?: string
}

export interface EmailLogData {
  bookingId?: string
  clientId?: string
  emailType: string
  recipientEmail: string
  subject: string
  templateName?: string
  status: 'sent' | 'failed'
  errorMessage?: string
  resendMessageId?: string
  metadata?: any
}

class EmailServiceEnhanced {
  // Log email to database
  private async logEmail(data: EmailLogData): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        console.error('Failed to log email:', await response.text())
      }
    } catch (error) {
      console.error('Error logging email:', error)
    }
  }

  /**
   * Send pre-trip planning email with packing list and affiliate links
   */
  async sendPreTripEmail(data: PreTripEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const packingList = [
      { item: 'Wetsuit (3/2mm recommended)', affiliate: 'https://amzn.to/wetsuit-affiliate' },
      { item: 'Reef-safe sunscreen', affiliate: 'https://amzn.to/sunscreen-affiliate' },
      { item: 'Surf wax', affiliate: 'https://amzn.to/surfwax-affiliate' },
      { item: 'Quick-dry towel', affiliate: 'https://amzn.to/towel-affiliate' },
      { item: 'Reusable water bottle', affiliate: 'https://amzn.to/bottle-affiliate' },
      { item: 'Flip flops / sandals', affiliate: 'https://amzn.to/sandals-affiliate' }
    ]

    const htmlContent = `
      <h2 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.secondary}; font-size: 28px; font-weight: 700;">
        Get Ready for Your Adventure! 🏄‍♂️
      </h2>

      <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
        Hey ${data.guestName}!
      </p>

      <p style="margin: 0 0 30px 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
        Your surf adventure at Heiwa House is just <strong>${data.daysUntilArrival} days away</strong>!
        We're excited to welcome you and wanted to share some tips to help you prepare for an amazing stay.
      </p>

      ${getInfoBox('📅 Your Booking Details', `
        <table style="width: 100%;">
          ${getKeyValue('Check-in', new Date(data.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
          ${getKeyValue('Check-out', new Date(data.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
          ${data.roomName ? getKeyValue('Room', data.roomName) : ''}
          ${data.surfCampName ? getKeyValue('Surf Camp', data.surfCampName) : ''}
        </table>
      `)}

      <h3 style="margin: 30px 0 20px 0; color: ${BRAND_COLORS.secondary}; font-size: 22px; font-weight: 600;">
        🎒 Packing Essentials
      </h3>

      <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6;">
        Here's what we recommend bringing (click items to shop our recommendations):
      </p>

      <table style="width: 100%; margin: 20px 0;">
        ${packingList.map(item => `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: ${BRAND_COLORS.primary}; margin-right: 10px;">✓</span>
              <a href="${item.affiliate}" style="color: ${BRAND_COLORS.text}; text-decoration: none;">
                ${item.item}
              </a>
              <a href="${item.affiliate}" style="color: ${BRAND_COLORS.primary}; font-size: 12px; margin-left: 10px;">
                Shop →
              </a>
            </td>
          </tr>
        `).join('')}
      </table>

      <p style="margin: 10px 0 30px 0; color: #a0aec0; font-size: 12px; line-height: 1.6; font-style: italic;">
        * Affiliate links help support Heiwa House at no extra cost to you
      </p>

      ${getInfoBox('🌊 Surf Conditions', `
        <p style="margin: 0;">The waves are looking great! Current conditions:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Water temp: 18-20°C</li>
          <li>Best surf: Morning sessions (6-10am)</li>
          <li>Beginner-friendly spots nearby</li>
        </ul>
      `)}

      ${getInfoBox('📍 Getting Here', `
        <p style="margin: 0 0 10px 0;">Heiwa House, Taghazout, Morocco</p>
        <p style="margin: 0;">
          <a href="https://maps.google.com/?q=Heiwa+House+Taghazout" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">
            View on Google Maps →
          </a>
        </p>
      `)}

      <h3 style="margin: 30px 0 20px 0; color: ${BRAND_COLORS.secondary}; font-size: 22px; font-weight: 600;">
        💡 Travel Tips
      </h3>

      <ul style="margin: 0 0 30px 0; padding-left: 20px; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.8;">
        <li>Airport transfer available (book in advance)</li>
        <li>Local SIM cards available at the airport</li>
        <li>ATMs available in the village</li>
        <li>We provide surfboards and basic gear</li>
        <li>Yoga mats available for morning sessions</li>
      </ul>

      ${getButton('Manage Your Booking', `https://heiwahouse.com/bookings/${data.bookingId}`)}

      <p style="margin: 30px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; text-align: center;">
        Questions? Reply to this email or WhatsApp us at<br>
        <a href="https://wa.me/212123456789" style="color: ${BRAND_COLORS.success}; text-decoration: none; font-weight: 600;">
          +212 123 456 789
        </a>
      </p>
    `

    const subject = `${data.daysUntilArrival} days until your Heiwa House adventure! 🏄‍♂️`
    const preheader = 'Everything you need to know for your upcoming stay'

    try {
      const client = getResendClient()
      const result = await client.emails.send({
        from: FROM_EMAIL,
        to: data.guestEmail,
        replyTo: REPLY_TO_EMAIL,
        subject,
        html: getBaseTemplate(htmlContent, preheader)
      })

      await this.logEmail({
        bookingId: data.bookingId,
        emailType: 'pre_trip',
        recipientEmail: data.guestEmail,
        subject,
        templateName: 'pre_trip_planning',
        status: 'sent',
        resendMessageId: result.id
      })

      return { success: true, messageId: result.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await this.logEmail({
        bookingId: data.bookingId,
        emailType: 'pre_trip',
        recipientEmail: data.guestEmail,
        subject,
        templateName: 'pre_trip_planning',
        status: 'failed',
        errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send post-trip feedback request email
   */
  async sendPostTripFeedbackRequest(data: PostTripFeedbackData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = `
      <h2 style="margin: 0 0 20px 0; color: ${BRAND_COLORS.secondary}; font-size: 28px; font-weight: 700;">
        Thank You for Staying with Us! 🙏
      </h2>

      <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
        Dear ${data.guestName},
      </p>

      <p style="margin: 0 0 30px 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6;">
        We hope you had an amazing time at Heiwa House and that the waves treated you well!
        Your experience means everything to us, and we'd love to hear about your stay.
      </p>

      ${getInfoBox('🌟 Share Your Experience', `
        <p style="margin: 0 0 15px 0;">Your feedback helps us improve and helps other travelers discover Heiwa House.</p>
        ${getButton('Leave a Review', `https://heiwahouse.com/feedback/${data.bookingId}`, BRAND_COLORS.success)}
      `)}

      <h3 style="margin: 30px 0 20px 0; color: ${BRAND_COLORS.secondary}; font-size: 22px; font-weight: 600;">
        📸 Share Your Memories
      </h3>

      <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6;">
        Tag us in your photos! We love seeing our guests' adventures:
      </p>

      <table style="width: 100%; margin: 20px 0; text-align: center;">
        <tr>
          <td style="padding: 15px; background-color: ${BRAND_COLORS.lightBg}; border-radius: 8px;">
            <a href="https://instagram.com/heiwahousesurf" style="color: ${BRAND_COLORS.primary}; text-decoration: none; font-weight: 600;">
              @heiwahousesurf
            </a>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 12px;">
              #HeiwahouseSurf #SurfMorocco
            </p>
          </td>
        </tr>
      </table>

      ${getInfoBox('💝 Special Offer for Your Next Visit', `
        <p style="margin: 0 0 10px 0;">As a returning guest, enjoy:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>15% off</strong> your next booking</li>
          <li>Priority room selection</li>
          <li>Free airport transfer</li>
        </ul>
        <p style="margin: 15px 0 0 0;">
          Use code: <strong style="color: ${BRAND_COLORS.primary};">COMEBACK15</strong>
        </p>
      `)}

      <h3 style="margin: 30px 0 20px 0; color: ${BRAND_COLORS.secondary}; font-size: 22px; font-weight: 600;">
        ✍️ Quick Feedback
      </h3>

      <p style="margin: 0 0 20px 0; color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.6;">
        Help us with a quick 2-minute survey:
      </p>

      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td style="text-align: center; padding: 10px;">
            <a href="https://heiwahouse.com/rate?score=5&booking=${data.bookingId}" style="font-size: 30px; text-decoration: none;">😍</a>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 12px;">Amazing</p>
          </td>
          <td style="text-align: center; padding: 10px;">
            <a href="https://heiwahouse.com/rate?score=4&booking=${data.bookingId}" style="font-size: 30px; text-decoration: none;">😊</a>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 12px;">Good</p>
          </td>
          <td style="text-align: center; padding: 10px;">
            <a href="https://heiwahouse.com/rate?score=3&booking=${data.bookingId}" style="font-size: 30px; text-decoration: none;">😐</a>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 12px;">Okay</p>
          </td>
          <td style="text-align: center; padding: 10px;">
            <a href="https://heiwahouse.com/rate?score=2&booking=${data.bookingId}" style="font-size: 30px; text-decoration: none;">😕</a>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 12px;">Not Great</p>
          </td>
        </tr>
      </table>

      ${getButton('Write a Detailed Review', `https://heiwahouse.com/review/${data.bookingId}`)}

      <div style="margin: 40px 0; padding: 20px; background-color: ${BRAND_COLORS.lightBg}; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: ${BRAND_COLORS.text}; font-size: 14px;">
          Love us? Review us on:
        </p>
        <a href="https://g.page/r/heiwahouse/review" style="color: ${BRAND_COLORS.primary}; text-decoration: none; margin: 0 10px; font-weight: 600;">
          Google
        </a>
        <span style="color: #cbd5e0;">|</span>
        <a href="https://tripadvisor.com/heiwahouse" style="color: ${BRAND_COLORS.primary}; text-decoration: none; margin: 0 10px; font-weight: 600;">
          TripAdvisor
        </a>
        <span style="color: #cbd5e0;">|</span>
        <a href="https://booking.com/heiwahouse" style="color: ${BRAND_COLORS.primary}; text-decoration: none; margin: 0 10px; font-weight: 600;">
          Booking.com
        </a>
      </div>

      <p style="margin: 30px 0 0 0; color: ${BRAND_COLORS.text}; font-size: 16px; line-height: 1.6; text-align: center;">
        Until next time,<br>
        <strong>The Heiwa House Family</strong> 🏄‍♂️🌊
      </p>
    `

    const subject = `How was your stay at Heiwa House? 🏄‍♂️`
    const preheader = 'Share your experience and get 15% off your next visit'

    try {
      const client = getResendClient()
      const result = await client.emails.send({
        from: FROM_EMAIL,
        to: data.guestEmail,
        replyTo: REPLY_TO_EMAIL,
        subject,
        html: getBaseTemplate(htmlContent, preheader)
      })

      await this.logEmail({
        bookingId: data.bookingId,
        emailType: 'post_trip_feedback',
        recipientEmail: data.guestEmail,
        subject,
        templateName: 'post_trip_feedback',
        status: 'sent',
        resendMessageId: result.id
      })

      return { success: true, messageId: result.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await this.logEmail({
        bookingId: data.bookingId,
        emailType: 'post_trip_feedback',
        recipientEmail: data.guestEmail,
        subject,
        templateName: 'post_trip_feedback',
        status: 'failed',
        errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const emailServiceEnhanced = new EmailServiceEnhanced()

// Re-export the original email service functions for backward compatibility
export { EmailService, emailService } from './email-service'