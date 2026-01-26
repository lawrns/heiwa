import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET_NAME = 'media-library'

// DELETE /api/media/[id] - Delete a specific media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    // The id is the filename in Supabase storage
    const filename = decodeURIComponent(id)

    const { error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .remove([filename])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error in media DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/media/[id] - Get a specific media file info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const filename = decodeURIComponent(id)

    const { data: urlData } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename)

    return NextResponse.json({
      success: true,
      data: {
        id: filename,
        name: filename,
        url: urlData.publicUrl
      }
    })
  } catch (error) {
    console.error('Error in media GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
