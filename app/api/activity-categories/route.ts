import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching activity categories:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch activity categories' },
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
