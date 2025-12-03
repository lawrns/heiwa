import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const BUCKET_NAME = 'media-library'

// GET /api/media - List all media files
export async function GET() {
  try {
    // List all files in the media-library bucket
    const { data: files, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error listing media:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to list media' },
        { status: 500 }
      )
    }

    // Transform files to include full URLs
    const mediaItems = (files || [])
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file => {
        const { data: urlData } = supabaseAdmin
          .storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name)

        return {
          id: file.id || file.name,
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'image/unknown',
          created_at: file.created_at || new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      data: mediaItems
    })
  } catch (error) {
    console.error('Error in media GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${sanitizedName}`

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin
        .storage
        .from(BUCKET_NAME)
        .upload(filename, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename)

      uploadedFiles.push({
        id: filename,
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        created_at: new Date().toISOString()
      })
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload files' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })
  } catch (error) {
    console.error('Error in media POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
