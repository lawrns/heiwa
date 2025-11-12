// Admin Blog Tags API
// CRUD operations for blog tags

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/blog/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_tags')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error: any) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog/tags - Create tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, name } = body

    if (!slug || !name) {
      return NextResponse.json(
        { success: false, error: 'Slug and name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('blog_tags')
      .insert({
        slug,
        name
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

