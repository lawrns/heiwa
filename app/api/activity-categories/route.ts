import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      // Log error for debugging but return empty array for graceful degradation
      // This handles: missing table, RLS policies, connection issues, etc.
      console.warn('Error fetching activity categories (returning empty):', error.code, error.message)
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    // Return empty array for graceful degradation
    return NextResponse.json({
      success: true,
      data: []
    })
  }
}
