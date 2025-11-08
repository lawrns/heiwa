import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('faq_items')
      .select('*')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      question,
      answer,
      category,
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

    const { data, error } = await supabaseAdmin
      .from('faq_items')
      .update({
        question,
        answer,
        category,
        order_index,
        is_active,
        updated_by,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('faq_items')
      .delete()
      .eq('id', params.id)

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
