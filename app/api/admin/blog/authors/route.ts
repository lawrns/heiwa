// Admin Blog Authors API
// CRUD operations for blog authors

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/blog/authors - List all authors
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_authors')
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
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog/authors - Create author
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      bio,
      avatar_url,
      social_links,
      is_active = true
    } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('blog_authors')
      .insert({
        name,
        email,
        bio,
        avatar_url,
        social_links: social_links || {},
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
    console.error('Error creating author:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

