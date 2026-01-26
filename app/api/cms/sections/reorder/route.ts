// Sections Reorder API
// Bulk update order_index for multiple sections

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

interface ReorderItem {
  id: string
  order_index: number
}

// PUT /api/cms/sections/reorder - Reorder multiple sections (requires admin auth)
export async function PUT(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { sections } = body as { sections: ReorderItem[] }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'sections array is required' },
        { status: 400 }
      )
    }

    // Validate each item has id and order_index
    for (const item of sections) {
      if (!item.id || typeof item.order_index !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each section must have id and order_index' },
          { status: 400 }
        )
      }
    }

    // Update each section's order_index
    // Using Promise.all for parallel updates
    const updates = sections.map(item =>
      supabase
        .from('page_sections')
        .update({ order_index: item.order_index })
        .eq('id', item.id)
    )

    const results = await Promise.all(updates)

    // Check for any errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Errors during reorder:', errors.map(e => e.error))
      return NextResponse.json(
        { success: false, error: 'Some sections failed to update', details: errors.map(e => e.error?.message) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully reordered ${sections.length} sections`
    })
  } catch (error) {
    console.error('Sections reorder error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
