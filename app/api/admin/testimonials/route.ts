import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const page = searchParams.get('page')

    let query = supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (page) {
      const limitNum = parseInt(limit || '10')
      const offset = (parseInt(page) - 1) * limitNum
      query = query.range(offset, offset + limitNum - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
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
    const {
      guest_name,
      guest_email,
      rating,
      text,
      is_featured = false,
      guest_image_url,
      created_by
    } = body

    // Validation
    if (!guest_name || !rating || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: guest_name, rating, text' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert({
        guest_name,
        guest_email,
        rating,
        text,
        is_featured,
        guest_image_url,
        created_by,
        updated_by: created_by
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json(
        { success: false, error: error.message },
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
