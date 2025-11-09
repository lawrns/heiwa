import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export interface HomepageSection {
  id: string
  section: string
  title: string
  subtitle?: string
  description?: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  linkText?: string
  isActive: boolean
  order: number
}

// GET - Fetch all homepage sections
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (err) {
    console.error('Error fetching homepage content:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch homepage content'
    }, { status: 500 })
  }
}

// POST - Create new homepage section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, title, subtitle, description, content, imageUrl, videoUrl, linkUrl, linkText, isActive, order } = body

    if (!section || !title) {
      return NextResponse.json({
        success: false,
        error: 'Section and title are required'
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .insert({
        section,
        title,
        subtitle,
        description,
        content,
        image_url: imageUrl,
        video_url: videoUrl,
        link_url: linkUrl,
        link_text: linkText,
        is_active: isActive ?? true,
        order_index: order ?? 0
      } as any)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  } catch (err) {
    console.error('Error creating homepage section:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to create homepage section'
    }, { status: 500 })
  }
}

// PUT - Update homepage section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, section, title, subtitle, description, content, imageUrl, videoUrl, linkUrl, linkText, isActive, order } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .update({
        section,
        title,
        subtitle,
        description,
        content,
        image_url: imageUrl,
        video_url: videoUrl,
        link_url: linkUrl,
        link_text: linkText,
        is_active: isActive,
        order_index: order,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  } catch (err) {
    console.error('Error updating homepage section:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to update homepage section'
    }, { status: 500 })
  }
}

// DELETE - Delete homepage section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('homepage_content' as any)
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    })
  } catch (err) {
    console.error('Error deleting homepage section:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete homepage section'
    }, { status: 500 })
  }
}
