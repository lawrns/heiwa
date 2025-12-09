// Page Sections API
// GET all sections for a page, POST to create new section

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface PageSection {
  id: string
  page_slug: string
  section_type: string
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET /api/cms/pages/[slug]/sections - Get all sections for a page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    let query = supabase
      .from('page_sections')
      .select('*')
      .eq('page_slug', slug)
      .order('order_index', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching page sections:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sections', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Page sections GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cms/pages/[slug]/sections - Create new section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    const { section_type, content, order_index, is_active = true } = body

    if (!section_type) {
      return NextResponse.json(
        { success: false, error: 'section_type is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { success: false, error: 'content must be a valid object' },
        { status: 400 }
      )
    }

    // If no order_index provided, put at end
    let finalOrderIndex = order_index
    if (typeof finalOrderIndex !== 'number') {
      const { data: existingSections } = await supabase
        .from('page_sections')
        .select('order_index')
        .eq('page_slug', slug)
        .order('order_index', { ascending: false })
        .limit(1)

      finalOrderIndex = existingSections && existingSections.length > 0
        ? existingSections[0].order_index + 1
        : 0
    }

    const { data, error } = await supabase
      .from('page_sections')
      .insert([{
        page_slug: slug,
        section_type,
        content,
        order_index: finalOrderIndex,
        is_active
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating section:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create section', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Section created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Page sections POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
