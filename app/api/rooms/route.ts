import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API endpoint for getting all rooms
export async function GET(request: NextRequest) {
  try {
    console.log('🏠 Fetching all rooms')

    // Get all active rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms'
      }, { status: 500 })
    }

    console.log('✅ Rooms fetched successfully:', rooms.length)

    return NextResponse.json({
      success: true,
      data: {
        rooms: rooms || []
      }
    })

  } catch (error) {
    console.error('Error fetching rooms:', error)
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
