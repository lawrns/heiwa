import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/cms/sections?page={slug} - Get all sections for a page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get('page')

    if (!pageSlug) {
      return NextResponse.json(
        { error: 'page parameter is required' },
        { status: 400 }
      )
    }

    const { data: sections, error } = await supabaseAdmin
      .from('page_sections')
      .select('*')
      .eq('page_slug', pageSlug)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching sections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sections: sections || [] })
  } catch (error) {
    console.error('Sections API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cms/sections - Create a new section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_slug, section_type, content, order_index = 0 } = body

    if (!page_slug || !section_type) {
      return NextResponse.json(
        { error: 'page_slug and section_type are required' },
        { status: 400 }
      )
    }

    const { data: section, error } = await supabaseAdmin
      .from('page_sections')
      .insert({
        page_slug,
        section_type,
        content: content || {},
        order_index,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating section:', error)
      return NextResponse.json(
        { error: 'Failed to create section' },
        { status: 500 }
      )
    }

    return NextResponse.json({ section })
  } catch (error) {
    console.error('Sections API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
