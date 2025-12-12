import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// API endpoint for checking date availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const participants = parseInt(searchParams.get('participants') || '1')

    console.log('📅 Date availability check:', { startDate, endDate, participants })

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

    // Generate date range
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate dates are valid Date objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date values. Please provide valid dates in YYYY-MM-DD format'
      }, { status: 400 })
    }

    // Validate end date is after start date
    if (start >= end) {
      return NextResponse.json({
        success: false,
        error: 'End date must be after start date'
      }, { status: 400 })
    }
    const dateRange: string[] = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0])
    }

    // Check existing bookings for each date
    // Note: Room bookings and surf camp enrollments are SEPARATE systems
    // Room availability should only consider room bookings against room capacity
    // Surf camp availability should only consider surf camp enrollments against surf camp capacity
    const dateAvailability = await Promise.all(
      dateRange.map(async (date) => {
        // Check room bookings for this date
        const { data: roomBookings, error: roomError } = await supabaseAdmin
          .from('bookings')
          .select('room_type, guests')
          .lte('check_in', date)
          .gte('check_out', date)
          .in('status', ['pending', 'confirmed'])

        if (roomError) {
          console.error('Error checking room bookings:', roomError)
        }

        // Get total room capacity (only active rooms)
        const { data: rooms } = await supabase
          .from('rooms')
          .select('capacity')
          .eq('is_active', true) as { data: { capacity: number }[] | null; error: unknown }

        const totalCapacity = rooms?.reduce((sum, room) => sum + (room.capacity || 0), 0) || 10
        
        // Count booked guests from room bookings only
        // (Surf camp enrollments are a separate system with separate capacity)
        const bookedGuests = roomBookings?.reduce((sum, booking) => sum + (booking.guests || 1), 0) || 0
        const remaining = Math.max(0, totalCapacity - bookedGuests)

        return {
          date,
          available: remaining >= participants,
          capacity: totalCapacity,
          booked: bookedGuests,
          remaining
        }
      })
    )

    const summary = {
      total_dates_checked: dateAvailability.length,
      available_dates: dateAvailability.filter(d => d.available).length,
      sold_out_dates: dateAvailability.filter(d => !d.available).length,
      total_capacity: dateAvailability[0]?.capacity || 0,
      participants_requested: participants
    }

    console.log('✅ Date availability check completed:', summary)

    return NextResponse.json({
      success: true,
      data: {
        date_availability: dateAvailability,
        summary
      },
      meta: {
        checked_at: new Date().toISOString(),
        cache_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        fallback: false
      }
    })

  } catch (error) {
    console.error('Error checking date availability:', error)
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
