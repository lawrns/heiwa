import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Generate date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dateRange: string[] = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0])
    }

    // Check existing bookings for each date
    const dateAvailability = await Promise.all(
      dateRange.map(async (date) => {
        // Check room bookings for this date
        const { data: roomBookings, error: roomError } = await supabase
          .from('room_assignments')
          .select('room_id')
          .lte('check_in_date', date)
          .gte('check_out_date', date)
          .eq('status', 'confirmed')

        if (roomError) {
          console.error('Error checking room bookings:', roomError)
        }

        // Check surf camp bookings for this date
        const { data: surfBookings, error: surfError } = await supabase
          .from('surf_week_assignments')
          .select('surf_camp_id')
          .eq('status', 'confirmed')
          // Note: You might need to add date fields to surf_week_assignments table

        if (surfError) {
          console.error('Error checking surf bookings:', surfError)
        }

        // Get total capacity (simplified - you might want to make this more sophisticated)
        const { data: rooms, error: roomsError } = await supabase
          .from('rooms')
          .select('capacity')
          .eq('is_active', true) as { data: { capacity: number }[] | null; error: unknown }

        const totalCapacity = rooms?.reduce((sum, room) => sum + (room.capacity || 0), 0) || 10
        const bookedCapacity = (roomBookings?.length || 0) + (surfBookings?.length || 0)
        const remaining = Math.max(0, totalCapacity - bookedCapacity)

        return {
          date,
          available: remaining >= participants,
          capacity: totalCapacity,
          booked: bookedCapacity,
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
