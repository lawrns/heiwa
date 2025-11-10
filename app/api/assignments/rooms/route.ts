import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch all active rooms
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('id, name, capacity, type, amenities, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      )
    }

    // Transform rooms to assignment format
    const transformedRooms = (rooms || []).map((room: any) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity || 1,
      type: room.type === 'shared' || room.type === 'dorm' ? 'dorm' : 'private',
      amenities: room.amenities || [],
      currentOccupancy: 0 // Will be calculated from assignments
    }))

    return NextResponse.json(transformedRooms)
  } catch (error) {
    console.error('Error in rooms API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

