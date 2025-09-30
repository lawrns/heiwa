import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API endpoint for all bookings (rooms and surf weeks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🏄‍♂️ Booking received:', body)

    const {
      booking_type, // 'room' or 'surf_week'
      room_id,
      camp_id,
      start_date,
      end_date,
      participants = [],
      add_ons = [],
      pricing,
      guests,
      source_url
    } = body

    // Validate required fields
    if (!booking_type || !participants || participants.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: booking_type and participants'
      }, { status: 400 })
    }

    if (booking_type === 'room' && (!room_id || !start_date || !end_date)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields for room booking: room_id, start_date, end_date'
      }, { status: 400 })
    }

    if (booking_type === 'surf_week' && !camp_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field for surf week booking: camp_id'
      }, { status: 400 })
    }

    // Create booking record in Supabase
    const bookingData = {
      booking_type,
      room_id: room_id || null,
      camp_id: camp_id || null,
      check_in_date: start_date || null,
      check_out_date: end_date || null,
      total_participants: participants.length,
      total_guests: guests || participants.length,
      pricing_breakdown: pricing,
      add_ons: add_ons,
      source_url: source_url || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking'
      }, { status: 500 })
    }

    // Create participant records
    const participantPromises = participants.map(async (participant: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string | null
      dateOfBirth?: string | null
      emergencyContactName?: string | null
      emergencyContactPhone?: string | null
      dietaryRestrictions?: string | null
      medicalConditions?: string | null
      surfExperience?: string | null
    }, index: number) => {
      const clientData = {
        first_name: participant.firstName || '',
        last_name: participant.lastName || '',
        email: participant.email || '',
        phone: participant.phone || null,
        date_of_birth: participant.dateOfBirth || null,
        emergency_contact_name: participant.emergencyContactName || null,
        emergency_contact_phone: participant.emergencyContactPhone || null,
        dietary_restrictions: participant.dietaryRestrictions || null,
        medical_conditions: participant.medicalConditions || null,
        surf_experience: participant.surfExperience || null,
        created_at: new Date().toISOString()
      }

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single()

      if (clientError) {
        console.error('Error creating client:', clientError)
        throw new Error(`Failed to create participant ${index + 1}`)
      }

      return client
    })

    const clients = await Promise.all(participantPromises)

    // Create assignments based on booking type
    if (booking_type === 'room') {
      // Create room assignments
      const assignmentPromises = clients.map(async (client) => {
        const assignmentData = {
          booking_id: booking.id,
          client_id: client.id,
          room_id: room_id,
          check_in_date: start_date,
          check_out_date: end_date,
          status: 'confirmed',
          created_at: new Date().toISOString()
        }

        const { error: assignmentError } = await supabase
          .from('room_assignments')
          .insert([assignmentData])

        if (assignmentError) {
          console.error('Error creating room assignment:', assignmentError)
          throw new Error(`Failed to create room assignment for ${client.first_name}`)
        }
      })

      await Promise.all(assignmentPromises)
    } else if (booking_type === 'surf_week') {
      // Create surf week assignments
      const assignmentPromises = clients.map(async (client) => {
        const assignmentData = {
          booking_id: booking.id,
          client_id: client.id,
          camp_id: camp_id,
          status: 'confirmed',
          created_at: new Date().toISOString()
        }

        const { error: assignmentError } = await supabase
          .from('surf_week_assignments')
          .insert([assignmentData])

        if (assignmentError) {
          console.error('Error creating surf week assignment:', assignmentError)
          throw new Error(`Failed to create assignment for ${client.first_name}`)
        }
      })

      await Promise.all(assignmentPromises)
    }

    console.log('✅ Booking created successfully:', {
      booking_id: booking.id,
      booking_type,
      participants: clients.length
    })

    return NextResponse.json({
      success: true,
      data: {
        booking_id: booking.id,
        booking_type,
        participants_created: clients.length,
        status: 'confirmed'
      }
    })

  } catch (error) {
    console.error('Error processing booking:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
