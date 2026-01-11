import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

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
  try {
    const { id } = await params
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

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

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (page_slug !== undefined) updateData.page_slug = page_slug
    if (section_type !== undefined) {
      updateData.section = section_type // Old schema column
      updateData.section_type = section_type // New schema column
    }
    if (section_name !== undefined) {
      updateData.title = section_name // Old schema column
      updateData.section_name = section_name // New schema column
    }
    if (content !== undefined) {
      updateData.content = typeof content === 'object' ? content : { text: content } // New schema - JSONB
      updateData.json_content = typeof content === 'object' ? content : {} // Old schema - JSONB
    }
    if (order_index !== undefined) updateData.order_index = order_index
    if (is_active !== undefined) updateData.is_active = is_active
    if (updated_by !== undefined) updateData.updated_by = updated_by

    const { data, error } = await supabaseAdmin
      .from('page_content')
      .update(updateData)
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
  try {
    const { id } = await params
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

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
