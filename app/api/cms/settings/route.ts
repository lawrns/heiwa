import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET /api/cms/settings - Get all settings or filter by category/key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const key = searchParams.get('key')

    let query = supabaseAdmin.from('site_settings').select('*')

    if (category) {
      query = query.eq('category', category)
    }
    if (key) {
      query = query.eq('key', key)
    }

    const { data, error } = await query.order('category').order('key')

    if (error) {
      console.error('Error fetching site settings:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform to key-value object for easy consumption
    const settings: Record<string, unknown> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })

    return NextResponse.json({ success: true, data: settings, raw: data })
  } catch (error) {
    console.error('Error in GET /api/cms/settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/cms/settings - Update a setting (requires admin auth)
export async function PUT(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { key, value, category } = body

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        {
          key,
          value,
          category: category || 'general',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating site setting:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in PUT /api/cms/settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to update setting' }, { status: 500 })
  }
}

// POST /api/cms/settings/bulk - Update multiple settings at once
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ success: false, error: 'Settings array is required' }, { status: 400 })
    }

    const updates = settings.map(s => ({
      key: s.key,
      value: s.value,
      category: s.category || 'general',
      updated_at: new Date().toISOString()
    }))

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(updates, { onConflict: 'key' })
      .select()

    if (error) {
      console.error('Error bulk updating site settings:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in POST /api/cms/settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}
