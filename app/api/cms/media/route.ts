// Media Library API
// CRUD operations for media management with file upload

import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'
import { 
  validateCreateMediaItem, 
  validateUpdateMediaItem,
  validateMediaSearchParams,
  handleValidationError,
  MediaItem,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCodes,
  ValidationError
} from '@/lib/cms-validators'

// GET /api/cms/media - Get all media items or specific media
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('file_type')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')?.split(',')
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Validate search params
    const paramsValidation = validateMediaSearchParams({
      search: searchParams.get('search') || undefined,
      file_type: fileType as MediaItem['file_type'] || undefined,
      tags: tags || undefined,
      category: category || undefined,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc'
    })
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation)
    }

    let query = supabase
      .from('media_library')
      .select('*', { count: 'exact' })

    // Apply filters
    if (fileType) {
      query = query.eq('file_type', fileType)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching media items:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch media items',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<MediaItem> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Media items GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/cms/media - Upload new media item
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('alt_text') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'File is required' 
        },
        { status: 400 }
      )
    }

    // Determine file type
    let fileType: MediaItem['file_type']
    if (file.type.startsWith('image/')) {
      fileType = 'image'
    } else if (file.type.startsWith('video/')) {
      fileType = 'video'
    } else {
      fileType = 'document'
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}_${randomString}.${fileExtension}`
    const supabasePath = `cms-media/${filename}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('cms-media')
      .upload(supabasePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.UPLOAD_ERROR,
          message: 'Failed to upload file',
          details: uploadError.message 
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('cms-media')
      .getPublicUrl(supabasePath)

    // Create media item record
    const mediaItemData = {
      filename,
      original_name: file.name,
      file_type: fileType,
      file_size: file.size,
      supabase_path: supabasePath,
      public_url: publicUrl,
      alt_text: altText || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'general',
      is_active: true,
      order_index: 0
    }

    // Validate request data
    const validation = validateCreateMediaItem(mediaItemData)
    if (!validation.success) {
      // Clean up uploaded file if validation fails
      await supabaseAdmin.storage.from('cms-media').remove([supabasePath])
      handleValidationError(validation)
    }

    const { data, error } = await supabaseAdmin
      .from('media_library')
      .insert([validation.data!])
      .select()
      .single()

    if (error) {
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage.from('cms-media').remove([supabasePath])
      console.error('Error creating media item:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to create media item',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<MediaItem> = {
      data,
      message: 'Media item uploaded successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Media items POST error:', error)
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: error.message,
          details: (error as ValidationError).details 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/cms/media - Update media item
export async function PUT(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'ID is required for updates' 
        },
        { status: 400 }
      )
    }

    // Validate request body
    const validation = validateUpdateMediaItem(updateData)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabaseAdmin
      .from('media_library')
      .update(validation.data!)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.NOT_FOUND,
            message: 'Media item not found' 
          },
          { status: 404 }
        )
      }
      console.error('Error updating media item:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to update media item',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<MediaItem> = {
      data,
      message: 'Media item updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Media items PUT error:', error)
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: error.message,
          details: (error as ValidationError).details 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/cms/media - Delete media item
export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'ID is required for deletion' 
        },
        { status: 400 }
      )
    }

    // Get media item to delete file from storage
    const { data: mediaItem, error: fetchError } = await supabaseAdmin
      .from('media_library')
      .select('supabase_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching media item for deletion:', fetchError)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch media item',
          details: fetchError.message 
        },
        { status: 500 }
      )
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from('media_library')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting media item:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to delete media item',
          details: error.message 
        },
        { status: 500 }
      )
    }

    // Delete file from storage
    if ((mediaItem as { supabase_path?: string })?.supabase_path) {
      const { error: deleteError } = await supabaseAdmin.storage
        .from('cms-media')
        .remove([(mediaItem as { supabase_path?: string }).supabase_path!])

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError)
        // Don't return error here since database deletion succeeded
        // Log the error for manual cleanup
      }
    }

    return NextResponse.json(
      { 
        message: 'Media item deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Media items DELETE error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
