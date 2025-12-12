import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

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
      query = query.eq('section', sectionType) // Use old schema column name
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
    const authError = requireAdminAuth(request)
    if (authError) return authError

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
    if (!page_slug || !section_type || content === undefined || content === null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: page_slug, section_type, content' },
        { status: 400 }
      )
    }

    // Validate page_slug
    const validPages = ['flow', 'play', 'surf', 'surf-weeks', 'the-spot', 'about', 'contact']
    if (!validPages.includes(page_slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid page_slug' },
        { status: 400 }
      )
    }

    // Validate section_type - must match database CHECK constraint
    const validSectionTypes = ['hero', 'intro', 'faq']
    if (!validSectionTypes.includes(section_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid section_type. Must be one of: ${validSectionTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if section already exists for this page
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('page_content')
      .select('id')
      .eq('page_slug', page_slug)
      .eq('section', section_type)
      .single()

    let data, error

    if (existing && !checkError) {
      // Update existing section
      const result = await supabaseAdmin
        .from('page_content')
        .update({
          section_type, // New schema column
          title: section_name || `${section_type} section`, // Old schema column
          section_name: section_name || `${section_type} section`, // New schema column
          content: typeof content === 'object' ? content : { text: content }, // New schema - JSONB
          json_content: typeof content === 'object' ? content : {}, // Old schema - JSONB
          order_index: order_index || 0,
          is_active,
          updated_by: created_by,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', existing.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Insert new section
      const result = await supabaseAdmin
        .from('page_content')
        .insert({
          page_slug,
          section: section_type, // Old schema column
          section_type, // New schema column
          title: section_name || `${section_type} section`, // Old schema column
          section_name: section_name || `${section_type} section`, // New schema column
          content: typeof content === 'object' ? content : { text: content }, // New schema - JSONB
          json_content: typeof content === 'object' ? content : {}, // Old schema - JSONB
          order_index: order_index || 0,
          is_active,
          created_by,
          updated_by: created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

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
