import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { FAQ_PAGE_SLUGS } from '@/lib/page-slugs'
import { requireAdminAuth } from '@/lib/admin-auth'

interface FAQUpdateData {
  question?: string
  answer?: string
  category?: string
  page_slug?: string
  order_index?: number
  is_active?: boolean
  updated_by?: string
  updated_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('faq_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching FAQ item:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const {
      question,
      answer,
      category,
      page_slug,
      order_index,
      is_active,
      updated_by
    } = body

    // Validate category if provided
    if (category) {
      const validCategories = ['general', 'booking', 'surfing', 'accommodation', 'activities', 'policies', 'location']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // Validate page_slug if provided
    if (page_slug) {
      if (!FAQ_PAGE_SLUGS.includes(page_slug)) {
        return NextResponse.json(
          { success: false, error: `Invalid page_slug. Must be one of: ${FAQ_PAGE_SLUGS.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('faq_items')
      .update({
        question,
        answer,
        category,
        page_slug,
        order_index,
        is_active,
        updated_by,
        updated_at: new Date().toISOString()
      } as FAQUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating FAQ item:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('faq_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting FAQ item:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ item deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
