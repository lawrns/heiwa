// Public Blog Post Detail API
// Get single published post by slug

import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug, incrementViews } from '@/lib/blog/db'
// GET /api/blog/posts/[slug] - Get single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') || 'en') as 'en' | 'fr'
    const post = await getPostBySlug(slug, locale)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    // Increment views (async, don't wait)
    incrementViews(post.id).catch(err => {
      console.error('Failed to increment views:', err)
    })
    // Return formatted post data
    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        slug: post.translation.slug_localized,
        title: post.translation.title,
        excerpt: post.translation.excerpt,
        body_rich: post.translation.body_rich,
        cover_image_url: post.translation.cover_image_url,
        cover_alt_text: post.translation.cover_alt_text,
        seo_title: post.translation.seo_title,
        seo_description: post.translation.seo_description,
        canonical_url: post.translation.canonical_url,
        noindex: post.translation.noindex,
        faq_json: post.translation.faq_json,
        category: post.category,
        author: post.author,
        tags: post.tags,
        featured: post.featured,
        views: post.views,
        reading_minutes: post.reading_minutes,
        published_at: post.published_at,
        created_at: post.created_at,
        locale: post.translation.locale
      }
    })
  } catch (error: unknown) {
    console.error('Error fetching blog post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
