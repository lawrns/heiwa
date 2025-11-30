import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(weekId)) {
      console.error('Invalid weekId format:', weekId)
      return NextResponse.json(
        { error: 'Invalid weekId format', details: 'weekId must be a valid UUID' },
        { status: 400 }
      )
    }

    // Fetch enrollments for this surf camp
    // Include both 'pending' and 'confirmed' status enrollments
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select(`
        id,
        client_id,
        status,
        skill_level,
        participant_name,
        participant_email,
        participant_phone
      `)
      .eq('surf_camp_id', weekId)
      .in('status', ['pending', 'confirmed'])

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', {
        error: enrollmentsError,
        code: enrollmentsError.code,
        message: enrollmentsError.message,
        details: enrollmentsError.details,
        hint: enrollmentsError.hint,
        weekId
      })
      return NextResponse.json(
        { 
          error: 'Failed to fetch participants', 
          details: enrollmentsError.message,
          code: enrollmentsError.code,
          hint: enrollmentsError.hint || 'Check if surf_camp_enrollments table exists and RLS policies allow access'
        },
        { status: 500 }
      )
    }

    if (!enrollments || enrollments.length === 0) {
      console.log(`No enrollments found for weekId: ${weekId}`)
      return NextResponse.json([])
    }

    // Fetch clients separately to avoid foreign key join issues
    const clientIds = enrollments.map((e: any) => e.client_id).filter(Boolean)
    let clientMap = new Map()
    
    if (clientIds.length > 0) {
      const { data: clients, error: clientsError } = await supabaseAdmin
        .from('clients')
        .select('id, name, email, phone')
        .in('id', clientIds)

      if (clientsError) {
        console.error('Error fetching clients:', {
          error: clientsError,
          code: clientsError.code,
          message: clientsError.message,
          clientIds: clientIds.slice(0, 5) // Log first 5 IDs
        })
        // Continue without client details rather than failing
      } else if (clients) {
        clients.forEach((client: any) => {
          clientMap.set(client.id, client)
        })
        console.log(`Successfully fetched ${clients.length} clients for ${clientIds.length} enrollments`)
      }
    }

    // Fetch room assignments for these enrollments
    const enrollmentIds = enrollments.map((e: any) => e.id)
    let roomAssignmentMap = new Map()
    
    if (enrollmentIds.length > 0) {
      const { data: roomAssignments, error: raError } = await supabaseAdmin
        .from('room_assignments')
        .select(`
          id,
          enrollment_id,
          room_id,
          bed_number,
          rooms:room_id (
            id,
            name,
            booking_type,
            capacity
          )
        `)
        .in('enrollment_id', enrollmentIds)
      
      if (!raError && roomAssignments) {
        roomAssignments.forEach((ra: any) => {
          roomAssignmentMap.set(ra.enrollment_id, {
            roomId: ra.room_id,
            roomName: ra.rooms?.name || 'Unassigned',
            roomType: ra.rooms?.booking_type === 'perBed' ? 'dorm' : 'private',
            bedNumber: ra.bed_number
          })
        })
      }
    }

    // Transform enrollments to participants format
    const participants = enrollments.map((enrollment: any) => {
      const client = clientMap.get(enrollment.client_id)
      const roomAssignment = roomAssignmentMap.get(enrollment.id)
      
      return {
        id: enrollment.id, // Use enrollment ID as participant ID
        name: client?.name || enrollment.participant_name || 'Unknown',
        email: client?.email || enrollment.participant_email || '',
        phone: client?.phone || enrollment.participant_phone || '',
        surfLevel: enrollment.skill_level || 'Beginner',
        clientId: enrollment.client_id,
        status: enrollment.status,
        // Room assignment info
        roomId: roomAssignment?.roomId || null,
        roomName: roomAssignment?.roomName || 'Not Assigned',
        roomType: roomAssignment?.roomType || null,
        bedNumber: roomAssignment?.bedNumber || null
      }
    })

    return NextResponse.json(participants)
  } catch (error: any) {
    console.error('Unexpected error in participants API:', {
      error: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

