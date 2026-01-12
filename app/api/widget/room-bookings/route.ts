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

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  brand?: string
  status?: string
  notes?: string
}

interface Booking {
  id: string
  client_ids: string[]
  total_amount: number
  payment_status: string
  guests: number
  check_in: string
  check_out: string
  room_type?: string
  notes?: string
  source?: string
  status?: string
}

interface SurfCamp {
  id: string
  name: string
  is_active: boolean
}

interface Enrollment {
  id: string
  client_id: string
}

interface RoomAssignment {
  id: string
}

function getParticipantName(participant: WidgetParticipant): string {
  const computed = `${participant.firstName || ''} ${participant.lastName || ''}`.trim()
  return (participant.name || computed || 'Guest').trim()
}

function parseGuestIndex(guestId: unknown): number | null {
  if (typeof guestId !== 'string') return null
  const match = guestId.match(/^guest-(\d+)$/)
  if (!match) return null
  const idx = Number(match[1]) - 1
  return Number.isFinite(idx) && idx >= 0 ? idx : null
}

// GET method to provide room booking availability info
export async function GET() {
  try {
    console.log('📋 Room Booking Widget - GET request received')
    
    // Return basic availability info
    return NextResponse.json({
      success: true,
      message: 'Room booking widget is available',
      endpoint: '/api/widget/room-bookings',
      method: 'POST',
      usage: 'Send POST request with booking data to create a room booking',
      example_payload: {
        room_id: "uuid",
        start_date: "2025-11-14",
        end_date: "2025-11-16",
        participants: [{ name: "John Doe", email: "john@example.com" }],
        guests: 1
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Room booking widget GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get room booking info'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('🏄‍♂️ Room Booking Widget received:', {
      room_id: body.room_id,
      room_assignments: body.room_assignments?.length,
      start_date: body.start_date,
      end_date: body.end_date,
      participants: body.participants?.length,
      pricing: body.pricing
    })

    const {
      room_id,
      room_assignments = [],
      start_date,
      end_date,
      participants = [],
      pricing = {},
      guests = 1
    } = body

    // Support both single room_id (legacy) and room_assignments array (new format)
    const hasRoomAssignments = room_assignments && room_assignments.length > 0

    // Validate required fields
    if (!start_date || !end_date || !participants.length) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: start_date, end_date, participants'
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

    if (!hasRoomAssignments && !room_id) {
      return NextResponse.json({
        success: false,
        error: 'Must provide either room_id or room_assignments array'
      }, { status: 400 })
    }

    // Validate that dates are not blocked by calendar events
    const { data: blockingEvents, error: blockingError } = await supabaseAdmin
      .from('calendar_events')
      .select('id, title, start_date, end_date')
      .gte('end_date', start_date)
      .lte('start_date', end_date)
      .eq('blocks_bookings', true)

    if (!blockingError && blockingEvents && blockingEvents.length > 0) {
      console.log('🚫 Booking blocked by calendar event(s):', blockingEvents)
      return NextResponse.json({
        success: false,
        error: 'We have something special planned during those dates. Please choose different dates to continue your booking.',
        blocking_events: blockingEvents.map(e => ({
          title: e.title,
          start_date: e.start_date,
          end_date: e.end_date
        }))
      }, { status: 400 })
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

    console.log('📝 Creating room booking with data:', {
      clientName,
      email,
      roomId: room_id,
      startDate: start_date,
      endDate: end_date,
      participants: participants.length
    })

    // Create or find clients for ALL participants (needed for surf-camp enrollments)
    const allClientIds: string[] = []
    const participantDetails = []

    for (const participant of participants as WidgetParticipant[]) {
      const pEmail = participant.email!
      const pName = getParticipantName(participant)

      const { data: existingClient, error: findError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', pEmail)
        .single()

      let clientId: string
      if (findError && findError.code === 'PGRST116') {
        const { data: newClient, error: createError } = await supabaseAdmin
          .from('clients')
          .insert({
            name: pName,
            email: pEmail,
            phone: participant.phone || '',
            brand: 'Heiwa House',
            status: 'active',
            notes: 'Created via room booking widget',
          })
          .select('id')
          .single()

        if (createError) {
          console.error('Failed to create client:', createError)
          return NextResponse.json({ success: false, error: `Failed to create client record for ${pName}` }, { status: 500 })
        }

        clientId = (newClient as Client).id
      } else if (findError) {
        console.error('Failed to check client:', findError)
        return NextResponse.json({ success: false, error: `Failed to verify client for ${pName}` }, { status: 500 })
      } else {
        clientId = (existingClient as Client).id
      }

      allClientIds.push(clientId)
      participantDetails.push({
        name: pName,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: pEmail,
        phone: participant.phone || '',
        dietaryRequirements: participant.dietaryRequirements || '',
        specialRequests: participant.specialRequests || '',
        clientId,
      })
    }

    const primaryClientId = allClientIds[0]

    // Fetch room details for room_type (only if room_id is provided for single-room bookings)
    let room = null
    if (room_id) {
      const roomResult = await supabaseAdmin
        .from('rooms')
        .select('name, id')
        .eq('id', room_id)
        .single()

      if (roomResult.error) {
        console.warn('Warning: Could not fetch room details:', roomResult.error)
      } else {
        room = roomResult.data
      }
    }

    // Create booking record
    // Note: Database schema does NOT have 'items' field - removed to match actual schema
    const bookingData = {
      client_ids: allClientIds,
      total_amount: pricing.total || 0,
      status: 'pending',
      payment_status: 'pending',
      guests: guests || participants.length, // Save guest count (use guests param or participants length)
      check_in: start_date, // REQUIRED - NOT NULL field
      check_out: end_date, // REQUIRED - NOT NULL field
      room_type: room?.name || room_id || 'Multiple rooms', // Set room_type from room name or fallback to room_id
      notes: JSON.stringify({
        source: 'widget-room-bookings',
        participants: participantDetails,
        pricing,
        room_assignments: hasRoomAssignments ? room_assignments : undefined,
      }),
    }

    const bookingResult = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select('id')
      .single()

    if (bookingResult.error) {
      console.error('Failed to create booking:', {
        code: bookingResult.error.code,
        message: bookingResult.error.message,
        hint: bookingResult.error.hint,
        details: bookingResult.error.details
      })
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking record'
      }, { status: 500 })
    }

    const bookingId = (bookingResult.data as { id: string }).id
    console.log('✅ Booking created:', bookingId)

    // If dates match a surf camp week, create enrollments for ALL participants
    let enrollmentsByIndex: Array<{ id: string; client_id: string } | null> = new Array(participants.length).fill(null)
    let matchedSurfCampId: string | null = null
    try {
      const { data: matchingCamps, error: matchError } = await supabaseAdmin
        .from('surf_camps')
        .select('id, name, is_active')
        .eq('start_date', start_date)
        .eq('end_date', end_date)
        .limit(2)

      if (!matchError && matchingCamps && matchingCamps.length > 0) {
        const surfCamp = matchingCamps[0] as SurfCamp
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
                booking_id: bookingId,
                participant_name: pName,
                participant_email: pEmail,
                participant_phone: participant.phone || null,
                status: 'pending',
                skill_level: participant.skillLevel || 'beginner',
                dietary_restrictions: participant.dietaryRequirements || null,
                emergency_contact: participant.emergencyContact || null,
                notes: participant.specialRequests || null,
              })
              .select('id, client_id')
              .single()

            if (enrollmentError) {
              console.warn('⚠️ Enrollment creation failed:', enrollmentError)
              return null
            }

            return enrollment as Enrollment | null
          })
        )

        enrollmentsByIndex = enrollmentResults.map((r) => (r ? { id: r.id, client_id: r.client_id } : null))
      }
    } catch (e) {
      console.warn('⚠️ Surf camp enrollment detection/creation failed:', e)
    }

    // Process room assignments if provided (new format)
    if (hasRoomAssignments) {
      console.log('📦 Processing room assignments...')
      const assignmentsToInsert: Array<{
        booking_id: string
        room_id: string
        client_id: string
        surf_camp_id: string | null
        enrollment_id: string | null
        check_in_date: string
        check_out_date: string
        status: string
      }> = []

      for (const assignment of room_assignments as Array<{
        roomId?: string
        room_id?: string
        guestIds?: unknown[]
        guest_ids?: unknown[]
      }>) {
        const roomId = assignment.roomId || assignment.room_id
        const guestIds: unknown[] = assignment.guestIds || assignment.guest_ids || []

        if (!roomId || !Array.isArray(guestIds) || guestIds.length === 0) continue

        for (const guestId of guestIds) {
          const guestIndex = parseGuestIndex(guestId)
          if (guestIndex === null || guestIndex >= allClientIds.length) continue

          const clientId = allClientIds[guestIndex]
          const enrollment = enrollmentsByIndex[guestIndex]

          assignmentsToInsert.push({
            booking_id: bookingId,
            room_id: roomId,
            client_id: clientId,
            surf_camp_id: enrollment ? matchedSurfCampId : null,
            enrollment_id: enrollment ? enrollment.id : null,
            check_in_date: start_date,
            check_out_date: end_date,
            status: 'confirmed',
          })
        }
      }

      const { error: insertError } = assignmentsToInsert.length
        ? await supabaseAdmin.from('room_assignments').insert(assignmentsToInsert)
        : { error: null }

      const failedAssignments = insertError ? [insertError] : []

      if (failedAssignments.length > 0) {
        console.warn(`⚠️ ${failedAssignments.length} room assignment(s) failed to create`)
        failedAssignments.forEach((err: Error) => console.error('Assignment error:', err))
      } else {
        console.log('✅ All room assignments created successfully')
      }
    }

    // Send booking confirmation email (non-blocking)
    // Note: room variable already fetched above for room_type
    import('@/lib/email-service').then(({ emailService }) => {
      emailService.sendBookingConfirmation({
        bookingId,
        guestName: clientName,
        guestEmail: email,
        checkIn: start_date,
        checkOut: end_date,
        roomName: room?.name || 'Room',
        totalAmount: pricing.total || 0,
        currency: 'EUR',
        status: 'pending',
      }).catch(err => console.error('Failed to send booking confirmation email:', err))

      // Send admin notification
      emailService.sendBookingNotificationToAdmin({
        bookingId,
        guestName: clientName,
        guestEmail: email,
        checkIn: start_date,
        checkOut: end_date,
        roomName: room?.name || 'Room',
        totalAmount: pricing.total || 0,
        currency: 'EUR',
        status: 'pending',
      }).catch(err => console.error('Failed to send admin notification email:', err))
    })

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: bookingId,
          booking_number: `HW-${bookingId.slice(-6).toUpperCase()}`,
          status: 'pending'
        },
        client: {
          id: primaryClientId,
          name: clientName,
          email: email
        },
        payment: {
          payment_link: null, // No payment link for widget bookings initially
          status: 'pending'
        }
      }
    })

  } catch (error: unknown) {
    console.error('❌ Room booking error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
