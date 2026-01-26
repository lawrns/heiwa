import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

interface PageSection {
  page_slug: string
  updated_at: string
}

interface PageContent {
  page_slug: string
  updated_at: string
}

interface HomepageSection {
  section_type: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

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
      const pageSections = (pageSectionsData as PageSection[])?.filter((s: PageSection) => s.page_slug === pageSlug) || []

      // Also count from legacy tables
      const legacyPageSections = (pageData as PageContent[])?.filter((s: PageContent) => s.page_slug === pageSlug) || []
      const homepageSections = pageSlug === 'homepage' ? ((homepageData as HomepageSection[]) || []) : []

      // Combine all sections for this page
      const allSections = [...pageSections, ...legacyPageSections, ...homepageSections]

      stats[pageSlug] = {
        count: allSections.length,
        lastModified: allSections.length > 0
          ? new Date(Math.max(...allSections.map((s: PageSection | HomepageSection) => new Date(s.updated_at).getTime()))).toISOString()
          : null
      }
    })

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

