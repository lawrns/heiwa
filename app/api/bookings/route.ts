import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Booking API - Fixed database schema field names

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
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('payment_status', status)
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
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        debug: 'POST endpoint updated 2025-11-09'
      },
      { status: 500 }
    )
  }
}

// Simplified booking API that works with current Supabase setup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🏄‍♂️ Booking received:', body)

    // Check if this is a surf week booking from widget (has camp_id) or legacy format
    const isSurfWeekBooking = body.camp_id && body.participants

    if (isSurfWeekBooking) {
      // Handle surf week booking from widget
      const {
        camp_id,
        participants = [],
        pricing = {},
        source_url,
        widget_version
      } = body

      console.log('🏄‍♂️ Surf Week Booking Widget received:', {
        camp_id,
        participants: participants.length,
        pricing,
        source_url,
        widget_version
      })

      // Validate required fields
      if (!camp_id || !participants.length) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields: camp_id, participants'
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

      console.log('📝 Creating surf week booking with data:', {
        clientName,
        email,
        campId: camp_id,
        participants: participants.length
      })

      // Check if client exists or create new one
      let clientResult = await supabaseAdmin
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
          phone: phone,
          brand: 'Heiwa House',
          status: 'active',
          registrationDate: new Date().toISOString(),
          notes: `Created via surf week booking widget ${widget_version || 'unknown'}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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

      // Create surf week booking record
      const bookingData = {
        client_ids: [clientId],
        items: [{
          type: 'surfCamp',
          itemId: camp_id,
          quantity: 1,
          unitPrice: pricing.basePrice || 0,
          totalPrice: pricing.total || 0,
          dates: null // Surf camps don't have specific dates like rooms
        }],
        total_amount: pricing.total || 0,
        status: 'pending',
        payment_status: 'pending',
        payment_method: null,
        notes: `Created via surf week booking widget ${widget_version || 'unknown'}${source_url ? ` from ${source_url}` : ''}`,
        source: 'dashboard'
      }

      const bookingResult = await supabaseAdmin
        .from('bookings')
        .insert(bookingData as any)
        .select('id')
        .single()

      if (bookingResult.error) {
        console.error('Failed to create surf week booking:', bookingResult.error)
        return NextResponse.json({
          success: false,
          error: 'Failed to create surf week booking record'
        }, { status: 500 })
      }

      const bookingId = (bookingResult.data as any).id
      console.log('✅ Surf week booking created:', bookingId)

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
    } else {
      // Handle legacy room booking format
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

      console.log('📝 Creating legacy booking with data:', {
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
          clientData = existingClient as any
          console.log('✅ Found existing client:', (clientData as any).id)
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
            .insert([newClient] as any)
            .select()
            .single()

          if (createClientError) {
            console.error('Error creating client:', createClientError)
            return NextResponse.json({
              success: false,
              error: `Database error creating client: ${createClientError.message}`
            }, { status: 500 })
          }

          clientData = newClientData as any
          console.log('✅ Created new client:', (clientData as any).id)
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
        items: [{
          type: 'room',
          itemId: room_id,
          quantity: 1,
          unitPrice: 0, // Will be calculated later
          totalPrice: 0, // Will be calculated later
          dates: {
            checkIn: start_date,
            checkOut: end_date
          }
        }],
        total_amount: 0, // Will be calculated based on room pricing
        status: 'pending',
        payment_status: 'pending',
        payment_method: null,
        notes: message || '',
        source: 'api'
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
          error: `Database error creating booking: ${bookingError.message}`,
          timestamp: new Date().toISOString(),
          debug: 'POST endpoint updated 2025-11-09 - schema fixes applied'
        }, { status: 500 })
      }

      bookingData = newBooking as any
      console.log('✅ Created booking:', (bookingData as any).id)
    } catch (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking'
      }, { status: 500 })
    }

    console.log('✅ Legacy booking process completed successfully')

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: (bookingData as any).id,
          booking_number: `HW-${(bookingData as any).id.slice(-6).toUpperCase()}`,
          status: 'pending'
        },
        client: {
          id: (clientData as any).id,
          name: (clientData as any).name,
          email: (clientData as any).email
        },
        payment: {
          payment_link: null,
          status: 'pending'
        }
      }
    })
  }

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
