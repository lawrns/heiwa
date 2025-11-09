'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Edit, Clock, ChevronRight, Plus } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminAlert from '@/components/admin/ui/AdminAlert'
import CMSNavigation from '@/components/admin/cms/CMSNavigation'
import CMSBreadcrumb from '@/components/admin/cms/CMSBreadcrumb'
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
        const pageSections = data?.filter(section => section.page_slug === page.slug) || []
        stats[page.slug] = {
          count: pageSections.length,
          lastModified: pageSections.length > 0 
            ? new Date(Math.max(...pageSections.map(s => new Date(s.updated_at).getTime()))).toLocaleDateString()
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <CMSNavigation />
      <div className="flex-1">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <CMSBreadcrumb />
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pages</h1>
                <p className="text-gray-600">Manage and edit your website pages</p>
              </div>
              <AdminButton variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create New Page
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <AdminAlert variant="error">
                {error}
              </AdminAlert>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => {
              const stats = pageStats[page.slug] || { count: 0, lastModified: 'Never' }
              
              return (
                <div key={page.slug} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Page Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                          <p className="text-sm text-gray-500">/{page.slug}</p>
                        </div>
                      </div>
                      {getStatusBadge(page.status)}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {page.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <span className="mr-4">{stats.count} sections</span>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {stats.lastModified}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Link href={`/admin/cms/pages/${page.slug}`}>
                        <AdminButton variant="primary" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </AdminButton>
                      </Link>
                      <Link href={`/admin/cms/pages/${page.slug}`}>
                        <AdminButton variant="outline" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </AdminButton>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredPages.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
