// Email API endpoint for sending emails from admin panel
// POST /api/email/send

import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Type and data are required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'booking_confirmation':
        result = await emailService.sendBookingConfirmation(data)
        break
      case 'booking_notification':
        result = await emailService.sendBookingNotificationToAdmin(data)
        break
      case 'invoice':
        result = await emailService.sendInvoice(data)
        break
      case 'payment_confirmation':
        result = await emailService.sendPaymentConfirmation(data)
        break
      case 'enrollment_confirmation':
        result = await emailService.sendEnrollmentConfirmation(data)
        break
      case 'refund_notification':
        result = await emailService.sendRefundNotification(data)
        break
      case 'custom':
        result = await emailService.sendEmail(data)
        break
      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error: any) {
    console.error('Error in email API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

