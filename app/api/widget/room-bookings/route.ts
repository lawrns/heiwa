import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET method to provide room booking availability info
export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🏄‍♂️ Room Booking Widget received:', {
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
        notes: `Created via booking widget ${widget_version || 'unknown'}`,
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

    // Create booking record
    const bookingData = {
      client_id: clientId,
      room_id: room_id,
      clientName: clientName,
      email: email,
      phone: phone,
      start_date: start_date,
      end_date: end_date,
      guests: guests,
      total_amount: pricing.total || 0,
      status: 'pending',
      payment_status: 'pending',
      payment_method: null,
      notes: `Created via booking widget ${widget_version || 'unknown'}${source_url ? ` from ${source_url}` : ''}`,
      source: 'dashboard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const bookingResult = await supabaseAdmin
      .from('bookings')
      .insert(bookingData as any)
      .select('id')
      .single()

    if (bookingResult.error) {
      console.error('Failed to create booking:', bookingResult.error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create booking record'
      }, { status: 500 })
    }

    const bookingId = (bookingResult.data as any).id
    console.log('✅ Booking created:', bookingId)

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
