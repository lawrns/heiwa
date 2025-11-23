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
      .eq('is_active', true) as { data: Array<{ capacity?: number; [key: string]: unknown }> | null; error: unknown }

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms'
      }, { status: 500 })
    }

    // Check for existing bookings that overlap with requested dates
    // Bookings table uses room_type (text/room name) instead of room_id
    interface RoomBooking {
      room_type: string
      check_in: string
      check_out: string
    }
    let existingBookings: RoomBooking[] = []

    try {
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select('room_type, check_in, check_out')
        .gte('check_out', startDate)
        .lte('check_in', endDate)
        .in('status', ['pending', 'confirmed'])

      if (bookingsError) {
        // If table doesn't exist or error, log warning but continue with empty bookings
        console.warn('Bookings table error:', bookingsError.message)
        existingBookings = []
      } else {
        existingBookings = data || []
      }
    } catch (error) {
      console.warn('Error checking bookings, assuming no bookings exist:', error)
      existingBookings = []
    }

    // Create a map of room names to IDs for matching
    const roomNameToId = new Map<string, string>()
    ;(allRooms || []).forEach((room: { id?: string; name?: string }) => {
      if (room.id && room.name) {
        roomNameToId.set(room.name, room.id)
      }
    })

    // Filter available rooms - only check date availability, not capacity
    // Users will select multiple rooms to accommodate all guests
    const availableRooms = (allRooms || []).filter((room: { capacity?: number; id?: string; name?: string; [key: string]: unknown }) => {
      // Check if room is already booked for these dates
      // Match by room name since bookings table uses room_type (text)
      const isBooked = existingBookings.some(booking =>
        booking.room_type === room.name
      )

      return !isBooked
    })

    console.log('✅ Room availability check completed:', {
      total_rooms: allRooms?.length || 0,
      available_rooms: availableRooms.length,
      requested_guests: guests
    })

    // Transform rooms to match booking widget expected format (same as /rooms endpoint)
    const transformedRooms = availableRooms.map((room: unknown) => {
      const r = room as {
        id: string
        name: string
        description?: string
        capacity: number
        bookingType?: string
        pricing?: { standard?: number; offSeason?: number }
        amenities?: string[]
        images?: string[]
        isActive?: boolean
      }
      // Calculate price_per_night from pricing object
      const pricePerNight = r.pricing?.standard || r.pricing?.offSeason || 80

      return {
        id: r.id,
        name: r.name,
        description: r.description || `Comfortable accommodation with capacity for ${r.capacity} guests`,
        capacity: r.capacity,
        booking_type: r.bookingType || 'whole',
        price_per_night: pricePerNight,
        amenities: r.amenities || [],
        featured_image: r.images && r.images.length > 0 ? r.images[0] : null,
        images: r.images || [],
        is_active: r.isActive !== false,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        available_rooms: transformedRooms,
        total_rooms: allRooms?.length || 0,
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
