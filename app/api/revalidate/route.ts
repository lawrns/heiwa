// Unified Revalidation API
// Allows CMS to trigger cache invalidation for any path or tag

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// Common paths that should be revalidated together
const PATH_GROUPS = {
  homepage: ['/', '/admin/homepage'],
  rooms: ['/rooms', '/admin/rooms', '/'],
  'surf-weeks': ['/surf-weeks', '/admin/surf-camps', '/'],
  blog: ['/blog', '/admin/blog/posts'],
  all: ['/', '/rooms', '/surf-weeks', '/blog', '/admin/homepage', '/admin/rooms', '/admin/surf-camps', '/admin/blog/posts']
}

// POST /api/revalidate - Trigger cache revalidation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paths, tags, group, slug } = body

    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []

    // Revalidate by group (e.g., "homepage", "rooms", "surf-weeks", "blog", "all")
    if (group && PATH_GROUPS[group as keyof typeof PATH_GROUPS]) {
      const groupPaths = PATH_GROUPS[group as keyof typeof PATH_GROUPS]
      for (const path of groupPaths) {
        revalidatePath(path)
        revalidatedPaths.push(path)
      }
    }

    // Revalidate specific paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        if (typeof path === 'string' && path.startsWith('/')) {
          revalidatePath(path)
          revalidatedPaths.push(path)
        }
      }
    }

    // Revalidate specific slug (useful for blog posts, rooms, etc.)
    if (slug && typeof slug === 'string') {
      // Revalidate common patterns for the slug
      const slugPaths = [
        `/blog/${slug}`,
        `/rooms/${slug}`,
        `/surf-weeks/${slug}`,
        `/${slug}`
      ]
      for (const path of slugPaths) {
        revalidatePath(path)
        revalidatedPaths.push(path)
      }
    }

    // Revalidate by tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag === 'string') {
          revalidateTag(tag)
          revalidatedTags.push(tag)
        }
      }
    }

    console.log('🔄 Revalidation triggered:', {
      paths: revalidatedPaths,
      tags: revalidatedTags,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error during revalidation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Revalidation failed'
      },
      { status: 500 }
    )
  }
}

// GET /api/revalidate - Health check and documentation
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Revalidation API is available',
    usage: {
      method: 'POST',
      body: {
        group: 'Optional: "homepage" | "rooms" | "surf-weeks" | "blog" | "all"',
        paths: 'Optional: Array of paths to revalidate (e.g., ["/", "/rooms"])',
        slug: 'Optional: Slug to revalidate across all content types',
        tags: 'Optional: Array of cache tags to revalidate'
      },
      examples: [
        { group: 'homepage' },
        { paths: ['/', '/rooms', '/surf-weeks'] },
        { slug: 'my-blog-post' },
        { group: 'all' }
      ]
    }
  })
}
