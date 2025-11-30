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

    // Fetch enrollments for this surf camp
    // Include both 'pending' and 'confirmed' status enrollments
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select(`
        id,
        client_id,
        status,
        skill_level,
        booking_id
      `)
      .eq('surf_camp_id', weekId)
      .in('status', ['pending', 'confirmed'])

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch participants', details: enrollmentsError.message },
        { status: 500 }
      )
    }

    if (!enrollments || enrollments.length === 0) {
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
        console.error('Error fetching clients:', clientsError)
        // Continue without client details rather than failing
      } else if (clients) {
        clients.forEach((client: any) => {
          clientMap.set(client.id, client)
        })
      }
    }

    // Transform enrollments to participants format
    const participants = enrollments.map((enrollment: any) => {
      const client = clientMap.get(enrollment.client_id)
      
      return {
        id: enrollment.id, // Use enrollment ID as participant ID
        name: client?.name || 'Unknown',
        email: client?.email || '',
        phone: client?.phone || '',
        surfLevel: enrollment.skill_level || 'Beginner',
        bookingId: enrollment.booking_id || '',
        clientId: enrollment.client_id,
        status: enrollment.status
      }
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error in participants API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

