import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'eur', metadata, customerEmail, customerName } = body;

    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Amount is required' },
        { status: 400 }
      );
    }

    console.log('💳 Creating payment intent:', { amount, currency, metadata, customerEmail });

    let customerId = metadata?.customerId;

    // Create or retrieve Stripe customer if email provided
    if (customerEmail && !customerId) {
      try {
        // Check if customer already exists in Stripe
        const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
        
        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
          console.log('✅ Found existing Stripe customer:', customerId);
        } else {
          // Create new Stripe customer
          const customer = await stripe.customers.create({
            email: customerEmail,
            name: customerName || 'Heiwa House Guest',
            metadata: {
              source: 'heiwa_house_booking',
              ...metadata
            }
          });
          customerId = customer.id;
          console.log('✅ Created new Stripe customer:', customerId);
        }
      } catch (customerError: any) {
        console.error('❌ Failed to create/retrieve Stripe customer:', customerError);
        return NextResponse.json(
          { success: false, error: 'Failed to create customer record: ' + customerError.message },
          { status: 500 }
        );
      }
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        customerId: customerId || 'none'
      },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      customerId: customerId,
    });
  } catch (error: any) {
    console.error('❌ Error creating payment intent:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

