// Admin Blog Post Detail API
// Get, update, delete individual posts

import { NextRequest, NextResponse } from 'next/server'
import { getPostById, updatePost, deletePost } from '@/lib/blog/db'

// GET /api/admin/blog/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await getPostById(params.id)

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
  } catch (error: any) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blog/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const post = await updatePost(params.id, {
      category_id,
      author_id,
      status,
      featured,
      scheduled_at,
      published_at,
      translations,
      tag_ids
    })

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blog/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletePost(params.id)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

