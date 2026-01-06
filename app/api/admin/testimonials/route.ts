import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface TestimonialDB {
  id: string
  author_name?: string
  guest_name?: string
  author_email?: string
  guest_email?: string
  author_image?: string
  guest_image_url?: string
  image_url?: string
  content?: string
  text?: string
  rating?: number
  is_featured?: boolean
  is_active?: boolean
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

interface TestimonialCreateData {
  author_name: string
  author_email?: string | null
  image_url?: string | null
  author_image?: string | null
  rating: number
  text: string
  content: string
  is_featured: boolean
  is_active: boolean
  created_by?: string
  updated_by?: string
}

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

    // Transform database fields to frontend format
    // Database uses author_name, frontend expects guest_name
    const transformedData = (data || []).map((testimonial: TestimonialDB) => ({
      ...testimonial,
      guest_name: testimonial.author_name || testimonial.guest_name || 'Unknown',
      guest_email: testimonial.author_email || testimonial.guest_email || '',
      guest_image_url: testimonial.author_image || testimonial.guest_image_url || null
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

    // Map frontend fields to database fields
    // Frontend uses guest_name, database uses author_name
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert({
        author_name: guest_name,
        author_email: guest_email || null,
        image_url: guest_image_url || null, // Legacy column
        author_image: guest_image_url || null, // New column
        rating,
        text: text, // Legacy column
        content: text, // New column
        is_featured: is_featured || false,
        is_active: true,
        created_by,
        updated_by: created_by
      } as TestimonialCreateData)
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
