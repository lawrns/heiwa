'use client'

import { useState, useEffect } from 'react'
import AnalyticsDashboard from '@/components/admin/analytics/AnalyticsDashboard'
import CMSNavigation from '@/components/admin/cms/CMSNavigation'
import CMSBreadcrumb from '@/components/admin/cms/CMSBreadcrumb'

export default function CMSAnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex">
        <CMSNavigation />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">View content performance and usage statistics</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}
