'use client'

import { useState, useEffect } from 'react'
import AnalyticsDashboard from '@/components/admin/analytics/AnalyticsDashboard'
import { CMSLayout } from '@/components/admin/cms/CMSLayout'

export default function CMSAnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <CMSLayout
      title="Analytics"
      description="View content performance and usage statistics"
      loading={loading}
    >
      <AnalyticsDashboard />
    </CMSLayout>
  )
}
