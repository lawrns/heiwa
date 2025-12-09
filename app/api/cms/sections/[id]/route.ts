// Section API
// GET, PUT, DELETE operations for individual sections

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/cms/sections/[id] - Get a specific section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching section:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch section', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Section GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/cms/sections/[id] - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { content, section_type, order_index, is_active } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (content !== undefined) updateData.content = content
    if (section_type !== undefined) updateData.section_type = section_type
    if (order_index !== undefined) updateData.order_index = order_index
    if (is_active !== undefined) updateData.is_active = is_active

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('page_sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        )
      }
      console.error('Error updating section:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update section', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Section updated successfully'
    })
  } catch (error) {
    console.error('Section PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/cms/sections/[id] - Soft delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    if (hardDelete) {
      // Hard delete - actually remove from database
      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting section:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to delete section', details: error.message },
          { status: 500 }
        )
      }
    } else {
      // Soft delete - just mark as inactive
      const { error } = await supabase
        .from('page_sections')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        console.error('Error deactivating section:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to deactivate section', details: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Section deleted permanently' : 'Section deactivated successfully'
    })
  } catch (error) {
    console.error('Section DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
