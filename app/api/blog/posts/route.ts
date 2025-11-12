// Public Blog Posts API
// List published blog posts for frontend

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/blog/posts - List published posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const locale = (searchParams.get('locale') || 'en') as 'en' | 'fr'
    const featured = searchParams.get('featured') === 'true'

    // Build query for published posts
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        author:blog_authors(*),
        translations:blog_post_translations!inner(*),
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('translations.locale', locale)

    // Apply filters
    if (category) {
      query = query.eq('category_id', category)
    }

    if (featured) {
      query = query.eq('featured', true)
    }

    // Filter by tag (requires join)
    if (tag) {
      // This will be filtered in application code after fetching
    }

    // Order by published date
    query = query.order('published_at', { ascending: false })

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    // Transform data
    const posts = (data || []).map((post: any) => {
      const translation = post.translations?.find((t: any) => t.locale === locale) || post.translations?.[0]
      
      return {
        id: post.id,
        slug: translation?.slug_localized,
        title: translation?.title,
        excerpt: translation?.excerpt,
        cover_image_url: translation?.cover_image_url,
        cover_alt_text: translation?.cover_alt_text,
        category: post.category,
        author: post.author,
        tags: post.tags?.map((pt: any) => pt.tag) || [],
        featured: post.featured,
        views: post.views,
        reading_minutes: post.reading_minutes,
        published_at: post.published_at,
        created_at: post.created_at
      }
    })

    // Filter by tag if specified
    let filteredPosts = posts
    if (tag) {
      filteredPosts = posts.filter((post: any) =>
        post.tags.some((t: any) => t.id === tag || t.slug === tag)
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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

