import { NextRequest, NextResponse } from 'next/server'
import { addOnsAPI } from '@/lib/supabase-admin'

// GET /api/public/add-ons - Public add-ons list for booking widget
// Returns only active add-ons and safe fields
export async function GET(_request: NextRequest) {
  try {
    const all = await addOnsAPI.getAll()
    const addOns = (all || [])
      .filter((a: any) => a?.isActive !== false)
      .map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description || '',
        price: a.price ?? 0,
        category: a.category || 'other',
        images: Array.isArray(a.images) ? a.images : [],
        maxQuantity: a.maxQuantity ?? null,
      }))

    return NextResponse.json({ addOns })
  } catch (error: any) {
    console.error('Public add-ons error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch add-ons' },
      { status: 500 }
    )
  }
}

