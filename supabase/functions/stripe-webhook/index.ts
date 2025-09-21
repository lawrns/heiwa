import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Stripe } from "https://esm.sh/stripe@13.0.0"

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for webhook processing
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    // Get the raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Missing webhook secret')
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`)

    // Record webhook event for audit and idempotency
    const { data: existingEvent } = await supabaseClient
      .from('webhook_event')
      .select('id, processed')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      if (existingEvent.processed) {
        console.log(`Event ${event.id} already processed, skipping`)
        return new Response(
          JSON.stringify({ status: 'already_processed' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      } else {
        // Update processing attempt count
        await supabaseClient
          .from('webhook_event')
          .update({
            processing_attempts: existingEvent.processing_attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', existingEvent.id)
      }
    } else {
      // Insert new webhook event
      await supabaseClient
        .from('webhook_event')
        .insert({
          stripe_event_id: event.id,
          event_type: event.type,
          event_data: event.data,
          processed: false
        })
    }

    // Process event based on type
    const eventData = event.data.object as any

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(supabaseClient, eventData)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabaseClient, eventData)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(supabaseClient, eventData)
        break

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(supabaseClient, eventData)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabaseClient, eventData)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabaseClient, eventData)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
        // Still mark as processed to avoid reprocessing
        break
    }

    // Mark event as processed
    await supabaseClient
      .from('webhook_event')
      .update({
        processed: true,
        last_attempt_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id)

    return new Response(
      JSON.stringify({ status: 'processed', event_type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCheckoutSessionCompleted(
  supabaseClient: any,
  session: Stripe.Checkout.Session
) {
  console.log(`Processing checkout session completed: ${session.id}`)

  const bookingId = session.metadata?.booking_id
  if (!bookingId) {
    console.error('Missing booking_id in session metadata')
    return
  }

  // Update booking status to confirmed
  const { error: bookingError } = await supabaseClient
    .from('bookings')
    .update({
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  if (bookingError) {
    console.error('Error updating booking status:', bookingError)
    return
  }

  // Update payment status
  const { error: paymentError } = await supabaseClient
    .from('payments')
    .update({
      payment_status: 'completed',
      payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('booking_id', bookingId)
    .eq('transaction_id', session.id)

  if (paymentError) {
    console.error('Error updating payment status:', paymentError)
  }

  // TODO: Send confirmation email
  console.log(`Booking ${bookingId} confirmed and payment completed`)
}

async function handlePaymentIntentSucceeded(
  supabaseClient: any,
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`Processing payment intent succeeded: ${paymentIntent.id}`)

  // Find booking by payment intent ID
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .select('booking_id')
    .eq('transaction_id', paymentIntent.id)
    .single()

  if (paymentError || !payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id)
    return
  }

  // Update booking and payment status
  const { error: bookingError } = await supabaseClient
    .from('bookings')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.booking_id)

  if (bookingError) {
    console.error('Error updating booking status:', bookingError)
    return
  }

  const { error: paymentUpdateError } = await supabaseClient
    .from('payments')
    .update({
      payment_status: 'completed',
      payment_date: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString()
    })
    .eq('booking_id', payment.booking_id)

  if (paymentUpdateError) {
    console.error('Error updating payment status:', paymentUpdateError)
  }

  // TODO: Send payment confirmation email
  console.log(`Payment completed for booking ${payment.booking_id}`)
}

async function handlePaymentIntentFailed(
  supabaseClient: any,
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`Processing payment intent failed: ${paymentIntent.id}`)

  // Find booking by payment intent ID
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .select('booking_id')
    .eq('transaction_id', paymentIntent.id)
    .single()

  if (paymentError || !payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id)
    return
  }

  // Update booking and payment status
  const { error: bookingError } = await supabaseClient
    .from('bookings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.booking_id)

  if (bookingError) {
    console.error('Error updating booking status:', bookingError)
    return
  }

  const { error: paymentUpdateError } = await supabaseClient
    .from('payments')
    .update({
      payment_status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString()
    })
    .eq('booking_id', payment.booking_id)

  if (paymentUpdateError) {
    console.error('Error updating payment status:', paymentUpdateError)
  }

  // TODO: Send payment failure notification email
  console.log(`Payment failed for booking ${payment.booking_id}`)
}

async function handleChargeDisputeCreated(
  supabaseClient: any,
  dispute: Stripe.Dispute
) {
  console.log(`Processing charge dispute created: ${dispute.id}`)

  // Find payment by charge ID
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .select('booking_id')
    .eq('transaction_id', dispute.charge)
    .single()

  if (paymentError || !payment) {
    console.error('Payment not found for dispute charge:', dispute.charge)
    return
  }

  // TODO: Handle dispute - this would typically involve:
  // 1. Notifying admin
  // 2. Updating booking/payment status if needed
  // 3. Initiating refund if dispute is won by customer

  console.log(`Dispute created for booking ${payment.booking_id}`)
}

async function handleInvoicePaymentSucceeded(
  supabaseClient: any,
  invoice: Stripe.Invoice
) {
  console.log(`Processing invoice payment succeeded: ${invoice.id}`)

  // Handle recurring payments or subscription invoices
  // This would be relevant if we implement subscriptions in the future

  console.log(`Invoice payment succeeded: ${invoice.id}`)
}

async function handleInvoicePaymentFailed(
  supabaseClient: any,
  invoice: Stripe.Invoice
) {
  console.log(`Processing invoice payment failed: ${invoice.id}`)

  // Handle failed recurring payments
  // This would be relevant if we implement subscriptions in the future

  console.log(`Invoice payment failed: ${invoice.id}`)
}
