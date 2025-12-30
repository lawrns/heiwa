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

    // Fetch page_sections stats (the unified CMS table)
    const { data: pageSectionsData, error: pageSectionsError } = await supabaseAdmin
      .from('page_sections')
      .select('page_slug, updated_at')
      .eq('is_active', true)

    if (pageSectionsError) {
      console.error('Error fetching page_sections:', pageSectionsError)
      // Continue with empty data if table doesn't exist
    }

    // Also fetch legacy page_content for backwards compatibility
    const { data: pageData } = await supabaseAdmin
      .from('page_content')
      .select('page_slug, updated_at')
      .eq('is_active', true)

    // Fetch homepage_sections stats (legacy table)
    const { data: homepageData } = await supabaseAdmin
      .from('homepage_sections')
      .select('section_type, updated_at')
      .eq('is_active', true)

    // Calculate stats for each page
    const stats: Record<string, { count: number; lastModified: string | null }> = {}

    const pages = ['homepage', 'flow', 'play', 'surf', 'surf-weeks', 'about', 'contact']

    pages.forEach(pageSlug => {
      // Count from page_sections (primary source)
      const pageSections = (pageSectionsData as any[])?.filter((s: any) => s.page_slug === pageSlug) || []

      // Also count from legacy tables
      const legacyPageSections = (pageData as any[])?.filter((s: any) => s.page_slug === pageSlug) || []
      const homepageSections = pageSlug === 'homepage' ? ((homepageData as any[]) || []) : []

      // Combine all sections for this page
      const allSections = [...pageSections, ...legacyPageSections, ...homepageSections]

      stats[pageSlug] = {
        count: allSections.length,
        lastModified: allSections.length > 0
          ? new Date(Math.max(...allSections.map((s: any) => new Date(s.updated_at).getTime()))).toISOString()
          : null
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

