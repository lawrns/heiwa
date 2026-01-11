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
    // When true, this is a surf week room selection request - skip surf week blocking
    const forSurfWeek = searchParams.get('for_surf_week') === 'true'

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
    // Include guests count for perBed room types to calculate bed usage
    interface RoomBooking {
      room_type: string
      check_in: string
      check_out: string
      guests: number
    }
    let existingBookings: RoomBooking[] = []

    try {
      // Overlap logic: check_out > startDate AND check_in < endDate
      // Use gt (not gte) for check_out because checkout day = checkin day is not a conflict
      const { data, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select('room_type, check_in, check_out, guests')
        .gt('check_out', startDate)
        .lt('check_in', endDate)
        .in('status', ['pending', 'confirmed'])

      if (bookingsError) {
        // If table doesn't exist or error, log warning but continue with empty bookings
        console.warn('Bookings table error:', bookingsError.message)
        existingBookings = []
      } else {
        existingBookings = (data || []).map((b: { room_type: string; check_in: string; check_out: string; guests?: number }) => ({
          ...b,
          guests: b.guests || 1 // Default to 1 guest if not specified
        }))
      }
    } catch (error) {
      console.warn('Error checking bookings, assuming no bookings exist:', error)
      existingBookings = []
    }

    // Check room_assignments table for overlapping assignments
    // This is critical for surf camp bookings where rooms are assigned via room_assignments
    interface RoomAssignmentCount {
      room_id: string
      assignment_count: number
    }
    let roomAssignmentCounts: RoomAssignmentCount[] = []

    try {
      // Find overlapping assignments: check_out > startDate (not >=) because
      // guests checking out on startDate don't conflict with guests checking in
      const { data: assignments, error: assignmentsError } = await supabaseAdmin
        .from('room_assignments')
        .select('room_id')
        .gt('check_out_date', startDate)
        .lt('check_in_date', endDate)

      if (assignmentsError) {
        console.warn('Room assignments table error:', assignmentsError.message)
      } else if (assignments) {
        // Count assignments per room
        const countMap = new Map<string, number>()
        assignments.forEach((a: { room_id: string }) => {
          countMap.set(a.room_id, (countMap.get(a.room_id) || 0) + 1)
        })
        roomAssignmentCounts = Array.from(countMap.entries()).map(([room_id, count]) => ({
          room_id,
          assignment_count: count
        }))
      }
    } catch (error) {
      console.warn('Error checking room assignments:', error)
    }

    // Check for calendar events that block bookings
    interface BlockingEvent {
      id: string
      start_date: string
      end_date: string
      title: string
    }
    let blockingEvents: BlockingEvent[] = []

    try {
      const { data: events, error: eventsError } = await supabaseAdmin
        .from('calendar_events')
        .select('id, start_date, end_date, title')
        .gte('end_date', startDate)
        .lte('start_date', endDate)
        .eq('blocks_bookings', true)

      if (eventsError) {
        console.warn('Calendar events table error:', eventsError.message)
      } else if (events) {
        blockingEvents = events
        if (events.length > 0) {
          console.log(`🚫 Found ${events.length} blocking calendar event(s) overlapping with requested dates`)
        }
      }
    } catch (error) {
      console.warn('Error checking calendar events:', error)
    }

    // Check for active surf weeks that overlap with requested dates
    // Room-only bookings should be blocked during surf weeks
    interface SurfWeek {
      id: string
      start_date: string
      end_date: string
    }
    let activeSurfWeeks: SurfWeek[] = []

    try {
      const { data: surfWeeks, error: surfWeeksError } = await supabaseAdmin
        .from('surf_camps')
        .select('id, start_date, end_date')
        .gte('end_date', startDate)
        .lte('start_date', endDate)
        .eq('is_active', true)

      if (surfWeeksError) {
        console.warn('Surf weeks table error:', surfWeeksError.message)
      } else if (surfWeeks) {
        activeSurfWeeks = surfWeeks
        if (surfWeeks.length > 0) {
          console.log(`🏄 Found ${surfWeeks.length} active surf week(s) overlapping with requested dates`)
        }
      }
    } catch (error) {
      console.warn('Error checking surf weeks:', error)
    }

    // If dates overlap with surf weeks, block room-only bookings
    // But allow room selection for surf week bookings (forSurfWeek=true)
    const hasSurfWeekConflict = activeSurfWeeks.length > 0 && !forSurfWeek

    // Check if dates are blocked by calendar events
    const hasBlockingEventConflict = blockingEvents.length > 0

    // Create a map of room names to IDs for matching
    const roomNameToId = new Map<string, string>()
    ;(allRooms || []).forEach((room: { id?: string; name?: string; [key: string]: unknown }) => {
      if (room.id && room.name) {
        roomNameToId.set(room.name, room.id)
      }
    })

    // Calculate beds used by bookings per room (for perBed rooms)
    const bedsUsedByBookings = new Map<string, number>()
    existingBookings.forEach(booking => {
      const current = bedsUsedByBookings.get(booking.room_type) || 0
      bedsUsedByBookings.set(booking.room_type, current + booking.guests)
    })

    // Filter available rooms - check both date availability AND capacity
    const availableRooms = (allRooms || []).filter((room: { capacity?: number; id?: string; name?: string; booking_type?: string; bookingType?: string; [key: string]: unknown }) => {
      const roomCapacity = room.capacity || 0
      if (roomCapacity < guests) {
        return false
      }

      // Check if room is already booked for these dates via bookings table
      // Match by room name since bookings table uses room_type (text)
      const isBookedViaBookings = existingBookings.some(booking =>
        booking.room_type === room.name
      )

      // For "whole" room types, any booking means it's unavailable
      const roomBookingType = room.booking_type || room.bookingType || 'whole'
      if (roomBookingType === 'whole' && isBookedViaBookings) {
        return false
      }

      // Check room_assignments for capacity
      const assignmentCount = roomAssignmentCounts.find(a => a.room_id === room.id)?.assignment_count || 0

      // For "whole" room types, any assignment means it's unavailable
      if (roomBookingType === 'whole' && assignmentCount > 0) {
        console.log(`🚫 Room ${room.name} (whole) unavailable: ${assignmentCount} assignments`)
        return false
      }

      // For "perBed" room types (dorms), check if there's remaining capacity
      // Must account for BOTH room_assignments AND bookings table
      if (roomBookingType === 'perBed') {
        const bedsFromBookings = bedsUsedByBookings.get(room.name || '') || 0
        const totalBedsUsed = assignmentCount + bedsFromBookings
        const remainingBeds = roomCapacity - totalBedsUsed
        if (remainingBeds < guests) {
          console.log(`🚫 Room ${room.name} (perBed) insufficient: ${remainingBeds} beds available (${assignmentCount} assignments + ${bedsFromBookings} bookings), ${guests} requested`)
          return false
        }
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
        booking_type?: string
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

      // Calculate available beds/spots for this room
      const roomBookingType = r.booking_type || r.bookingType || 'whole'
      const assignmentsCount = roomAssignmentCounts.find(a => a.room_id === r.id)?.assignment_count || 0
      const bookingsCount = bedsUsedByBookings.get(r.name) || 0
      // Total assigned count includes BOTH room_assignments AND bookings
      const totalAssignedCount = assignmentsCount + bookingsCount
      // Calculate available beds based on capacity minus ALL assignments (assignments + bookings)
      // This works for both perBed (dorms) and whole/private rooms
      const availableBeds = Math.max(0, r.capacity - totalAssignedCount)

      return {
        id: r.id,
        name: r.name,
        description: r.description || `Comfortable accommodation with capacity for ${r.capacity} guests`,
        capacity: r.capacity,
        booking_type: roomBookingType,
        available_beds: availableBeds, // remaining spots for this room
        assigned_count: totalAssignedCount, // total already assigned (room_assignments + bookings)
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
    console.log('🖼️ Room images in availability API:', transformedRooms.map((r: {
      id: string
      name: string
      images: string[]
      featured_image: string | null
    }) => ({
      name: r.name,
      images: r.images,
      featured_image: r.featured_image
    })))

    // If blocking calendar events exist, return empty rooms with blocking info
    // This prevents bookings during maintenance periods, holidays, etc.
    if (hasBlockingEventConflict) {
      console.log('🚫 Blocking bookings due to calendar event(s)')
      return NextResponse.json({
        success: true,
        data: {
          available_rooms: [],
          total_rooms: allRooms?.length || 0,
          requested_dates: {
            start_date: startDate,
            end_date: endDate,
            guests: guests
          },
          blocked_by_event: true,
          blocking_events: blockingEvents.map(event => ({
            id: event.id,
            title: event.title,
            start_date: event.start_date,
            end_date: event.end_date
          })),
          message: 'Bookings are not available during these dates due to a scheduled event or maintenance.'
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Version': Date.now().toString()
        }
      })
    }

    // If surf week conflict exists, return empty rooms with blocking info
    // This prevents room-only bookings during surf camp periods
    if (hasSurfWeekConflict) {
      console.log('🚫 Blocking room-only bookings due to active surf week(s)')
      return NextResponse.json({
        success: true,
        data: {
          available_rooms: [],
          total_rooms: allRooms?.length || 0,
          requested_dates: {
            start_date: startDate,
            end_date: endDate,
            guests: guests
          },
          surf_week_conflict: true,
          surf_weeks: activeSurfWeeks.map(sw => ({
            id: sw.id,
            start_date: sw.start_date,
            end_date: sw.end_date
          })),
          message: 'Room-only bookings are not available during surf camp weeks. Please book a surf camp package instead.'
        }
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Version': Date.now().toString()
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        available_rooms: transformedRooms,
        total_rooms: allRooms?.length || 0,
        requested_dates: {
          start_date: startDate,
          end_date: endDate,
          guests: guests
        },
        surf_week_conflict: false,
        blocked_by_event: false
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
  return new NextResponse('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
