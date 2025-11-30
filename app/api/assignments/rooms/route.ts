import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('weekId')

    // Fetch all active rooms
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('id, name, capacity, booking_type, amenities, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json(
        { error: 'Failed to fetch rooms', details: roomsError.message },
        { status: 500 }
      )
    }

    // Fetch current room assignments to calculate occupancy
    let occupancyMap = new Map<string, number>()
    
    if (weekId) {
      // Get assignments for specific surf camp week
      const { data: assignments, error: assignmentsError } = await supabaseAdmin
        .from('room_assignments')
        .select('room_id')
        .eq('surf_camp_id', weekId)
        .eq('status', 'confirmed')
      
      if (!assignmentsError && assignments) {
        assignments.forEach((a: any) => {
          const count = occupancyMap.get(a.room_id) || 0
          occupancyMap.set(a.room_id, count + 1)
        })
      }
    } else {
      // Get all current active assignments (check-in <= today <= check-out)
      const today = new Date().toISOString().split('T')[0]
      const { data: assignments, error: assignmentsError } = await supabaseAdmin
        .from('room_assignments')
        .select('room_id')
        .lte('check_in_date', today)
        .gte('check_out_date', today)
        .eq('status', 'confirmed')
      
      if (!assignmentsError && assignments) {
        assignments.forEach((a: any) => {
          const count = occupancyMap.get(a.room_id) || 0
          occupancyMap.set(a.room_id, count + 1)
        })
      }
    }

    // Transform rooms to assignment format with actual occupancy
    const transformedRooms = (rooms || []).map((room: any) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity || 1,
      type: room.booking_type === 'perBed' ? 'dorm' : 'private',
      amenities: room.amenities || [],
      currentOccupancy: occupancyMap.get(room.id) || 0,
      availableSpots: (room.capacity || 1) - (occupancyMap.get(room.id) || 0)
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

