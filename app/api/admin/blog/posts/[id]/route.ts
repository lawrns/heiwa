// Admin Blog Post Detail API
// Get, update, delete individual posts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPostById, updatePost, deletePost } from '@/lib/blog/db'

// GET /api/admin/blog/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blog/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      category_id,
      author_id,
      status,
      featured,
      scheduled_at,
      published_at,
      translations,
      tag_ids
    } = body

    const post = await updatePost(id, {
      category_id,
      author_id,
      status,
      featured,
      scheduled_at,
      published_at,
      translations,
      tag_ids
    })

    // Revalidate blog pages to reflect changes immediately
    revalidatePath('/blog')
    revalidatePath('/admin/blog/posts')
    // Revalidate specific post slugs if translations provided
    if (translations && Array.isArray(translations)) {
      translations.forEach((trans: { slug_localized?: string }) => {
        if (trans.slug_localized) {
          revalidatePath(`/blog/${trans.slug_localized}`)
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deletePost(id)

    // Revalidate blog pages to reflect deletion immediately
    revalidatePath('/blog')
    revalidatePath('/admin/blog/posts')

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

