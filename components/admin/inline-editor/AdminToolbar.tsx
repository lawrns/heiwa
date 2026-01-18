'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PencilLine } from 'lucide-react'
import { EditSidebar } from './EditSidebar'
import { isAdminUser } from '@/lib/admin/auth-utils'

// Map URL paths to page slugs for CMS
function getPageSlug(pathname: string): string | null {
  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null

  // Map paths to slugs
  if (pathname === '/') return 'homepage'
  if (pathname === '/flow') return 'flow'
  if (pathname === '/play') return 'play'
  if (pathname === '/surf') return 'surf'
  if (pathname === '/contact') return 'contact'
  if (pathname === '/the-spot') return 'the-spot'
  if (pathname === '/about') return 'about'
  if (pathname === '/surf-weeks') return 'surf-weeks'

  return null
}

export function AdminToolbar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Check admin status using utility function
    const checkAdmin = () => {
      setIsAdmin(isAdminUser())
    }

    checkAdmin()
    // Re-check when window gains focus
    window.addEventListener('focus', checkAdmin)
    
    // Listen for storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_logged_in') {
        checkAdmin()
      }
    }
    window.addEventListener('storage', handleStorage)
    
    // Check periodically for first-time login
    const interval = setInterval(checkAdmin, 1000)
    
    return () => {
      window.removeEventListener('focus', checkAdmin)
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  const pageSlug = getPageSlug(pathname)

  // Reserve space for toolbar to prevent layout shift
  // Always render the spacer if we're on an editable page (even if not admin yet)
  const shouldReserveSpace = pageSlug !== null

  // Don't render toolbar if not admin or not on an editable page
  if (!isAdmin || !pageSlug) {
    return shouldReserveSpace ? <div className="h-16" /> : null
  }

  return (
    <>
      {/* Floating bottom toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">Admin Mode</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Edit Page Button - Opens Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-sm transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <PencilLine className="w-4 h-4" />
              Edit Page
            </button>

            {/* Dashboard Link */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-sm transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 focus-visible:ring-offset-2 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Sidebar */}
      {isSidebarOpen && (
        <EditSidebar
          pageSlug={pageSlug}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Bottom padding to prevent content from being hidden */}
      <div className="h-16" />
    </>
  )
}
