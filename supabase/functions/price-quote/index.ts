import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PriceQuoteRequest {
  brand_id: string
  camp_week_id: string
  beds: string[]
  addons?: Array<{
    addon_id: string
    quantity: number
  }>
  promo_code?: string
  check_in_date?: string
  check_out_date?: string
  guest_count: number
}

interface PriceQuoteResponse {
  booking_summary: {
    camp_week: {
      id: string
      name: string
      start_date: string
      end_date: string
    }
    beds: Array<{
      id: string
      name: string
      room_name: string
      price_modifier: number
    }>
    nights: number
    guest_count: number
  }
  pricing_breakdown: {
    accommodation: {
      base_rate: number
      nights: number
      modifiers: Array<{
        type: string
        amount: number
        description: string
      }>
      total: number
    }
    addons: Array<{
      addon_id: string
      name: string
      quantity: number
      unit_price: number
      total: number
    }>
    subtotal: number
    discounts: Array<{
      type: string
      code?: string
      amount: number
      description: string
    }>
    taxes: Array<{
      name: string
      rate: number
      amount: number
    }>
  }
  totals: {
    subtotal: number
    discounts_total: number
    taxes_total: number
    grand_total: number
    currency: string
  }
  valid_until: string
  promo_applied?: {
    code: string
    type: string
    value: number
    discount_amount: number
  }
  addons: any[]
  beds_selected: string[]
  calculated_at: string
  valid_for_minutes: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const requestData: PriceQuoteRequest = await req.json()

    // Validate required fields
    if (!requestData.brand_id || !requestData.camp_week_id || !requestData.beds || requestData.beds.length === 0 || !requestData.guest_count) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'brand_id, camp_week_id, beds array, and guest_count are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Call the database RPC function for pricing calculation
    const { data: pricingData, error: pricingError } = await supabaseClient
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

    if (pricingError) {
      console.error('Error calculating price:', pricingError)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to calculate pricing'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!pricingData) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'Unable to calculate price for the selected options'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get camp week details
    const { data: campWeek, error: campWeekError } = await supabaseClient
      .from('camp_week')
      .select('id, name, start_date, end_date')
      .eq('id', requestData.camp_week_id)
      .single()

    if (campWeekError || !campWeek) {
      console.error('Error fetching camp week:', campWeekError)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to fetch camp week details'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get bed details
    const { data: beds, error: bedsError } = await supabaseClient
      .from('bed')
      .select(`
        id,
        name,
        price_modifier,
        room:room(id, name)
      `)
      .in('id', requestData.beds)

    if (bedsError) {
      console.error('Error fetching bed details:', bedsError)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to fetch bed details'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Format bed data
    const formattedBeds = beds.map(bed => ({
      id: bed.id,
      name: bed.name,
      room_name: bed.room?.name || 'Unknown Room',
      price_modifier: bed.price_modifier
    }))

    // Get addon details if addons were requested
    let formattedAddons: any[] = []
    if (requestData.addons && requestData.addons.length > 0) {
      const addonIds = requestData.addons.map(a => a.addon_id)
      const { data: addons, error: addonsError } = await supabaseClient
        .from('addon')
        .select('id, name, price')
        .in('id', addonIds)

      if (!addonsError && addons) {
        formattedAddons = requestData.addons.map(requestedAddon => {
          const addonDetail = addons.find(a => a.id === requestedAddon.addon_id)
          return {
            addon_id: requestedAddon.addon_id,
            name: addonDetail?.name || 'Unknown Addon',
            quantity: requestedAddon.quantity,
            unit_price: addonDetail?.price || 0,
            total: (addonDetail?.price || 0) * requestedAddon.quantity
          }
        })
      }
    }

    // Calculate date range and nights
    const checkIn = requestData.check_in_date || campWeek.start_date
    const checkOut = requestData.check_out_date || campWeek.end_date
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))

    // Build response
    const response: PriceQuoteResponse = {
      booking_summary: {
        camp_week: {
          id: campWeek.id,
          name: campWeek.name,
          start_date: campWeek.start_date,
          end_date: campWeek.end_date
        },
        beds: formattedBeds,
        nights: nights,
        guest_count: requestData.guest_count
      },
      pricing_breakdown: {
        accommodation: {
          base_rate: pricingData.pricing?.base_price / nights || 0,
          nights: nights,
          modifiers: [],
          total: pricingData.pricing?.bed_total || 0
        },
        addons: formattedAddons,
        subtotal: pricingData.pricing?.base_price || 0,
        discounts: pricingData.promo_applied ? [{
          type: 'promo_code',
          code: pricingData.promo_applied.code,
          amount: pricingData.promo_applied.discount_amount,
          description: `Promo code: ${pricingData.promo_applied.code}`
        }] : [],
        taxes: [{
          name: 'Sales Tax',
          rate: 0.08, // Simplified tax rate
          amount: pricingData.pricing?.tax_amount || 0
        }]
      },
      totals: {
        subtotal: pricingData.pricing?.base_price || 0,
        discounts_total: pricingData.pricing?.discount_amount || 0,
        taxes_total: pricingData.pricing?.tax_amount || 0,
        grand_total: pricingData.pricing?.grand_total || 0,
        currency: pricingData.pricing?.currency || 'USD'
      },
      valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      promo_applied: pricingData.promo_applied,
      addons: pricingData.addons || [],
      beds_selected: requestData.beds,
      calculated_at: new Date().toISOString(),
      valid_for_minutes: 30
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in price-quote:', error)
    return new Response(
      JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred while calculating price'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
