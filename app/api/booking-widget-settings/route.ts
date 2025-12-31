import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public endpoint for widget to fetch active price settings
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('booking_widget_settings')
      .select('experience_type, price_from')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching booking widget settings:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Transform to object format for easier consumption
    const settings = {
      room: 45, // fallback
      surfWeek: 599 // fallback
    }

    if (data && data.length > 0) {
      data.forEach((setting: { experience_type: string; price_from: number }) => {
        if (setting.experience_type === 'room') {
          settings.room = setting.price_from
        } else if (setting.experience_type === 'surf-week') {
          settings.surfWeek = setting.price_from
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: settings
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error in GET booking widget settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        data: {
          room: 45,
          surfWeek: 599
        }
      },
      { status: 500 }
    )
  }
}

