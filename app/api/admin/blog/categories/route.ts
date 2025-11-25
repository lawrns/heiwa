// Admin Blog Categories API
// CRUD operations for blog categories

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/blog/categories - List all categories
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
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
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, name, description, is_active = true } = body

    if (!slug || !name) {
      return NextResponse.json(
        { success: false, error: 'Slug and name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .insert({
        slug,
        name,
        description,
        is_active
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
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

