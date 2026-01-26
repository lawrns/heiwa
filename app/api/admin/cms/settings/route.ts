import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET CMS settings
export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const { data: settings, error } = await supabaseAdmin
      .from('cms_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
      console.error('Error fetching CMS settings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Return default settings if none found
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          site_name: 'Heiwa House',
          site_description: 'A Wave Away | Surf & Adventure Retreat',
          default_language: 'en',
          enable_cache: true,
          cache_duration: 3600,
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
          site_name: settings.site_name,
          site_description: settings.site_description,
          default_language: settings.default_language,
          enable_cache: settings.enable_cache,
          cache_duration: settings.cache_duration,
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in CMS settings GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST update CMS settings
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { site_name, site_description, default_language, enable_cache, cache_duration } = body

    // Upsert settings (assuming single row with id=1 or similar constraint, but usually single row table pattern)
    // For simplicity we'll assume there's a table `cms_settings` with a unique constraint or we just always update the first row.
    // Better approach: use a fixed ID like 1.

    const { data, error } = await supabaseAdmin
      .from('cms_settings')
      .upsert({
        id: 1, // Enforce single row
        site_name,
        site_description,
        default_language,
        enable_cache,
        cache_duration,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error updating CMS settings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in CMS settings POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}

