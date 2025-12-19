// Defaults API for CMS Sections
// GET: Get default content, POST: Save as default, PUT: Restore to default

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/cms/sections/[id]/defaults - Get default content for a section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First get section info to find defaults by page_slug and section_type
    const { data: section, error: sectionError } = await supabaseAdmin
      .from('page_sections')
      .select('page_slug, section_type')
      .eq('id', id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('page_section_defaults')
      .select('*')
      .eq('page_slug', section.page_slug)
      .eq('section_type', section.section_type)
      .single()

    if (error) {
      // Table might not exist or no default saved
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          defaults: null,
          message: 'Defaults not yet enabled',
        })
      }
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          defaults: null,
          message: 'No default saved for this section',
        })
      }
      console.error('Error fetching defaults:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch defaults' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      defaults: data,
    })
  } catch (error) {
    console.error('Defaults GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cms/sections/[id]/defaults - Save current content as default
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current section
    const { data: section, error: sectionError } = await supabaseAdmin
      .from('page_sections')
      .select('page_slug, section_type, content')
      .eq('id', id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      )
    }

    // Upsert the default
    const { data, error } = await supabaseAdmin
      .from('page_section_defaults')
      .upsert(
        {
          page_slug: section.page_slug,
          section_type: section.section_type,
          content: section.content,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'page_slug,section_type',
        }
      )
      .select()
      .single()

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Defaults not yet enabled. Run migration first.',
        }, { status: 400 })
      }
      console.error('Error saving defaults:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save defaults' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      defaults: data,
      message: 'Default saved successfully',
    })
  } catch (error) {
    console.error('Defaults POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/cms/sections/[id]/defaults - Restore section to default content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get section info
    const { data: section, error: sectionError } = await supabaseAdmin
      .from('page_sections')
      .select('page_slug, section_type, content')
      .eq('id', id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      )
    }

    // Get the default content
    const { data: defaults, error: defaultsError } = await supabaseAdmin
      .from('page_section_defaults')
      .select('content')
      .eq('page_slug', section.page_slug)
      .eq('section_type', section.section_type)
      .single()

    if (defaultsError || !defaults) {
      return NextResponse.json(
        { success: false, error: 'No default found for this section' },
        { status: 404 }
      )
    }

    // Save current content as version before restoring
    try {
      await supabaseAdmin
        .from('page_section_versions')
        .insert({
          section_id: id,
          content: section.content,
          created_by: 'restore_default',
        })
    } catch {
      // Version history might not be enabled, continue anyway
    }

    // Restore to default
    const { data, error } = await supabaseAdmin
      .from('page_sections')
      .update({ content: defaults.content })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error restoring defaults:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to restore defaults' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      section: data,
      message: 'Restored to default successfully',
    })
  } catch (error) {
    console.error('Defaults PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
