'use client'

import { useState, useEffect } from 'react'
// Link import removed - using router navigation
import { FileText, Plus, Eye, PencilLine } from 'lucide-react'
import { CMSLayout } from '@/components/admin/cms/CMSLayout'
import { CMSCard } from '@/components/admin/cms/CMSCard'
import { formatDateCompact } from '@/lib/utils'
// CMSHeader import removed - not currently used

interface PageData {
  slug: string
  title: string
  description: string
  sectionCount: number
  lastModified: string
  status: 'published' | 'draft' | 'archived'
}

const pages: PageData[] = [
  {
    slug: 'homepage',
    title: 'Homepage',
    description: 'Manage homepage sections and content',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'flow',
    title: 'Heiwa Flow',
    description: 'Yoga, massage, ice bath, sauna, and wellness services',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'play',
    title: 'Heiwa Play',
    description: 'Activities, experiences, and recreational services',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'surf',
    title: 'Heiwa Surf',
    description: 'Surf lessons, equipment, and surf camp information',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'surf-weeks',
    title: 'Surf Weeks',
    description: 'Manage surf weeks listing, process, and content sections',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'about',
    title: 'About Us',
    description: 'Company story, team, and mission',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Contact information, location, and inquiry forms',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'the-spot',
    title: 'The Spot',
    description: 'Information about the surf spot and location',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    description: 'Legal terms and conditions for the website',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'Privacy policy and data handling information',
    sectionCount: 0,
    lastModified: 'Never',
    status: 'published'
  }
]

export default function CMSPagesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageStats, setPageStats] = useState<Record<string, { count: number; lastModified: string }>>({})

  useEffect(() => {
    fetchPageStats()
  }, [])

  const fetchPageStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use API route instead of direct Supabase call with retry logic
      let response: Response | null = null
      let lastError: Error | null = null

      for (let attempt = 0; attempt <= 2; attempt++) {
        try {
          response = await fetch('/api/admin/cms/page-stats', {
            method: 'GET',
            credentials: 'include',
          })
          
          if (response.ok) break
          
          if (attempt < 2 && [408, 429, 500, 502, 503, 504].includes(response.status)) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Network error')
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('Failed to fetch page statistics')
      }

      const result = await response.json()
      
      if (result.success && result.stats) {
        // Convert ISO dates to locale date strings
        const formattedStats: Record<string, { count: number; lastModified: string }> = {}
        Object.keys(result.stats).forEach(pageSlug => {
          const stat = result.stats[pageSlug]
          formattedStats[pageSlug] = {
            count: stat.count,
            lastModified: stat.lastModified
              ? formatDateCompact(stat.lastModified)
              : 'Never'
          }
        })
        setPageStats(formattedStats)
        setError(null)
      } else {
        throw new Error(result.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching page stats:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page statistics'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CMSLayout
      title="Pages"
      description="Manage and edit your website pages"
      loading={loading}
      error={error}
      action={{
        label: 'Create New Page',
        icon: <Plus className="w-4 h-4" />,
      }}
    >
      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="max-w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPages.map((page) => {
            const stats = pageStats[page.slug] || { count: 0, lastModified: 'Never' }
            
            return (
              <CMSCard
                key={page.slug}
                title={page.title}
                description={page.description}
                icon={<FileText className="w-5 h-5" />}
                status={page.status}
                metadata={[
                  { label: 'Sections', value: `${stats.count} section${stats.count !== 1 ? 's' : ''}` },
                  { label: 'Last Modified', value: stats.lastModified === 'Never' ? 'Never modified' : stats.lastModified }
                ]}
                actions={[
                  {
                    label: 'Edit Page',
                    icon: <PencilLine className="w-4 h-4" />,
                    variant: 'primary',
                    href: `/${page.slug === 'homepage' ? '' : page.slug}`
                  },
                  {
                    label: 'Preview',
                    icon: <Eye className="w-4 h-4" />,
                    variant: 'secondary',
                    href: `/${page.slug === 'homepage' ? '' : page.slug}`,
                    target: '_blank'
                  }
                ]}
                href={`/${page.slug === 'homepage' ? '' : page.slug}`}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      )}
    </CMSLayout>
  )
}
