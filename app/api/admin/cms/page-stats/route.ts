import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const adminAuth = request.cookies.get('admin_auth')?.value
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'

    if (!adminAuth || adminAuth !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch page_content stats
    const { data: pageData, error: pageError } = await supabaseAdmin
      .from('page_content')
      .select('page_slug, updated_at')
      .eq('is_active', true)

    if (pageError) {
      console.error('Error fetching page_content:', pageError)
      return NextResponse.json(
        { error: 'Failed to fetch page content statistics' },
        { status: 500 }
      )
    }

    // Fetch homepage_sections stats (the actual table name)
    const { data: homepageData, error: homepageError } = await supabaseAdmin
      .from('homepage_sections')
      .select('section_type, updated_at')
      .eq('is_active', true)

    if (homepageError) {
      console.error('Error fetching homepage_sections:', homepageError)
      // Don't fail completely if homepage_sections doesn't exist
    }

    // Calculate stats for each page
    const stats: Record<string, { count: number; lastModified: string }> = {}
    
    const pages = ['homepage', 'flow', 'play', 'surf', 'the-spot', 'about', 'contact']
    
    pages.forEach(pageSlug => {
      if (pageSlug === 'homepage') {
        // Special handling for homepage
        const homepageSections = (homepageData as any[]) || []
        stats[pageSlug] = {
          count: homepageSections.length,
          lastModified: homepageSections.length > 0 
            ? new Date(Math.max(...homepageSections.map((s: any) => new Date(s.updated_at).getTime()))).toISOString()
            : null
        }
      } else {
        // Regular pages
        const pageSections = (pageData as any[])?.filter((section: any) => section.page_slug === pageSlug) || []
        stats[pageSlug] = {
          count: pageSections.length,
          lastModified: pageSections.length > 0 
            ? new Date(Math.max(...pageSections.map((s: any) => new Date(s.updated_at).getTime()))).toISOString()
            : null
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

