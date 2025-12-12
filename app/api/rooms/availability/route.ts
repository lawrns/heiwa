import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

/**
 * Fix Supabase storage bucket name mismatch
 * Maps old /rooms/ bucket URLs to correct /room-images/ bucket
 */
function fixSupabaseBucketUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  
  // Fix bucket name mismatch: /rooms/ -> /room-images/
  // The database has old URLs pointing to /rooms/ bucket which doesn't exist
  // The actual bucket is /room-images/
  if (url.includes('/storage/v1/object/public/rooms/') && !url.includes('/room-images/')) {
    return url.replace('/storage/v1/object/public/rooms/', '/storage/v1/object/public/room-images/');
  }
  
  return url;
}

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

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format (e.g., 2025-12-01)'
      }, { status: 400 })
    }

    // Validate dates are valid Date objects
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date values. Please provide valid dates in YYYY-MM-DD format'
      }, { status: 400 })
    }

    // Validate check-out is after check-in
    if (start >= end) {
      return NextResponse.json({
        success: false,
        error: 'Check-out date must be after check-in date'
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
      const { data, error: bookingsError } = await supabaseAdmin
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

    // Filter available rooms - check both date availability AND capacity
    const availableRooms = (allRooms || []).filter((room: { capacity?: number; id?: string; name?: string; [key: string]: unknown }) => {
      // Check if room is already booked for these dates
      // Match by room name since bookings table uses room_type (text)
      const isBooked = existingBookings.some(booking =>
        booking.room_type === room.name
      )

      if (isBooked) {
        return false
      }

      // Check capacity: For single room selection, room must accommodate all guests
      // For multi-room selection, we'll allow it and validate in UI
      // But at minimum, if a single room can't fit guests, filter it out
      const roomCapacity = room.capacity || 0
      if (roomCapacity > 0 && guests > roomCapacity) {
        // Room can't accommodate all guests alone - but allow for multi-room selection
        // We'll validate total capacity in the UI
        return true // Keep it for multi-room selection possibility
      }

      return true
    })

    console.log('✅ Room availability check completed:', {
      total_rooms: allRooms?.length || 0,
      available_rooms: availableRooms.length,
      requested_guests: guests
    })

    // Determine if requested dates fall in peak season (May-September)
    const checkInDate = new Date(startDate)
    const checkOutDate = new Date(endDate)
    const peakSeasonMonths = [5, 6, 7, 8, 9] // May to September
    let isPeakSeason = false
    const current = new Date(checkInDate)
    while (current < checkOutDate) {
      if (peakSeasonMonths.includes(current.getMonth() + 1)) {
        isPeakSeason = true
        break
      }
      current.setDate(current.getDate() + 1)
    }

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
      
      // Calculate price_per_night based on seasonal rate for requested dates
      const pricePerNight = isPeakSeason 
        ? (r.pricing?.standard || r.pricing?.offSeason || null)
        : (r.pricing?.offSeason || r.pricing?.standard || null)

      // Fix bucket URLs: /rooms/ -> /room-images/
      const fixedImages = (r.images || []).map((img: string) => fixSupabaseBucketUrl(img));
      const fixedFeaturedImage = r.images && r.images.length > 0 
        ? fixSupabaseBucketUrl(r.images[0]) 
        : null;

      return {
        id: r.id,
        name: r.name,
        description: r.description || `Comfortable accommodation with capacity for ${r.capacity} guests`,
        capacity: r.capacity,
        booking_type: r.bookingType || 'whole',
        price_per_night: pricePerNight,
        price_per_night_standard: r.pricing?.standard || null,
        price_per_night_off_season: r.pricing?.offSeason || null,
        amenities: r.amenities || [],
        featured_image: fixedFeaturedImage, // Apply bucket fix
        images: fixedImages, // Apply bucket fix
        is_active: r.isActive !== false,
        pricing: r.pricing, // Include full pricing object for frontend calculation
      }
    })

    // Log room images for debugging
    console.log('🖼️ Room images in availability API:', transformedRooms.map((r: any) => ({
      name: r.name,
      images: r.images,
      featured_image: r.featured_image
    })))

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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Version': Date.now().toString() // Cache busting
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
