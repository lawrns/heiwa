import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get('page_slug')
    const sectionType = searchParams.get('section_type')

    let query = supabaseAdmin
      .from('page_content')
      .select('*')
      .order('order_index', { ascending: true })

    if (pageSlug) {
      query = query.eq('page_slug', pageSlug)
    }

    if (sectionType) {
      query = query.eq('section_type', sectionType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching page content:', error)
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
      page_slug,
      section_type,
      section_name,
      content,
      order_index,
      is_active = true,
      created_by
    } = body

    // Validation
    if (!page_slug || !section_type || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: page_slug, section_type, content' },
        { status: 400 }
      )
    }

    // Validate page_slug
    const validPages = ['flow', 'play', 'surf', 'the-spot', 'about', 'contact']
    if (!validPages.includes(page_slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid page_slug' },
        { status: 400 }
      )
    }

    // Validate section_type
    const validSectionTypes = ['hero', 'intro', 'features', 'gallery', 'pricing', 'text', 'image_text', 'video', 'custom']
    if (!validSectionTypes.includes(section_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section_type' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('page_content')
      .insert({
        page_slug,
        section_type,
        section_name,
        content,
        order_index: order_index || 0,
        is_active,
        created_by,
        updated_by: created_by
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating page content:', error)
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
