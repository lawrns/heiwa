// CMS Stats API
// Provides statistics for the admin dashboard

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CMSErrorCodes } from '@/lib/cms-validators'

export interface CMSStats {
  homepage_sections: number
  page_content: number
  testimonials: number
  faq_items: number
  media_items: number
  cta_buttons: number
  recent_activity: Array<{
    id: string
    table_name: string
    action: string
    created_at: string
    user_id?: string
  }>
}

// GET /api/cms/stats - Get CMS statistics
export async function GET() {
  try {
    // Get counts for all tables
    const [
      { count: homepageSectionsCount },
      { count: pageContentCount },
      { count: testimonialsCount },
      { count: faqItemsCount },
      { count: mediaItemsCount },
      { count: ctaButtonsCount },
      { data: recentActivity }
    ] = await Promise.all([
      supabase.from('homepage_sections').select('*', { count: 'exact', head: true }),
      supabase.from('page_content').select('*', { count: 'exact', head: true }),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }),
      supabase.from('faq_items').select('*', { count: 'exact', head: true }),
      supabase.from('media_library').select('*', { count: 'exact', head: true }),
      supabase.from('cta_buttons').select('*', { count: 'exact', head: true }),
      supabase
        .from('activity_log')
        .select('id, table_name, action, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    const stats: CMSStats = {
      homepage_sections: homepageSectionsCount || 0,
      page_content: pageContentCount || 0,
      testimonials: testimonialsCount || 0,
      faq_items: faqItemsCount || 0,
      media_items: mediaItemsCount || 0,
      cta_buttons: ctaButtonsCount || 0,
      recent_activity: recentActivity || []
    }

    return NextResponse.json({
      data: stats,
      message: 'Stats retrieved successfully'
    })
  } catch (error) {
    console.error('CMS stats GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST, PUT, DELETE are not allowed for stats
export async function POST() {
  return NextResponse.json(
    { 
      error: CMSErrorCodes.FORBIDDEN,
      message: 'Stats endpoint is read-only' 
    },
    { status: 403 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: CMSErrorCodes.FORBIDDEN,
      message: 'Stats endpoint is read-only' 
    },
    { status: 403 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { 
      error: CMSErrorCodes.FORBIDDEN,
      message: 'Stats endpoint is read-only' 
    },
    { status: 403 }
  )
}
