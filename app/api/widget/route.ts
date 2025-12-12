import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type WidgetParticipant = {
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
  dietaryRequirements?: string
  specialRequests?: string
  skillLevel?: string
  emergencyContact?: unknown
}

function getParticipantName(participant: WidgetParticipant): string {
  const computed = `${participant.firstName || ''} ${participant.lastName || ''}`.trim()
  return (participant.name || computed || 'Guest').trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🏄‍♂️ WordPress Room Booking received:', {
      room_id: body.room_id,
      start_date: body.start_date,
      end_date: body.end_date,
      participants: body.participants?.length,
      add_ons: body.add_ons?.length,
      pricing: body.pricing
    })

    const {
      room_id,
      start_date,
      end_date,
      participants = [],
      add_ons = [],
      pricing = {},
      guests = 1,
      source_url,
      widget_version
    } = body

    // Validate required fields
    if (!room_id || !start_date || !end_date || !participants.length) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: room_id, start_date, end_date, participants'
      }, { status: 400 })
    }

    for (let i = 0; i < participants.length; i++) {
      if (!participants[i]?.email) {
        return NextResponse.json(
          { success: false, error: `Participant ${i + 1} email is required` },
          { status: 400 }
        )
      }
    }

    const primaryParticipant = participants[0]
    const clientName = getParticipantName(primaryParticipant)
    const email = primaryParticipant.email
    const phone = primaryParticipant.phone || ''

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Participant email is required'
      }, { status: 400 })
    }

    console.log('📝 Creating booking with data:', {
      clientName,
      email,
      room_id,
      start_date,
      end_date,
      total_amount: pricing.total || 0,
      add_ons_count: add_ons.length
    })

    // Step 1: Create or find clients for ALL participants
    const allClientIds: string[] = []
    const participantDetails = []
    let primaryClientData: any = null

    try {
      for (const participant of participants as WidgetParticipant[]) {
        const pEmail = participant.email!
        const pName = getParticipantName(participant)

        const { data: existingClient, error: findClientError } = await supabaseAdmin
          .from('clients')
          .select('*')
          .eq('email', pEmail)
          .single()

        if (findClientError && findClientError.code !== 'PGRST116') {
          console.error('Error finding client:', findClientError)
          return NextResponse.json(
            { success: false, error: `Database error finding client: ${findClientError.message}` },
            { status: 500 }
          )
        }

        let clientData: any = existingClient as any
        if (!clientData) {
          const newClient = {
            name: pName,
            email: pEmail,
            phone: participant.phone || '',
            notes: `Widget booking from ${source_url || 'unknown source'}`,
            brand: 'Heiwa House',
          }

          const { data: newClientData, error: createClientError } = await supabaseAdmin
            .from('clients')
            .insert([newClient] as any)
            .select()
            .single()

          if (createClientError) {
            console.error('Error creating client:', createClientError)
            return NextResponse.json(
              { success: false, error: `Database error creating client: ${createClientError.message}` },
              { status: 500 }
            )
          }

          clientData = newClientData as any
        }

        if (!primaryClientData) primaryClientData = clientData
        allClientIds.push(clientData.id)
        participantDetails.push({
          name: pName,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: pEmail,
          phone: participant.phone || '',
          dietaryRequirements: participant.dietaryRequirements || '',
          specialRequests: participant.specialRequests || '',
          clientId: clientData.id,
        })
      }
    } catch (clientError) {
      console.error('Client creation error:', clientError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create or find client'
      }, { status: 500 })
    }

    // Step 2: Create booking record with pricing and add-ons
    let bookingData
    try {
      // Fetch room details for room_type
      const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('name, id')
        .eq('id', room_id)
        .single()

      // Note: Database schema does NOT have 'items' field - removed to match actual schema
      // Add-ons information can be stored in notes if needed
      const addOnsNote = add_ons && add_ons.length > 0 
        ? ` Add-ons: ${add_ons.map((a: any) => `${a.name || a.id} (x${a.quantity || 1})`).join(', ')}.`
        : ''

      const booking = {
        client_ids: allClientIds,
        total_amount: pricing.total || 0,
        payment_status: 'pending',
        guests: guests || participants.length, // Save guest count as field
        check_in: start_date, // REQUIRED - NOT NULL field
        check_out: end_date, // REQUIRED - NOT NULL field
        room_type: room?.name || room_id, // Set room_type from room name
        notes: JSON.stringify({
          source: 'widget',
          widget_version: widget_version || 'unknown',
          source_url: source_url || undefined,
          participants: participantDetails,
          add_ons: add_ons || [],
          pricing,
          legacy_note: `Widget booking - ${guests || participants.length} guest(s).${addOnsNote}`.trim(),
        }),
        source: 'api', // Widget bookings are API submissions
        status: 'pending'
      }

      const { data: newBooking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert([booking] as any)
        .select()
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        return NextResponse.json({
          success: false,
          error: `Database error creating booking: ${bookingError.message}`
        }, { status: 500 })
      }

      bookingData = newBooking as any
      console.log('✅ Created booking:', (bookingData as any).id, 'with total:', pricing.total)
    } catch (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking'
      }, { status: 500 })
    }

    // Step 2.5: If dates match a surf camp week, create enrollments for ALL participants
    let matchedSurfCampId: string | null = null
    let primaryEnrollmentId: string | null = null
    try {
      const { data: matchingCamps, error: matchError } = await supabaseAdmin
        .from('surf_camps')
        .select('id, name, is_active')
        .eq('start_date', start_date)
        .eq('end_date', end_date)
        .limit(2)

      if (!matchError && matchingCamps && matchingCamps.length > 0) {
        const surfCamp = matchingCamps[0] as any
        matchedSurfCampId = surfCamp.id
        console.log('🏄‍♂️ Booking dates match surf camp:', surfCamp.id)

        const enrollmentResults = await Promise.all(
          (participants as WidgetParticipant[]).map(async (participant, idx) => {
            const clientId = allClientIds[idx]
            const pName = getParticipantName(participant)
            const pEmail = participant.email!

            const { data: enrollment, error: enrollmentError } = await supabaseAdmin
              .from('surf_camp_enrollments')
              .insert({
                surf_camp_id: surfCamp.id,
                client_id: clientId,
                booking_id: (bookingData as any).id,
                participant_name: pName,
                participant_email: pEmail,
                participant_phone: participant.phone || null,
                status: 'pending',
                skill_level: participant.skillLevel || 'beginner',
                dietary_restrictions: participant.dietaryRequirements || null,
                emergency_contact: participant.emergencyContact || null,
                notes: participant.specialRequests || null,
              } as any)
              .select('id')
              .single()

            if (enrollmentError) {
              console.warn('⚠️ Enrollment creation failed:', enrollmentError)
              return null
            }

            return enrollment as any
          })
        )

        primaryEnrollmentId = enrollmentResults[0]?.id || null
      }
    } catch (e) {
      console.warn('⚠️ Surf camp enrollment detection/creation failed:', e)
    }

    // Step 3: Create room assignment
    try {
      const roomAssignment = {
        room_id,
        booking_id: (bookingData as any).id,
        client_id: (primaryClientData as any).id,
        surf_camp_id: matchedSurfCampId,
        enrollment_id: primaryEnrollmentId,
        check_in_date: start_date,
        check_out_date: end_date,
        bed_number: null
      }

      const { data: assignmentData, error: assignmentError } = await supabaseAdmin
        .from('room_assignments')
        .insert([roomAssignment] as any)
        .select()
        .single()

      if (assignmentError) {
        console.error('Error creating room assignment:', assignmentError)
        console.log('⚠️ Booking created but room assignment failed')
      } else {
        console.log('✅ Created room assignment:', (assignmentData as any).id)
      }
    } catch (assignmentError) {
      console.error('Room assignment error:', assignmentError)
      console.log('⚠️ Booking created but room assignment failed')
    }

    console.log('✅ Widget booking process completed successfully')

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: (bookingData as any).id,
          booking_number: `HW-${(bookingData as any).id.slice(-8).toUpperCase()}`
        },
        client: {
          id: (primaryClientData as any).id,
          name: clientName,
          email
        },
        payment: {
          total_amount: pricing.total || 0,
          currency: pricing.currency || 'EUR',
          payment_method: 'stripe'
        }
      }
    })

  } catch (error) {
    console.error('Error processing widget booking:', error)
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
