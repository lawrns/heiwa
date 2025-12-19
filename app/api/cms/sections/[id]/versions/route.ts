// Version History API for CMS Sections
// GET: List versions, POST: Create version, PUT: Restore version

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/cms/sections/[id]/versions - Get version history for a section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data, error } = await supabaseAdmin
      .from('page_section_versions')
      .select('*')
      .eq('section_id', id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          versions: [],
          message: 'Version history not yet enabled',
        })
      }
      console.error('Error fetching versions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch versions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      versions: data || [],
    })
  } catch (error) {
    console.error('Versions GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cms/sections/[id]/versions - Create a new version snapshot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current section content
    const { data: section, error: sectionError } = await supabaseAdmin
      .from('page_sections')
      .select('content')
      .eq('id', id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      )
    }

    // Create version snapshot
    const { data, error } = await supabaseAdmin
      .from('page_section_versions')
      .insert({
        section_id: id,
        content: section.content,
      })
      .select()
      .single()

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Version history not yet enabled. Run migration first.',
        }, { status: 400 })
      }
      console.error('Error creating version:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create version' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      version: data,
      message: 'Version created successfully',
    })
  } catch (error) {
    console.error('Versions POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/cms/sections/[id]/versions - Restore a specific version
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { versionId } = body

    if (!versionId) {
      return NextResponse.json(
        { success: false, error: 'versionId is required' },
        { status: 400 }
      )
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabaseAdmin
      .from('page_section_versions')
      .select('content')
      .eq('id', versionId)
      .eq('section_id', id)
      .single()

    if (versionError || !version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      )
    }

    // Save current content as a new version before restoring
    const { data: currentSection } = await supabaseAdmin
      .from('page_sections')
      .select('content')
      .eq('id', id)
      .single()

    if (currentSection) {
      await supabaseAdmin
        .from('page_section_versions')
        .insert({
          section_id: id,
          content: currentSection.content,
          created_by: 'restore_backup',
        })
    }

    // Restore the version
    const { data, error } = await supabaseAdmin
      .from('page_sections')
      .update({ content: version.content })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error restoring version:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to restore version' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      section: data,
      message: 'Version restored successfully',
    })
  } catch (error) {
    console.error('Versions PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
