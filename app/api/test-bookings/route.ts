import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing bookings table...')
    
    // Check if bookings table exists
    const { data: tables, error: tablesError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)

    if (tablesError) {
      console.error('Bookings table error:', tablesError)
      return NextResponse.json({
        success: false,
        error: tablesError.message,
        details: 'Bookings table access failed'
      })
    }

    // Test creating a simple booking using the correct schema
    const testBooking = {
      booking_type: 'room',
      room_id: 'f3f00cbb-c30e-4d84-9352-cfb6a76684d0',
      camp_id: null,
      check_in_date: '2025-12-15',
      check_out_date: '2025-12-17',
      total_participants: 1,
      total_guests: 2,
      pricing_breakdown: null,
      add_ons: [],
      source_url: null,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const { data: insertedBooking, error: insertError } = await supabase
      .from('bookings')
      .insert(testBooking as any)
      .select()
      .single()

    if (insertError) {
      console.error('Insert booking error:', insertError)
      return NextResponse.json({
        success: false,
        error: insertError.message,
        details: 'Failed to insert test booking'
      })
    }

    // Clean up the test booking
    if ((insertedBooking as any)?.id) {
      await supabase
        .from('bookings')
        .delete()
        .eq('id', (insertedBooking as any).id)
    }

    return NextResponse.json({
      success: true,
      message: 'Bookings table working correctly',
      testBookingId: (insertedBooking as any)?.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Unexpected booking test error'
    })
  }
}
