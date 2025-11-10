'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Edit, Clock, ChevronRight, Plus, Eye, Trash2 } from 'lucide-react'
import { CMSLayout } from '@/components/admin/cms/CMSLayout'
import { CMSCard } from '@/components/admin/cms/CMSCard'
import { CMSHeader } from '@/components/admin/cms/CMSHeader'
import { supabaseAdmin } from '@/lib/supabase'

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
    slug: 'the-spot',
    title: 'The Spot',
    description: 'Beach club, restaurant, and local attractions',
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
      const { data, error } = await supabaseAdmin
        .from('page_content')
        .select('page_slug, updated_at')
        .eq('is_active', true)

      if (error) throw error

      // Calculate stats for each page
      const stats: Record<string, { count: number; lastModified: string }> = {}
      pages.forEach(page => {
        const pageSections = (data as any[])?.filter((section: any) => section.page_slug === page.slug) || []
        stats[page.slug] = {
          count: pageSections.length,
          lastModified: pageSections.length > 0 
            ? new Date(Math.max(...pageSections.map((s: any) => new Date(s.updated_at).getTime()))).toLocaleDateString()
            : 'Never'
        }
      })

      setPageStats(stats)
    } catch (err) {
      setError('Failed to load page statistics')
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || variants.published}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

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
      <div className="mb-8">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  { label: 'Sections', value: stats.count.toString() },
                  { label: 'Last Modified', value: stats.lastModified }
                ]}
                actions={[
                  {
                    label: 'Edit',
                    icon: <Edit className="w-4 h-4" />,
                    variant: 'primary',
                    href: `/admin/cms/pages/${page.slug}`
                  },
                  {
                    label: 'View',
                    icon: <Eye className="w-4 h-4" />,
                    variant: 'secondary'
                  }
                ]}
                href={`/admin/cms/pages/${page.slug}`}
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
