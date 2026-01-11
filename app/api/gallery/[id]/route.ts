import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching media item:', error)
      return NextResponse.json(
        { success: false, error: 'Media item not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const galleryItem = {
      id: mediaItem.id,
      title: mediaItem.original_name || mediaItem.filename,
      type: mediaItem.file_type === 'video' ? 'video' : 'image',
      url: mediaItem.url,
      thumbnailUrl: mediaItem.thumbnail_url || mediaItem.url,
      category: mediaItem.category || 'general',
      tags: mediaItem.description ? mediaItem.description.split(',').map((t: string) => t.trim()) : [],
      isActive: mediaItem.is_public !== false,
      uploadedAt: mediaItem.created_at,
      fileSize: mediaItem.file_size || 0,
      alt_text: mediaItem.alt_text,
      description: mediaItem.description,
    }

    return NextResponse.json({
      success: true,
      galleryItem,
    })
  } catch (error) {
    console.error('Error in gallery item GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: {
      updated_at: string
      original_name?: string
      category?: string
      url?: string
      thumbnail_url?: string
      alt_text?: string
      description?: string
      is_public?: boolean
    } = {
      updated_at: new Date().toISOString(),
    }

    if (body.title) updateData.original_name = body.title
    if (body.category) updateData.category = body.category
    if (body.url) updateData.url = body.url
    if (body.thumbnailUrl) updateData.thumbnail_url = body.thumbnailUrl
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text
    if (body.description !== undefined) updateData.description = body.description
    if (body.isActive !== undefined) updateData.is_public = body.isActive
    if (body.tags) updateData.description = body.tags.join(', ')

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media_library')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating media item:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update media item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mediaItem,
    })
  } catch (error) {
    console.error('Error in gallery item PUT API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('media_library')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting media item:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete media item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Media item deleted successfully',
    })
  } catch (error) {
    console.error('Error in gallery item DELETE API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

