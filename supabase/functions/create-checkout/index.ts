import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Stripe } from "https://esm.sh/stripe@13.0.0"

interface CreateCheckoutRequest {
  brand_id: string
  camp_week_id: string
  beds: string[]
  customer: {
    email: string
    first_name: string
    last_name: string
    phone?: string
    date_of_birth?: string
    emergency_contact?: {
      name: string
      phone: string
    }
  }
  addons?: Array<{
    addon_id: string
    quantity: number
  }>
  promo_code?: string
  check_in_date?: string
  check_out_date?: string
  special_requests?: string
  success_url: string
  cancel_url: string
}

interface CreateCheckoutResponse {
  checkout_url: string
  session_id: string
  booking_id: string
  expires_at: string
  customer_email: string
  amount_total: number
  currency: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for booking creation
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const requestData: CreateCheckoutRequest = await req.json()

    // Validate required fields
    if (!requestData.brand_id || !requestData.camp_week_id || !requestData.beds ||
        !requestData.customer || !requestData.success_url || !requestData.cancel_url) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'brand_id, camp_week_id, beds, customer, success_url, and cancel_url are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate customer data
    if (!requestData.customer.email || !requestData.customer.first_name || !requestData.customer.last_name) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'Customer email, first_name, and last_name are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get or create customer
    let customerId: string

    const { data: existingCustomer } = await supabaseClient
      .from('customer')
      .select('id')
      .eq('email', requestData.customer.email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabaseClient
        .from('customer')
        .insert({
          email: requestData.customer.email,
          first_name: requestData.customer.first_name,
          last_name: requestData.customer.last_name,
          phone: requestData.customer.phone,
          date_of_birth: requestData.customer.date_of_birth,
          emergency_contact: requestData.customer.emergency_contact ? JSON.stringify(requestData.customer.emergency_contact) : null
        })
        .select('id')
        .single()

      if (customerError) {
        console.error('Error creating customer:', customerError)
        return new Response(
          JSON.stringify({
            error: 'SERVER_ERROR',
            message: 'Failed to create customer record'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      customerId = newCustomer.id
    }

    // Get pricing quote
    const { data: pricingQuote, error: pricingError } = await supabaseClient
      .rpc('calculate_booking_price', {
        p_brand_id: requestData.brand_id,
        p_camp_week_id: requestData.camp_week_id,
        p_bed_ids: requestData.beds,
        p_addon_quantities: requestData.addons ? JSON.stringify(
          requestData.addons.reduce((acc, addon) => {
            acc[addon.addon_id] = addon.quantity
            return acc
          }, {} as Record<string, number>)
        ) : '{}',
        p_promo_code: requestData.promo_code || null,
        p_check_in_date: requestData.check_in_date || null,
        p_check_out_date: requestData.check_out_date || null
      })

    if (pricingError || !pricingQuote) {
      console.error('Error getting pricing:', pricingError)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to calculate booking price'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create draft booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        customer_id: customerId,
        camp_week_id: requestData.camp_week_id,
        status: 'draft',
        total_amount: pricingQuote.pricing?.grand_total || 0,
        currency: pricingQuote.pricing?.currency || 'USD',
        check_in_date: requestData.check_in_date,
        check_out_date: requestData.check_out_date,
        special_requests: requestData.special_requests,
        promo_code_id: pricingQuote.promo_applied ? (
          await supabaseClient
            .from('promo_code')
            .select('id')
            .eq('code', pricingQuote.promo_applied.code)
            .single()
        ).data?.id : null
      })
      .select('id')
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to create booking record'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create booking bed assignments
    const bedAssignments = requestData.beds.map(bedId => ({
      booking_id: booking.id,
      bed_id: bedId
    }))

    const { error: bedAssignmentError } = await supabaseClient
      .from('booking_bed')
      .insert(bedAssignments)

    if (bedAssignmentError) {
      console.error('Error creating bed assignments:', bedAssignmentError)
      // Clean up the booking if bed assignments fail
      await supabaseClient.from('bookings').delete().eq('id', booking.id)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to assign beds to booking'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create booking addon assignments if addons were selected
    if (requestData.addons && requestData.addons.length > 0) {
      const addonAssignments = requestData.addons.map(addon => ({
        booking_id: booking.id,
        addon_id: addon.addon_id,
        quantity: addon.quantity,
        unit_price: pricingQuote.addons?.find((a: any) => a.addon_id === addon.addon_id)?.unit_price || 0,
        total_price: pricingQuote.addons?.find((a: any) => a.addon_id === addon.addon_id)?.total || 0
      }))

      const { error: addonAssignmentError } = await supabaseClient
        .from('booking_addon')
        .insert(addonAssignments)

      if (addonAssignmentError) {
        console.error('Error creating addon assignments:', addonAssignmentError)
        // Clean up the booking if addon assignments fail
        await supabaseClient.from('booking_bed').delete().eq('booking_id', booking.id)
        await supabaseClient.from('bookings').delete().eq('id', booking.id)
        return new Response(
          JSON.stringify({
            error: 'SERVER_ERROR',
            message: 'Failed to assign addons to booking'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Get brand details for Stripe configuration
    const { data: brand, error: brandError } = await supabaseClient
      .from('brand')
      .select('name, theme_config, api_config')
      .eq('id', requestData.brand_id)
      .single()

    if (brandError || !brand) {
      console.error('Error fetching brand:', brandError)
      // Clean up booking data
      await supabaseClient.from('booking_addon').delete().eq('booking_id', booking.id)
      await supabaseClient.from('booking_bed').delete().eq('booking_id', booking.id)
      await supabaseClient.from('bookings').delete().eq('id', booking.id)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to fetch brand configuration'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Stripe checkout session
    const stripePublishableKey = brand.api_config?.stripe_publishable_key

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pricingQuote.pricing?.currency || 'usd',
            product_data: {
              name: `${brand.name} Surf Camp Booking`,
              description: `Camp week booking for ${requestData.beds.length} guest(s)`,
            },
            unit_amount: Math.round((pricingQuote.pricing?.grand_total || 0) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: requestData.customer.email,
      metadata: {
        booking_id: booking.id,
        customer_id: customerId,
        brand_id: requestData.brand_id,
        camp_week_id: requestData.camp_week_id,
        guest_count: requestData.beds.length.toString(),
      },
      success_url: requestData.success_url,
      cancel_url: requestData.cancel_url,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // Update booking with Stripe session ID
    await supabaseClient
      .from('bookings')
      .update({ payment_method: 'stripe' })
      .eq('id', booking.id)

    // Create payment record
    await supabaseClient
      .from('payments')
      .insert({
        booking_id: booking.id,
        amount: pricingQuote.pricing?.grand_total || 0,
        currency: pricingQuote.pricing?.currency || 'USD',
        payment_method: 'stripe',
        payment_status: 'pending',
        transaction_id: session.id,
      })

    const response: CreateCheckoutResponse = {
      checkout_url: session.url!,
      session_id: session.id,
      booking_id: booking.id,
      expires_at: new Date(session.expires_at! * 1000).toISOString(),
      customer_email: requestData.customer.email,
      amount_total: session.amount_total!,
      currency: session.currency!,
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in create-checkout:', error)

    // Attempt to clean up any partial booking data
    // Note: In production, this would be more sophisticated

    return new Response(
      JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred while creating checkout session'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
