import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

interface TestimonialDB {
  id: string
  author_name?: string
  guest_name?: string
  author_email?: string
  guest_email?: string
  author_image?: string
  guest_image_url?: string
  content?: string
  text?: string
  rating?: number
  is_featured?: boolean
  updated_by?: string
  updated_at?: string
}

interface TestimonialUpdateData {
  rating?: number
  is_featured?: boolean
  updated_by?: string
  updated_at: string
  author_name?: string
  author_email?: string
  author_image?: string
  content?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching testimonial:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Transform database fields to frontend format
    const dbData = data as TestimonialDB
    const transformedData = {
      ...data,
      guest_name: dbData.author_name || dbData.guest_name || 'Unknown',
      guest_email: dbData.author_email || dbData.guest_email || '',
      guest_image_url: dbData.author_image || dbData.guest_image_url || null,
      text: dbData.content || dbData.text || ''
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const {
      guest_name,
      guest_email,
      rating,
      text,
      is_featured,
      guest_image_url,
      updated_by
    } = body

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Map frontend fields to database fields
    const updateData: TestimonialUpdateData = {
      rating,
      is_featured,
      updated_by,
      updated_at: new Date().toISOString()
    }

    // Map guest_name to author_name, text to content, etc.
    if (guest_name !== undefined) updateData.author_name = guest_name
    if (guest_email !== undefined) updateData.author_email = guest_email
    if (guest_image_url !== undefined) updateData.author_image = guest_image_url
    if (text !== undefined) updateData.content = text

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating testimonial:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting testimonial:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
