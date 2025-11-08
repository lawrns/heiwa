'use client'

import { usePathname } from 'next/navigation'

export function SkipToContent() {
  const pathname = usePathname()
  
  // Hide for admin routes
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:text-sm focus:font-semibold"
    >
      Skip to main content
    </a>
  )
}
