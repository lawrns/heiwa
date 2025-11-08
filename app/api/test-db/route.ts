import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')

    // Test basic connection
    const { data: expData, error: expError } = await supabase
      .from('experiences')
      .select('count')
      .limit(1)

    if (expError) {
      console.error('Experiences table error:', expError)
      return NextResponse.json({
        success: false,
        error: expError.message,
        details: 'Experiences table access failed'
      })
    }

    // Test rooms table
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('count')
      .limit(1)

    if (roomError) {
      console.error('Rooms table error:', roomError)
      return NextResponse.json({
        success: false,
        error: roomError.message,
        details: 'Rooms table access failed'
      })
    }

    // Test bookings table
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .limit(1)

      if (bookingError) {
        console.error('Bookings table error:', bookingError)
        return NextResponse.json({
          success: true,
          message: 'Database connected, but bookings table has issues',
          database_ok: true,
          experiences_ok: true,
          rooms_ok: true,
          bookings_error: bookingError.message,
          timestamp: new Date().toISOString()
        })
      }

      return NextResponse.json({
        success: true,
        message: 'All tables accessible',
        database_ok: true,
        experiences_ok: true,
        rooms_ok: true,
        bookings_ok: true,
        sample_booking_count: bookingData?.length || 0,
        timestamp: new Date().toISOString()
      })

    } catch (bookingQueryError) {
      return NextResponse.json({
        success: true,
        message: 'Database connected, bookings table query failed',
        database_ok: true,
        experiences_ok: true,
        rooms_ok: true,
        bookings_error: bookingQueryError instanceof Error ? bookingQueryError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Unexpected database error'
    })
  }
}
