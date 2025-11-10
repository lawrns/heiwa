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
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select(`
        id,
        client_id,
        status,
        skill_level,
        clients:client_id (
          id,
          name,
          email,
          phone
        ),
        bookings:booking_id (
          id
        )
      `)
      .eq('surf_camp_id', weekId)
      .eq('status', 'confirmed')

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      )
    }

    // Transform enrollments to participants format
    const participants = (enrollments || []).map((enrollment: any) => ({
      id: enrollment.id, // Use enrollment ID as participant ID
      name: enrollment.clients?.name || 'Unknown',
      email: enrollment.clients?.email || '',
      surfLevel: enrollment.skill_level || 'Beginner',
      bookingId: enrollment.bookings?.id || enrollment.booking_id || '',
      clientId: enrollment.client_id
    }))

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error in participants API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

