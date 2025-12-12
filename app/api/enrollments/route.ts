import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET enrollments for a surf camp
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const surfCampId = searchParams.get('surf_camp_id')

    if (!surfCampId) {
      return NextResponse.json(
        { success: false, error: 'surf_camp_id is required' },
        { status: 400 }
      )
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select(`
        id,
        client_id,
        status,
        skill_level,
        dietary_restrictions,
        emergency_contact,
        notes,
        enrolled_at,
        participant_name,
        participant_email,
        participant_phone,
        payment_status,
        total_amount,
        clients:client_id (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('surf_camp_id', surfCampId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      console.error('Error fetching enrollments:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch enrollments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        enrollments: enrollments || [],
      },
    })
  } catch (error) {
    console.error('Error in enrollments GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
      skill_level,
      dietary_restrictions,
      emergency_contact,
      notes,
      status = 'pending'
    } = body

    if (!surf_camp_id || !client_id) {
      return NextResponse.json(
        { success: false, error: 'surf_camp_id and client_id are required' },
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
        { success: false, error: 'Client is already enrolled in this surf camp' },
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
        { success: false, error: 'Surf camp not found' },
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
        { success: false, error: 'Surf camp is full' },
        { status: 400 }
      )
    }

    // Get client info for participant fields
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('name, email, phone')
      .eq('id', client_id)
      .single()

    // Create enrollment
    const { data: enrollment, error: insertError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .insert({
        surf_camp_id,
        client_id,
        status,
        skill_level,
        dietary_restrictions,
        emergency_contact,
        notes,
        participant_name: clientData?.name || '',
        participant_email: clientData?.email || '',
        participant_phone: clientData?.phone || ''
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating enrollment:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create enrollment' },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          enrollment,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in enrollments POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
        { success: false, error: 'enrollment id is required' },
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
        { success: false, error: 'Failed to update enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        enrollment,
      },
    })
  } catch (error) {
    console.error('Error in enrollments PUT API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
        { success: false, error: 'enrollment id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      console.error('Error cancelling enrollment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Enrollment cancelled successfully',
      },
    })
  } catch (error) {
    console.error('Error in enrollments DELETE API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

