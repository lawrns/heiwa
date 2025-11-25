'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Plus, Settings } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminAlert from '@/components/admin/ui/AdminAlert'
import CMSNavigation from '@/components/admin/cms/CMSNavigation'
import CMSBreadcrumb from '@/components/admin/cms/CMSBreadcrumb'
import PageEditor from '@/components/admin/cms/PageEditor'
import { UpdatePageContentInput } from '@/lib/cms-types'

export default function CMSPageEditor() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Basic validation - just check if we have a slug
    if (slug) {
      setLoading(false)
    } else {
      setError('No page specified')
      setLoading(false)
    }
  }, [slug])

  const handleBack = () => {
    router.push('/admin/cms/pages')
  }

  if (loading) {
    return (
      <div className="flex">
        <CMSNavigation />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !slug) {
    return (
      <div className="flex">
        <CMSNavigation />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Page not found</h3>
            <p className="text-gray-500">{error || 'The page you\'re looking for doesn\'t exist.'}</p>
            <AdminButton variant="primary" onClick={handleBack} className="mt-4">
              Go Back to Pages
            </AdminButton>
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
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {slug.charAt(0).toUpperCase() + slug.slice(1)} Page Editor
                  </h1>
                  <p className="text-gray-600">/{slug} • Edit page content and sections</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AdminButton variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </AdminButton>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <PageEditor
            pageSlug={slug}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  )
}
