import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('page_content')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching page content:', error)
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
  try {
    const body = await request.json()
    const {
      page_slug,
      section_type,
      section_name,
      content,
      order_index,
      is_active,
      updated_by
    } = body

    // Validate page_slug if provided
    if (page_slug) {
      const validPages = ['flow', 'play', 'surf', 'the-spot', 'about', 'contact']
      if (!validPages.includes(page_slug)) {
        return NextResponse.json(
          { success: false, error: 'Invalid page_slug' },
          { status: 400 }
        )
      }
    }

    // Validate section_type if provided
    if (section_type) {
      const validSectionTypes = ['hero', 'intro', 'features', 'gallery', 'pricing', 'text', 'image_text', 'video', 'custom']
      if (!validSectionTypes.includes(section_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid section_type' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('page_content')
      .update({
        page_slug,
        section_type,
        section_name,
        content,
        order_index,
        is_active,
        updated_by,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating page content:', error)
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
    const { id } = await params
  try {
    const { error } = await supabaseAdmin
      .from('page_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting page content:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Page content deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
