import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`📥 Received Stripe webhook: ${event.type} (${event.id})`);

    // Idempotency check: see if we've already processed this event
    const { data: existingEvent } = await supabaseAdmin
      .from('stripe_webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`⚠️ Event ${event.id} already processed, skipping`);
      return NextResponse.json({ success: true, message: 'Event already processed' });
    }

    // Record the event for idempotency
    const { error: insertError } = await supabaseAdmin
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
        payload: event.data.object,
      });

    if (insertError) {
      console.error('❌ Failed to record webhook event:', insertError);
      // Continue processing - we'll rely on Stripe's retry mechanism if needed
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Update the event as successfully processed
    await supabaseAdmin
      .from('stripe_webhook_events')
      .update({ status: 'processed' })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook handler error' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

  // Support both booking_id and bookingId (frontend uses bookingId)
  const bookingId = paymentIntent.metadata?.booking_id || paymentIntent.metadata?.bookingId;
  
  if (!bookingId) {
    console.warn('⚠️ No booking_id/bookingId in payment intent metadata');
    return;
  }

  try {
    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency.toUpperCase(),
        payment_method: 'stripe',
        payment_status: 'completed',
        transaction_id: paymentIntent.id,
        stripe_customer_id: paymentIntent.customer as string || null,
        payment_date: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('❌ Failed to create payment record:', paymentError);
      throw paymentError;
    }

    // Update booking payment status
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (bookingError) {
      console.error('❌ Failed to update booking payment status:', bookingError);
      throw bookingError;
    }

    console.log(`✅ Booking ${bookingId} marked as paid`);
  } catch (error) {
    console.error('❌ Error processing payment_intent.succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);

  // Support both booking_id and bookingId (frontend uses bookingId)
  const bookingId = paymentIntent.metadata?.booking_id || paymentIntent.metadata?.bookingId;
  
  if (!bookingId) {
    console.warn('⚠️ No booking_id/bookingId in payment intent metadata');
    return;
  }

  try {
    // Create failed payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        payment_method: 'stripe',
        payment_status: 'failed',
        transaction_id: paymentIntent.id,
        notes: paymentIntent.last_payment_error?.message || 'Payment failed',
        payment_date: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('❌ Failed to create failed payment record:', paymentError);
    }

    // Update booking payment status
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (bookingError) {
      console.error('❌ Failed to update booking payment status:', bookingError);
    }

    console.log(`⚠️ Booking ${bookingId} marked as payment failed`);
  } catch (error) {
    console.error('❌ Error processing payment_intent.payment_failed:', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`💸 Charge refunded: ${charge.id}`);

  const paymentIntentId = charge.payment_intent as string;
  
  if (!paymentIntentId) {
    console.warn('⚠️ No payment_intent in charge');
    return;
  }

  try {
    // Find the payment record by transaction_id
    const { data: payment, error: findError } = await supabaseAdmin
      .from('payments')
      .select('id, booking_id, amount')
      .eq('transaction_id', paymentIntentId)
      .single();

    if (findError || !payment) {
      console.warn('⚠️ Payment record not found for refund');
      return;
    }

    const refundAmount = charge.amount_refunded / 100;
    const isFullRefund = refundAmount >= payment.amount;

    // Update payment record
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        refund_amount: refundAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Failed to update payment refund status:', updateError);
    }

    // Update booking payment status
    if (payment.booking_id) {
      const { error: bookingError } = await supabaseAdmin
        .from('bookings')
        .update({
          payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.booking_id);

      if (bookingError) {
        console.error('❌ Failed to update booking refund status:', bookingError);
      }
    }

    console.log(`✅ Refund processed: ${refundAmount} ${charge.currency.toUpperCase()}`);
  } catch (error) {
    console.error('❌ Error processing charge.refunded:', error);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  console.log(`⚠️ Dispute created: ${dispute.id}`);

  const chargeId = dispute.charge as string;
  
  try {
    // Find the payment by looking up the charge's payment intent
    const charge = await stripe.charges.retrieve(chargeId);
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      console.warn('⚠️ No payment_intent in disputed charge');
      return;
    }

    // Find the payment record
    const { data: payment, error: findError } = await supabaseAdmin
      .from('payments')
      .select('id, booking_id')
      .eq('transaction_id', paymentIntentId)
      .single();

    if (findError || !payment) {
      console.warn('⚠️ Payment record not found for dispute');
      return;
    }

    // Update payment record with dispute info
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        payment_status: 'disputed',
        notes: `Dispute created: ${dispute.reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Failed to update payment dispute status:', updateError);
    }

    console.log(`⚠️ Payment ${payment.id} marked as disputed`);
  } catch (error) {
    console.error('❌ Error processing charge.dispute.created:', error);
  }
}
