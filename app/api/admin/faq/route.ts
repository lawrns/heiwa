import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { FAQ_PAGE_SLUGS } from '@/lib/page-slugs'

interface FAQCreateData {
  question: string
  answer: string
  category?: string
  page_slug?: string
  order_index?: number
  is_active?: boolean
  created_by?: string
  updated_by?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const page = searchParams.get('page')

    let query = supabaseAdmin
      .from('faq_items')
      .select('*')
      .order('order_index', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (page) {
      const limitNum = parseInt(limit || '10')
      const offset = (parseInt(page) - 1) * limitNum
      query = query.range(offset, offset + limitNum - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching FAQ items:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      question,
      answer,
      category,
      page_slug,
      order_index,
      is_active = true,
      created_by
    } = body

    // Validation
    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: question, answer' },
        { status: 400 }
      )
    }

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
      .insert({
        question,
        answer,
        category: category || 'general',
        page_slug: page_slug || 'general',
        order_index: order_index || 0,
        is_active,
        created_by,
        updated_by: created_by
      } as FAQCreateData)
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ item:', error)
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
