import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('booking_widget_settings')
      .select('*')
      .order('experience_type')

    if (error) {
      console.error('Error fetching booking widget settings:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Error in GET booking widget settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { settings } = body

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: 'Settings must be an array' },
        { status: 400 }
      )
    }

    // Validate each setting
    for (const setting of settings) {
      if (!setting.experience_type || !['room', 'surf-week'].includes(setting.experience_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid experience_type' },
          { status: 400 }
        )
      }
      if (typeof setting.price_from !== 'number' || setting.price_from < 0) {
        return NextResponse.json(
          { success: false, error: 'price_from must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Update each setting
    const updatedSettings = []
    for (const setting of settings) {
      const { data, error } = await supabaseAdmin
        .from('booking_widget_settings')
        .update({
          price_from: setting.price_from,
          is_active: setting.is_active !== undefined ? setting.is_active : true,
          updated_at: new Date().toISOString()
        })
        .eq('experience_type', setting.experience_type)
        .select()
        .single()

      if (error) {
        console.error('Error updating setting:', error)
        return NextResponse.json(
          { success: false, error: `Failed to update ${setting.experience_type}: ${error.message}` },
          { status: 500 }
        )
      }

      updatedSettings.push(data)
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings
    })
  } catch (error) {
    console.error('Error in PUT booking widget settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

