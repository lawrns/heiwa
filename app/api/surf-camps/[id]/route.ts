import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Fix Supabase storage bucket URLs if needed
 * Ensures CMS images use correct bucket names
 */
function fixImageUrls(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return []
  return images.map(url => {
    if (!url || typeof url !== 'string') return url
    // Fix any old bucket name mismatches (if they exist)
    // Currently surf-camp-images bucket is correct, but this ensures future compatibility
    return url
  })
}

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

    // Get enrollment counts (confirmed + pending for availability, confirmed for legacy display)
    const { count: enrolledCount } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('surf_camp_id', id)
      .in('status', ['confirmed', 'pending'])

    const { count: confirmedCount } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('surf_camp_id', id)
      .eq('status', 'confirmed')

    const enrolledCountNum = enrolledCount || 0
    const confirmedBooked = confirmedCount || 0
    const availableSpots = surfCamp.max_participants - enrolledCountNum

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
          enrolled_count: enrolledCountNum,
          available_spots: Math.max(0, availableSpots),
          is_full: availableSpots <= 0,
          level: surfCamp.level,
          category: surfCamp.category,
          images: fixImageUrls(surfCamp.images || []), // Ensure CMS images are used correctly
          includes: surfCamp.includes || [],
          is_active: surfCamp.is_active,
          tax_category_id: (surfCamp as { tax_category_id?: string | null }).tax_category_id || null,
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
      is_active,
      tax_category_id
    } = body

    // Validate required fields
    if (!name || !start_date || !end_date || !max_participants || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates - end_date must be after start_date
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Dates must be valid ISO date strings (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, error: 'end_date must be after start_date' },
        { status: 400 }
      )
    }

    // Normalize dates to YYYY-MM-DD format
    const normalizedStartDate = startDate.toISOString().split('T')[0]
    const normalizedEndDate = endDate.toISOString().split('T')[0]

    // Normalize level field - database expects lowercase 'all' not 'All Levels'
    const normalizedLevel = level ? level.toLowerCase().replace(/\s+/g, '-') : 'all'
    const finalLevel = ['beginner', 'intermediate', 'advanced', 'all'].includes(normalizedLevel) 
      ? normalizedLevel 
      : 'all'

    const updateData = {
      name,
      description: description || '',
      start_date: normalizedStartDate,
      end_date: normalizedEndDate,
      max_participants,
      price,
      level: finalLevel,
      includes: includes || [],
      images: images || [],
      is_active: is_active !== undefined ? is_active : true,
      tax_category_id: tax_category_id || null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('surf_camps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating surf camp:', error)
      const errorMessage = error.message || 'Failed to update surf camp'
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
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

