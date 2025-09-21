import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Stripe } from "https://esm.sh/stripe@13.0.0"

interface RefundBookingRequest {
  booking_id: string
  amount?: number // Optional - defaults to full refund
  reason: 'customer_request' | 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other'
  notes?: string
}

interface RefundBookingResponse {
  refund_id: string
  amount_refunded: number
  currency: string
  status: string
  booking_status: string
  processed_at: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for admin operations
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const requestData: RefundBookingRequest = await req.json()

    // Validate required fields
    if (!requestData.booking_id || !requestData.reason) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'booking_id and reason are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        customer_id,
        status,
        total_amount,
        currency,
        camp_week_id,
        created_at,
        customer:customer(id, email, first_name, last_name)
      `)
      .eq('id', requestData.booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError)
      return new Response(
        JSON.stringify({
          error: 'NOT_FOUND',
          message: 'Booking not found'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate booking status allows refund
    if (!['paid', 'confirmed'].includes(booking.status)) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: `Cannot refund booking with status: ${booking.status}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('id, transaction_id, amount, payment_status, stripe_payment_intent_id')
      .eq('booking_id', requestData.booking_id)
      .eq('payment_status', 'completed')
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found or not completed:', paymentError)
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'No completed payment found for this booking'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate refund amount
    const refundAmount = Math.min(
      requestData.amount || payment.amount,
      payment.amount - (payment.refunded_amount || 0)
    )

    if (refundAmount <= 0) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'Invalid refund amount or booking already fully refunded'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if partial refund
    const isPartialRefund = refundAmount < payment.amount

    console.log(`Processing refund for booking ${requestData.booking_id}: $${refundAmount} (${requestData.reason})`)

    // Process refund through Stripe
    let refund: Stripe.Refund
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: payment.stripe_payment_intent_id || payment.transaction_id,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: requestData.reason === 'other' ? 'requested_by_customer' : requestData.reason,
        metadata: {
          booking_id: requestData.booking_id,
          customer_id: booking.customer_id,
          refund_reason: requestData.reason,
          notes: requestData.notes || '',
          processed_by: 'admin_system'
        }
      }

      refund = await stripe.refunds.create(refundParams)
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError)
      return new Response(
        JSON.stringify({
          error: 'STRIPE_ERROR',
          message: stripeError.message || 'Failed to process refund through Stripe'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update payment record
    const newRefundedAmount = (payment.refunded_amount || 0) + refundAmount
    const newPaymentStatus = newRefundedAmount >= payment.amount ? 'refunded' : 'completed'

    const { error: paymentUpdateError } = await supabaseClient
      .from('payments')
      .update({
        refunded_amount: newRefundedAmount,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (paymentUpdateError) {
      console.error('Error updating payment:', paymentUpdateError)
      // Note: Stripe refund was successful, but we failed to update our records
      // This should trigger an alert for manual reconciliation
    }

    // Update booking status
    let newBookingStatus: string
    if (isPartialRefund) {
      newBookingStatus = 'partial' // Partial refund
    } else {
      newBookingStatus = 'refunded' // Full refund
    }

    const { error: bookingUpdateError } = await supabaseClient
      .from('bookings')
      .update({
        status: newBookingStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestData.booking_id)

    if (bookingUpdateError) {
      console.error('Error updating booking:', bookingUpdateError)
    }

    // Log refund in audit trail
    await supabaseClient
      .from('privacy_audit_log')
      .insert({
        user_id: null, // System operation
        action: 'refund_processed',
        resource_type: 'booking',
        resource_id: requestData.booking_id,
        ip_address: null,
        user_agent: 'admin_system',
        performed_at: new Date().toISOString()
      })

    // TODO: Send refund confirmation email to customer
    console.log(`Refund processed successfully: ${refund.id} for booking ${requestData.booking_id}`)

    const response: RefundBookingResponse = {
      refund_id: refund.id,
      amount_refunded: refundAmount,
      currency: refund.currency,
      status: refund.status,
      booking_status: newBookingStatus,
      processed_at: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in refund-booking:', error)
    return new Response(
      JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred while processing refund'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
