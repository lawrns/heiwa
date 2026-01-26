'use client'

import { useState, useEffect } from 'react'
import FAQManager from '@/components/admin/editors/FAQManager'
import { CMSLayout } from '@/components/admin/cms/CMSLayout'

export default function CMSFAQPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <CMSLayout
      title="FAQ"
      description="Manage frequently asked questions"
      loading={loading}
    >
      <FAQManager />
    </CMSLayout>
  )
}
