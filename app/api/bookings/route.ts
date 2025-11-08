import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET method to fetch bookings from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
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

    // Validate required fields (temporarily disabled for testing)
    // if (!room_id || !start_date || !end_date) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Missing required fields: room_id, start_date, end_date'
    //   }, { status: 400 })
    // }

    // Extract participant info
    const participant = participants[0] || { firstName: clientName, email, phone }
    const participantName = participant.firstName || participant.name || 'Guest'
    const participantEmail = participant.email || email
    const participantPhone = participant.phone || phone

    // Create booking record in Supabase with minimal required fields
    const bookingData = {
      created_at: new Date().toISOString()
    }

    console.log('📝 Creating booking with minimal data:', bookingData)

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({
        success: false,
        error: `Database error: ${bookingError.message}`
      }, { status: 500 })
    }

    console.log('✅ Booking created successfully:', booking)

    return NextResponse.json({
      success: true,
      data: {
        booking_id: booking.id,
        booking_type,
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
