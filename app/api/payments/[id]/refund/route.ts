// Refund Payment API
// Process full or partial refunds

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// POST /api/payments/[id]/refund - Process a refund
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const { amount, reason, notes } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Refund amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get the payment
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if refund amount exceeds payment amount
    const currentRefundAmount = payment.refund_amount || 0
    const totalRefundAmount = currentRefundAmount + amount

    if (totalRefundAmount > payment.amount) {
      return NextResponse.json(
        { success: false, error: `Refund amount (€${totalRefundAmount.toFixed(2)}) exceeds payment amount (€${payment.amount.toFixed(2)})` },
        { status: 400 }
      )
    }

    // Determine new payment status
    let newStatus: string
    if (totalRefundAmount >= payment.amount) {
      newStatus = 'refunded'
    } else {
      newStatus = 'partially_refunded'
    }

    // Update payment with refund
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        payment_status: newStatus,
        refund_amount: totalRefundAmount,
        refund_reason: reason || payment.refund_reason,
        notes: notes || payment.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error processing refund:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to process refund' },
        { status: 500 }
      )
    }

    // Update booking payment status if fully refunded
    if (newStatus === 'refunded') {
      await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'refunded' })
        .eq('id', payment.booking_id)
    }

    // Fetch client details for email
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        client_ids,
        clients:client_ids (
          name,
          email
        )
      `)
      .eq('id', payment.booking_id)
      .single()

    // Send refund notification email
    if (booking?.clients?.[0]?.email) {
      import('@/lib/email-service').then(({ emailService }) => {
        emailService.sendRefundNotification({
          refundId: updatedPayment.id,
          clientName: booking.clients[0].name || 'Guest',
          clientEmail: booking.clients[0].email,
          refundAmount: amount,
          currency: payment.currency,
          originalPaymentAmount: payment.amount,
          reason: reason || payment.refund_reason,
          bookingId: payment.booking_id,
        }).catch(err => console.error('Failed to send refund notification email:', err))
      })
    }

    return NextResponse.json({
      success: true,
      data: { payment: updatedPayment },
      message: `Refund of €${amount.toFixed(2)} processed successfully`
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

