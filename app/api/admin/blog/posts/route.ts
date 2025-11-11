// Admin Blog Posts API
// CRUD operations for blog posts management

import { NextRequest, NextResponse } from 'next/server'
import { getPosts, createPost } from '@/lib/blog/db'

// GET /api/admin/blog/posts - List all posts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.get('status') as 'draft' | 'scheduled' | 'published' | undefined,
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      locale: searchParams.get('locale') as 'en' | 'fr' | undefined,
      author: searchParams.get('author') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    const { data, count } = await getPosts(filters)

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count,
        totalPages: Math.ceil(count / filters.limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      category_id,
      author_id,
      status = 'draft',
      featured = false,
      scheduled_at,
      translations,
      tag_ids = []
    } = body

    // Validation
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one translation is required' },
        { status: 400 }
      )
    }

    // Validate each translation
    for (const trans of translations) {
      if (!trans.locale || !['en', 'fr'].includes(trans.locale)) {
        return NextResponse.json(
          { success: false, error: 'Invalid locale. Must be "en" or "fr"' },
          { status: 400 }
        )
      }
      if (!trans.slug_localized || !trans.title) {
        return NextResponse.json(
          { success: false, error: 'Translation must have slug_localized and title' },
          { status: 400 }
        )
      }
    }

    const post = await createPost({
      category_id,
      author_id,
      status,
      featured,
      scheduled_at,
      translations,
      tag_ids
    })

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

