import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET page metadata by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data, error } = await supabaseAdmin
      .from('pages_meta')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      // If page doesn't exist, return default values
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: {
            slug,
            title: slug.charAt(0).toUpperCase() + slug.slice(1),
            meta_description: '',
            meta_keywords: '',
            og_image: '',
            is_published: false
          }
        })
      }
      console.error('Error fetching page meta:', error)
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

// PUT update page metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError
    const body = await request.json()
    const { title, meta_description, meta_keywords, og_image, is_published } = body

    // Check if page meta exists
    const { data: existing } = await supabaseAdmin
      .from('pages_meta')
      .select('id')
      .eq('slug', slug)
      .single()

    let data, error

    if (existing) {
      // Update existing record
      const result = await supabaseAdmin
        .from('pages_meta')
        .update({
          title,
          meta_description,
          meta_keywords,
          og_image,
          is_published,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Insert new record
      const result = await supabaseAdmin
        .from('pages_meta')
        .insert({
          slug,
          title,
          meta_description,
          meta_keywords,
          og_image,
          is_published: is_published ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Error updating page meta:', error)
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
