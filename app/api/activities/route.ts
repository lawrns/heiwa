import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Activity {
  id: string
  title: string
  description?: string
  image_url?: string
  display_order?: number
  active?: boolean
  category?: string
  availability_tier?: string
  created_at?: string
  updated_at?: string
}

// GET all activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tier = searchParams.get('tier')
    const active = searchParams.get('active') !== 'false' // Default to true

    let query = supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('active', active)
      .order('display_order', { ascending: true })
      .order('title', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (tier) {
      query = query.eq('availability_tier', tier)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Transform data to match UI expectations (image_url -> image)
    const transformedData = (data || []).map((activity: Activity) => ({
      ...activity,
      image: activity.image_url, // Map image_url to image for UI compatibility
      // Keep original image_url for backward compatibility
    }))

    return NextResponse.json({
      success: true,
      data: transformedData
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { title, category } = body
    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Validate availability_tier if provided
    const availabilityTier = body.availability_tier || 'always'
    if (!['always', 'on-request'].includes(availabilityTier)) {
      return NextResponse.json(
        { success: false, error: 'availability_tier must be "always" or "on-request"' },
        { status: 400 }
      )
    }

    // Build activity data with only valid fields for the experiences table
    const activityData: Record<string, unknown> = {
      title: body.title,
      description: body.description || null,
      image_url: body.image_url || null,
      category: body.category,
      icon: body.icon || null,
      availability_tier: availabilityTier,
      display_order: typeof body.display_order === 'number' ? body.display_order : 0,
      active: body.active !== false,
      hero_video_url: body.hero_video_url || null,
      hero_image_url: body.hero_image_url || null,
      features: Array.isArray(body.features) ? body.features : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('experiences')
      .insert(activityData)
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      // Provide more specific error messages
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'An activity with this title already exists' },
          { status: 409 }
        )
      }
      if (error.code === '23514') {
        return NextResponse.json(
          { success: false, error: `Validation error: ${error.message}` },
          { status: 400 }
        )
      }
      if (error.code === '42501' || error.message?.includes('RLS') || error.message?.includes('policy')) {
        return NextResponse.json(
          { success: false, error: 'Permission denied. Please check server configuration.' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
