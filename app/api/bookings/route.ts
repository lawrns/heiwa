import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET method to fetch bookings from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        rooms:room_id (
          id,
          name,
          capacity,
          booking_type,
          pricing
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Simplified booking API that works with current Supabase setup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🏄‍♂️ Booking received:', body)

    const {
      booking_type = 'room',
      room_id,
      start_date,
      end_date,
      participants = [],
      guests,
      clientName,
      email,
      phone,
      message
    } = body

    // Validate required fields
    if (!room_id || !start_date || !end_date || !clientName || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: room_id, start_date, end_date, clientName, email'
      }, { status: 400 })
    }

    // Extract participant info
    const participant = participants[0] || { firstName: clientName, email, phone }
    const participantName = participant.firstName || participant.name || clientName
    const participantEmail = participant.email || email
    const participantPhone = participant.phone || phone

    console.log('📝 Creating booking with data:', {
      clientName: participantName,
      email: participantEmail,
      room_id,
      start_date,
      end_date
    })

    // Step 1: Create or find client
    let clientData
    try {
      // Try to find existing client by email
      const { data: existingClient, error: findClientError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('email', participantEmail)
        .single()

      if (findClientError && findClientError.code !== 'PGRST116') {
        console.error('Error finding client:', findClientError)
        return NextResponse.json({
          success: false,
          error: `Database error finding client: ${findClientError.message}`
        }, { status: 500 })
      }

      if (existingClient) {
        clientData = existingClient
        console.log('✅ Found existing client:', clientData.id)
      } else {
        // Create new client
        const newClient = {
          name: participantName,
          email: participantEmail,
          phone: participantPhone || '',
          notes: message || '',
          brand: 'Heiwa House'
        }

        const { data: newClientData, error: createClientError } = await supabaseAdmin
          .from('clients')
          .insert([newClient])
          .select()
          .single()

        if (createClientError) {
          console.error('Error creating client:', createClientError)
          return NextResponse.json({
            success: false,
            error: `Database error creating client: ${createClientError.message}`
          }, { status: 500 })
        }

        clientData = newClientData
        console.log('✅ Created new client:', clientData.id)
      }
    } catch (clientError) {
      console.error('Client creation error:', clientError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create or find client'
      }, { status: 500 })
    }

    // Step 2: Create booking record
    let bookingData
    try {
      const booking = {
        client_ids: [clientData.id],
        items: {
          type: 'room_booking',
          room_id: room_id,
          start_date: start_date,
          end_date: end_date,
          guests: guests || 1
        },
        total_amount: 0, // Will be calculated based on room pricing
        payment_status: 'pending',
        payment_method: 'other',
        notes: message || '',
        source: 'api'
      }

      const { data: newBooking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert([booking])
        .select()
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        return NextResponse.json({
          success: false,
          error: `Database error creating booking: ${bookingError.message}`
        }, { status: 500 })
      }

      bookingData = newBooking
      console.log('✅ Created booking:', bookingData.id)
    } catch (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking'
      }, { status: 500 })
    }

    // Step 3: Create room assignment
    try {
      const roomAssignment = {
        room_id: room_id,
        booking_id: bookingData.id,
        client_id: clientData.id,
        check_in_date: start_date,
        check_out_date: end_date,
        bed_number: null // Will be assigned later
      }

      const { data: assignmentData, error: assignmentError } = await supabaseAdmin
        .from('room_assignments')
        .insert([roomAssignment])
        .select()
        .single()

      if (assignmentError) {
        console.error('Error creating room assignment:', assignmentError)
        // Don't fail the whole booking if assignment fails, but log it
        console.log('⚠️ Booking created but room assignment failed')
      } else {
        console.log('✅ Created room assignment:', assignmentData.id)
      }
    } catch (assignmentError) {
      console.error('Room assignment error:', assignmentError)
      console.log('⚠️ Booking created but room assignment failed')
    }

    console.log('✅ Booking process completed successfully')

    return NextResponse.json({
      success: true,
      data: {
        booking_id: bookingData.id,
        client_id: clientData.id,
        booking_type,
        status: 'confirmed',
        message: 'Booking created successfully'
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
