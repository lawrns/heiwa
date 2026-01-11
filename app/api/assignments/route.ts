import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET assignments for a week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('weekId')

    if (!weekId) {
      return NextResponse.json(
        { error: 'weekId is required' },
        { status: 400 }
      )
    }

    // Fetch room assignments for this surf camp
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('room_assignments')
      .select(`
        id,
        room_id,
        client_id,
        enrollment_id,
        check_in_date,
        check_out_date,
        bed_number
      `)
      .eq('surf_camp_id', weekId)

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      // Return empty array if table doesn't exist yet or no assignments
      return NextResponse.json([])
    }

    // Group assignments by room_id
    const groupedAssignments: Record<string, string[]> = {} as Record<string, string[]>
    
    (assignments || []).forEach((assignment: { enrollment_id?: string; room_id?: string }) => {
      const enrollmentId = assignment.enrollment_id
      if (enrollmentId && assignment.room_id) {
        if (!groupedAssignments[assignment.room_id]) {
          groupedAssignments[assignment.room_id] = []
        }
        // Use enrollment ID as participant ID
        groupedAssignments[assignment.room_id].push(enrollmentId)
      }
    })

    // Transform to Assignment format
    const result = Object.entries(groupedAssignments).map(([roomId, participantIds]) => ({
      roomId,
      participantIds
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in assignments GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST/Save assignments for a week
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const { weekId, assignments } = body

    if (!weekId) {
      return NextResponse.json(
        { error: 'weekId is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'assignments must be an array' },
        { status: 400 }
      )
    }

    // Get surf camp dates for check-in/check-out
    const { data: surfCamp } = await supabaseAdmin
      .from('surf_camps')
      .select('start_date, end_date')
      .eq('id', weekId)
      .single()

    if (!surfCamp) {
      return NextResponse.json(
        { error: 'Surf camp not found' },
        { status: 404 }
      )
    }

    // Get room capacities for validation
    const roomIds = assignments.map((a: { roomId: string }) => a.roomId).filter(Boolean)
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('id, name, capacity')
      .in('id', roomIds)

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json(
        { error: 'Failed to validate room capacities' },
        { status: 500 }
      )
    }

    // Create a map of room capacities for quick lookup
    const roomCapacities = new Map<string, { name: string; capacity: number }>()
    for (const room of rooms || []) {
      roomCapacities.set(room.id, { name: room.name, capacity: room.capacity })
    }

    // Validate that no room exceeds its capacity
    const capacityErrors: string[] = []
    for (const assignment of assignments) {
      const { roomId, participantIds } = assignment
      const room = roomCapacities.get(roomId)

      if (room && participantIds.length > room.capacity) {
        capacityErrors.push(
          `Room "${room.name}" has capacity ${room.capacity} but ${participantIds.length} guests assigned`
        )
      }
    }

    if (capacityErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Room capacity exceeded',
          details: capacityErrors
        },
        { status: 400 }
      )
    }

    // Delete existing assignments for this week
    await supabaseAdmin
      .from('room_assignments')
      .delete()
      .eq('surf_camp_id', weekId)

    // Create new assignments
    const roomAssignmentsToInsert: Array<{
      room_id: string
      client_id: string
      surf_camp_id: string
      enrollment_id: string
      check_in_date: string
      check_out_date: string
      status: string
      booking_id?: string
    }> = []

    for (const assignment of assignments) {
      const { roomId, participantIds } = assignment

      for (const enrollmentId of participantIds) {
        // Get enrollment to get client_id (booking_id is optional)
        const { data: enrollment } = await supabaseAdmin
          .from('surf_camp_enrollments')
          .select('client_id, booking_id')
          .eq('id', enrollmentId)
          .single()

        if (enrollment) {
          const assignmentData: {
            room_id: string
            client_id: string
            surf_camp_id: string
            enrollment_id: string
            check_in_date: string
            check_out_date: string
            status: string
            booking_id?: string
          } = {
            room_id: roomId,
            client_id: enrollment.client_id,
            surf_camp_id: weekId,
            enrollment_id: enrollmentId,
            check_in_date: surfCamp.start_date,
            check_out_date: surfCamp.end_date,
            status: 'confirmed'
          }
          
          // Only include booking_id if it exists
          if (enrollment.booking_id) {
            assignmentData.booking_id = enrollment.booking_id
          }
          
          roomAssignmentsToInsert.push(assignmentData)
        }
      }
    }

    if (roomAssignmentsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('room_assignments')
        .insert(roomAssignmentsToInsert)

      if (insertError) {
        console.error('Error inserting assignments:', insertError)
        return NextResponse.json(
          { error: 'Failed to save assignments' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${roomAssignmentsToInsert.length} room assignments`
    })
  } catch (error) {
    console.error('Error in assignments POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

