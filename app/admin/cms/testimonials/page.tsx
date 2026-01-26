'use client'

import { useState, useEffect } from 'react'
import TestimonialsManager from '@/components/admin/editors/TestimonialsManager'
import { CMSLayout } from '@/components/admin/cms/CMSLayout'

export default function CMSTestimonialsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <CMSLayout
      title="Testimonials"
      description="Manage guest testimonials and reviews"
      loading={loading}
    >
      <TestimonialsManager />
    </CMSLayout>
  )
}
