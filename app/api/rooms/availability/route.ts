import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API endpoint for checking room availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const guests = parseInt(searchParams.get('guests') || '1')

    console.log('🏠 Room availability check:', { startDate, endDate, guests })

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: start_date and end_date'
      }, { status: 400 })
    }

    // Get all rooms
    const { data: allRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms'
      }, { status: 500 })
    }

    // Check for existing bookings that overlap with requested dates
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('room_assignments')
      .select('room_id, check_in_date, check_out_date')
      .gte('check_out_date', startDate)
      .lte('check_in_date', endDate)
      .eq('status', 'confirmed')

    if (bookingsError) {
      console.error('Error fetching existing bookings:', bookingsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check existing bookings'
      }, { status: 500 })
    }

    // Filter available rooms
    const availableRooms = allRooms.filter(room => {
      // Check if room has capacity for requested guests
      if (room.capacity && room.capacity < guests) {
        return false
      }

      // Check if room is already booked for these dates
      const isBooked = existingBookings.some(booking => 
        booking.room_id === room.id
      )

      return !isBooked
    })

    console.log('✅ Room availability check completed:', {
      total_rooms: allRooms.length,
      available_rooms: availableRooms.length,
      requested_guests: guests
    })

    return NextResponse.json({
      success: true,
      data: {
        available_rooms: availableRooms,
        total_rooms: allRooms.length,
        requested_dates: {
          start_date: startDate,
          end_date: endDate,
          guests: guests
        }
      }
    })

  } catch (error) {
    console.error('Error checking room availability:', error)
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
