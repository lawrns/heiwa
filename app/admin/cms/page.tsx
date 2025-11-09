'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CMSDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new pages structure
    router.replace('/admin/cms/pages')
  }, [router])

  return (
    <div className="p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to CMS...</p>
      </div>
    </div>
  )
}
