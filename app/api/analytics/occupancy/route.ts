// Occupancy Analytics API
// Real occupancy data from room assignments

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Get all rooms with their capacity
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('id, name, capacity, is_active')
      .eq('is_active', true)

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rooms data' },
        { status: 500 }
      )
    }

    // Get room assignments
    let assignmentsQuery = supabaseAdmin
      .from('room_assignments')
      .select('room_id, check_in_date, check_out_date')

    if (startDate) {
      assignmentsQuery = assignmentsQuery.gte('check_in_date', startDate)
    }
    if (endDate) {
      assignmentsQuery = assignmentsQuery.lte('check_out_date', endDate)
    }

    const { data: assignments, error: assignmentsError } = await assignmentsQuery

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch assignments data' },
        { status: 500 }
      )
    }

    // Calculate occupancy by room
    const roomOccupancy = rooms?.map(room => {
      const roomAssignments = assignments?.filter(a => a.room_id === room.id) || []
      const totalCapacity = room.capacity || 1
      const occupiedBeds = roomAssignments.length
      const occupancyRate = totalCapacity > 0 
        ? (occupiedBeds / totalCapacity * 100).toFixed(1)
        : '0'

      return {
        roomId: room.id,
        roomName: room.name,
        capacity: totalCapacity,
        occupied: occupiedBeds,
        available: totalCapacity - occupiedBeds,
        occupancyRate: parseFloat(occupancyRate)
      }
    }) || []

    // Calculate overall occupancy
    const totalCapacity = roomOccupancy.reduce((sum, room) => sum + room.capacity, 0)
    const totalOccupied = roomOccupancy.reduce((sum, room) => sum + room.occupied, 0)
    const overallOccupancyRate = totalCapacity > 0
      ? (totalOccupied / totalCapacity * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      success: true,
      data: {
        overallOccupancyRate: parseFloat(overallOccupancyRate),
        totalCapacity,
        totalOccupied,
        totalAvailable: totalCapacity - totalOccupied,
        roomOccupancy
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

