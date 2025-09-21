import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AvailabilityRequest {
  brand_id: string
  check_in_date?: string
  check_out_date?: string
  guest_count: number
  property_ids?: string[]
  room_types?: string[]
}

interface AvailabilityResponse {
  available_options: Array<{
    property: {
      id: string
      name: string
      location: {
        city: string
        country: string
      }
    }
    camp_week: {
      id: string
      name: string
      start_date: string
      end_date: string
      capacity: number
      booked_count: number
    }
    available_beds: Array<{
      room: {
        id: string
        name: string
        type: string
        max_occupancy: number
      }
      beds: Array<{
        id: string
        name: string
        type: string
        price_modifier: number
      }>
    }>
    pricing: {
      base_price: number
      currency: string
      taxes_included: boolean
    }
  }>
  total_properties: number
  search_criteria: AvailabilityRequest
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

    const requestData: AvailabilityRequest = await req.json()

    // Validate required fields
    if (!requestData.brand_id || !requestData.guest_count) {
      return new Response(
        JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'brand_id and guest_count are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get properties for the brand
    let propertiesQuery = supabaseClient
      .from('property')
      .select(`
        id,
        name,
        location,
        camp_week:camp_week(
          id,
          name,
          start_date,
          end_date,
          base_price,
          capacity,
          booked_count,
          room:room(
            id,
            name,
            room_type,
            max_occupancy,
            bed:bed(
              id,
              name,
              bed_type,
              price_modifier
            )
          )
        )
      `)
      .eq('is_active', true)
      .eq('brand_id', requestData.brand_id)

    // Filter by property IDs if specified
    if (requestData.property_ids && requestData.property_ids.length > 0) {
      propertiesQuery = propertiesQuery.in('id', requestData.property_ids)
    }

    const { data: properties, error: propertiesError } = await propertiesQuery

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      return new Response(
        JSON.stringify({
          error: 'SERVER_ERROR',
          message: 'Failed to fetch properties'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!properties || properties.length === 0) {
      return new Response(
        JSON.stringify({
          available_options: [],
          total_properties: 0,
          search_criteria: requestData
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process availability for each property
    const availableOptions: AvailabilityResponse['available_options'] = []

    for (const property of properties) {
      if (!property.camp_week || property.camp_week.length === 0) continue

      for (const campWeek of property.camp_week) {
        // Check if camp week can accommodate the guest count
        if (campWeek.capacity - campWeek.booked_count < requestData.guest_count) {
          continue
        }

        // Filter rooms by type if specified
        let availableRooms = campWeek.room || []
        if (requestData.room_types && requestData.room_types.length > 0) {
          availableRooms = availableRooms.filter(room =>
            requestData.room_types!.includes(room.room_type)
          )
        }

        if (availableRooms.length === 0) continue

        // Get available beds for this camp week
        const { data: availableBeds, error: bedsError } = await supabaseClient
          .rpc('get_available_beds', {
            p_camp_week_id: campWeek.id,
            p_check_in_date: requestData.check_in_date,
            p_check_out_date: requestData.check_out_date
          })

        if (bedsError) {
          console.error('Error getting available beds:', bedsError)
          continue
        }

        // Group beds by room
        const bedsByRoom = new Map()
        for (const bed of availableBeds || []) {
          if (!bed.is_available) continue

          if (!bedsByRoom.has(bed.room_id)) {
            bedsByRoom.set(bed.room_id, {
              room: {
                id: bed.room_id,
                name: bed.room_name,
                type: bed.room_type || 'dorm',
                max_occupancy: bed.max_occupancy || 6
              },
              beds: []
            })
          }
          bedsByRoom.get(bed.room_id).beds.push({
            id: bed.bed_id,
            name: bed.bed_name,
            type: bed.bed_type,
            price_modifier: bed.price_modifier
          })
        }

        const availableBedsList = Array.from(bedsByRoom.values())

        // Only include if we have enough available beds
        const totalAvailableBeds = availableBedsList.reduce(
          (sum, room) => sum + room.beds.length, 0
        )

        if (totalAvailableBeds >= requestData.guest_count) {
          availableOptions.push({
            property: {
              id: property.id,
              name: property.name,
              location: {
                city: property.location?.city || '',
                country: property.location?.country || ''
              }
            },
            camp_week: {
              id: campWeek.id,
              name: campWeek.name,
              start_date: campWeek.start_date,
              end_date: campWeek.end_date,
              capacity: campWeek.capacity,
              booked_count: campWeek.booked_count
            },
            available_beds: availableBedsList,
            pricing: {
              base_price: campWeek.base_price,
              currency: 'USD',
              taxes_included: false
            }
          })
        }
      }
    }

    const response: AvailabilityResponse = {
      available_options: availableOptions,
      total_properties: properties.length,
      search_criteria: requestData
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
