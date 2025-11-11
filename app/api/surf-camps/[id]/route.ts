import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get surf camp details
    const { data: surfCamp, error: surfCampError } = await supabaseAdmin
      .from('surf_camps')
      .select('*')
      .eq('id', id)
      .single()

    if (surfCampError || !surfCamp) {
      console.error('Error fetching surf camp:', surfCampError)
      return NextResponse.json(
        { success: false, error: 'Surf camp not found' },
        { status: 404 }
      )
    }

    // Get enrollment count
    const { count: enrolledCount } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('surf_camp_id', id)
      .eq('status', 'confirmed')

    const confirmedBooked = enrolledCount || 0
    const availableSpots = surfCamp.max_participants - confirmedBooked

    return NextResponse.json({
      success: true,
      data: {
        surf_camp: {
          id: surfCamp.id,
          name: surfCamp.name,
          description: surfCamp.description,
          start_date: surfCamp.start_date,
          end_date: surfCamp.end_date,
          price: surfCamp.price,
          max_participants: surfCamp.max_participants,
          confirmed_booked: confirmedBooked,
          available_spots: Math.max(0, availableSpots),
          is_full: availableSpots <= 0,
          level: surfCamp.level,
          category: surfCamp.category,
          images: surfCamp.images || [],
          includes: surfCamp.includes || [],
          is_active: surfCamp.is_active,
          location: surfCamp.location || null,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching surf camp:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

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

