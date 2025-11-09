import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    const transformedData = (data || []).map((activity: any) => ({
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
    const { display_order: _displayOrder, ...rest } = body

    // Validate required fields
    const { title, category, availability_tier = 'always' } = rest
    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      )
    }

    const activityData = {
      ...rest,
      active: body.active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('experiences')
      .insert(activityData)
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create activity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
