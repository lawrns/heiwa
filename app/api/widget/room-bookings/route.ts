import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    if (!hasRoomAssignments && !room_id) {
      return NextResponse.json({
        success: false,
        error: 'Must provide either room_id or room_assignments array'
      }, { status: 400 })
    }

    const primaryParticipant = participants[0]
    const clientName = primaryParticipant.name || `${primaryParticipant.firstName} ${primaryParticipant.lastName}`.trim()
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

    // Check if client exists or create new one
    const clientResult = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('email', email)
      .single()

    let clientId: string

    if (clientResult.error && clientResult.error.code === 'PGRST116') {
      // Client doesn't exist, create new one
      const newClient = {
        name: clientName,
        email: email,
        phone: phone
      }

      const createResult = await supabaseAdmin
        .from('clients')
        .insert(newClient as any)
        .select('id')
        .single()

      if (createResult.error) {
        console.error('Failed to create client:', createResult.error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create client record'
        }, { status: 500 })
      }

      clientId = (createResult.data as any).id
      console.log('✅ New client created:', clientId)
    } else if (clientResult.error) {
      console.error('Failed to check client:', clientResult.error)
      return NextResponse.json({
        success: false,
        error: 'Failed to verify client'
      }, { status: 500 })
    } else {
      clientId = (clientResult.data as any).id
      console.log('✅ Existing client found:', clientId)
    }

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
      client_ids: [clientId],
      total_amount: pricing.total || 0,
      status: 'pending',
      payment_status: 'pending',
      guests: guests || participants.length, // Save guest count (use guests param or participants length)
      check_in: start_date, // REQUIRED - NOT NULL field
      check_out: end_date, // REQUIRED - NOT NULL field
      room_type: room?.name || room_id // Set room_type from room name or fallback to room_id
    }

    const bookingResult = await supabaseAdmin
      .from('bookings')
      .insert(bookingData as any)
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

    const bookingId = (bookingResult.data as any).id
    console.log('✅ Booking created:', bookingId)

    // Process room assignments if provided (new format)
    if (hasRoomAssignments) {
      console.log('📦 Processing room assignments...')
      const assignmentPromises = room_assignments.map((assignment: any) =>
        supabaseAdmin
          .from('room_assignments')
          .insert({
            booking_id: bookingId,
            room_id: assignment.roomId,
            check_in_date: start_date,
            check_out_date: end_date,
            status: 'confirmed',
            guest_count: assignment.guestIds?.length || 1
          })
      )

      const assignmentResults = await Promise.all(assignmentPromises)
      const failedAssignments = assignmentResults.filter(r => r.error)

      if (failedAssignments.length > 0) {
        console.warn(`⚠️ ${failedAssignments.length} room assignment(s) failed to create`)
        failedAssignments.forEach(r => console.error('Assignment error:', r.error))
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
          id: clientId,
          name: clientName,
          email: email
        },
        payment: {
          payment_link: null, // No payment link for widget bookings initially
          status: 'pending'
        }
      }
    })

  } catch (error: any) {
    console.error('❌ Room booking error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}
