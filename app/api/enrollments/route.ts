import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET enrollments for a surf camp
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const surfCampId = searchParams.get('surf_camp_id')

    if (!surfCampId) {
      return NextResponse.json(
        { error: 'surf_camp_id is required' },
        { status: 400 }
      )
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select(`
        id,
        client_id,
        booking_id,
        status,
        skill_level,
        dietary_restrictions,
        emergency_contact,
        notes,
        enrolled_at,
        clients:client_id (
          id,
          name,
          email,
          phone
        ),
        bookings:booking_id (
          id,
          total_amount
        )
      `)
      .eq('surf_camp_id', surfCampId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Error fetching enrollments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      )
    }

    return NextResponse.json(enrollments || [])
  } catch (error) {
    console.error('Error in enrollments GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const {
      surf_camp_id,
      client_id,
      booking_id,
      skill_level,
      dietary_restrictions,
      emergency_contact,
      notes,
      status = 'pending'
    } = body

    if (!surf_camp_id || !client_id) {
      return NextResponse.json(
        { error: 'surf_camp_id and client_id are required' },
        { status: 400 }
      )
    }

    // Check if enrollment already exists
    const { data: existing } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select('id')
      .eq('surf_camp_id', surf_camp_id)
      .eq('client_id', client_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Client is already enrolled in this surf camp' },
        { status: 409 }
      )
    }

    // Check surf camp capacity
    const { data: surfCamp } = await supabaseAdmin
      .from('surf_camps')
      .select('max_participants, name')
      .eq('id', surf_camp_id)
      .single()

    if (!surfCamp) {
      return NextResponse.json(
        { error: 'Surf camp not found' },
        { status: 404 }
      )
    }

    // Count current enrollments (both pending and confirmed)
    const { count } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('surf_camp_id', surf_camp_id)
      .in('status', ['pending', 'confirmed'])

    if (count !== null && count >= surfCamp.max_participants) {
      return NextResponse.json(
        { error: 'Surf camp is full' },
        { status: 400 }
      )
    }

    // Create enrollment
    const { data: enrollment, error: insertError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .insert({
        surf_camp_id,
        client_id,
        booking_id,
        status,
        skill_level,
        dietary_restrictions,
        emergency_contact,
        notes
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating enrollment:', insertError)
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
    }

    // Fetch client and surf camp details for email
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('name, email')
      .eq('id', client_id)
      .single()

    const { data: camp } = await supabaseAdmin
      .from('surf_camps')
      .select('name, start_date, end_date')
      .eq('id', surf_camp_id)
      .single()

    // Send enrollment confirmation email
    if (client?.email && camp) {
      import('@/lib/email-service').then(({ emailService }) => {
        emailService.sendEnrollmentConfirmation({
          enrollmentId: enrollment.id,
          participantName: client.name || 'Participant',
          participantEmail: client.email,
          surfCampName: camp.name,
          startDate: camp.start_date,
          endDate: camp.end_date,
          skillLevel: enrollment.skill_level,
          status: enrollment.status,
        }).catch(err => console.error('Failed to send enrollment confirmation email:', err))
      })
    }

    return NextResponse.json({
      success: true,
      data: enrollment
    }, { status: 201 })
  } catch (error) {
    console.error('Error in enrollments POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update enrollment
export async function PUT(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'enrollment id is required' },
        { status: 400 }
      )
    }

    const { data: enrollment, error } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating enrollment:', error)
      return NextResponse.json(
        { error: 'Failed to update enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: enrollment
    })
  } catch (error) {
    console.error('Error in enrollments PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel enrollment
export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'enrollment id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting enrollment:', error)
      return NextResponse.json(
        { error: 'Failed to delete enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment cancelled successfully'
    })
  } catch (error) {
    console.error('Error in enrollments DELETE API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

