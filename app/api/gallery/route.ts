import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all gallery/media items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const isActive = searchParams.get('is_active')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Filter by type (image/video)
    if (type) {
      query = query.eq('file_type', type)
    }

    // Filter by active status
    if (isActive !== null) {
      query = query.eq('is_public', isActive === 'true')
    }

    const { data: mediaItems, error } = await query

    if (error) {
      console.error('Error fetching gallery items:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch gallery items' },
        { status: 500 }
      )
    }

    // Apply search filter if provided
    let filteredItems = mediaItems || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredItems = filteredItems.filter(
        (item: any) =>
          item.filename?.toLowerCase().includes(searchLower) ||
          item.original_name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.alt_text?.toLowerCase().includes(searchLower)
      )
    }

    // Transform to match expected format
    const galleryItems = filteredItems.map((item: any) => ({
      id: item.id,
      title: item.original_name || item.filename,
      type: item.file_type === 'video' ? 'video' : 'image',
      url: item.url,
      thumbnailUrl: item.thumbnail_url || item.url,
      category: item.category || 'general',
      tags: item.description ? item.description.split(',').map((t: string) => t.trim()) : [],
      isActive: item.is_public !== false,
      uploadedAt: item.created_at,
      fileSize: item.file_size || 0,
      dimensions: item.description?.includes('dimensions') ? undefined : undefined, // Could parse from description if needed
      alt_text: item.alt_text,
      description: item.description,
    }))

    return NextResponse.json({
      success: true,
      galleryItems,
    })
  } catch (error) {
    console.error('Error in gallery GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Upload new media item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, original_name, file_type, file_size, category, url, thumbnail_url, alt_text, description, is_public } = body

    if (!filename || !url || !file_type) {
      return NextResponse.json(
        { success: false, error: 'Filename, URL, and file type are required' },
        { status: 400 }
      )
    }

    const { data: mediaItem, error } = await supabaseAdmin
      .from('media_library')
      .insert([
        {
          filename,
          original_name: original_name || filename,
          file_type,
          file_size: file_size || 0,
          category: category || 'general',
          url,
          thumbnail_url: thumbnail_url || url,
          alt_text: alt_text || '',
          description: description || '',
          is_public: is_public !== false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating media item:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create media item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mediaItem,
    })
  } catch (error) {
    console.error('Error in gallery POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

