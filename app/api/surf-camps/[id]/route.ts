import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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

// PUT /api/surf-camps/[id] - Update a specific surf camp
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      description, 
      start_date, 
      end_date, 
      max_participants, 
      price, 
      level, 
      includes, 
      images, 
      is_active 
    } = body

    // Validate required fields
    if (!name || !start_date || !end_date || !max_participants || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updateData = {
      name,
      description: description || '',
      start_date,
      end_date,
      max_participants,
      price,
      level: level || 'All Levels',
      includes: includes || [],
      images: images || [],
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('surf_camps')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating surf camp:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update surf camp' },
        { status: 500 }
      )
    }

    // Revalidate surf camp pages to reflect changes immediately
    revalidatePath('/surf-weeks')
    revalidatePath(`/surf-weeks/${id}`)
    revalidatePath('/admin/surf-camps')
    revalidatePath('/')  // Homepage may show surf camps

    return NextResponse.json({
      success: true,
      data: { surf_camp: data }
    })
  } catch (error) {
    console.error('Error updating surf camp:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/surf-camps/[id] - Delete a specific surf camp
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('surf_camps')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting surf camp:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete surf camp' },
        { status: 500 }
      )
    }

    // Revalidate surf camp pages
    revalidatePath('/surf-weeks')
    revalidatePath('/admin/surf-camps')
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: 'Surf camp deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting surf camp:', error)
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

