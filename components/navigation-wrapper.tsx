'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'

export default function NavigationWrapper() {
  const pathname = usePathname()
  
  // Hide navigation for admin routes
  if (pathname.startsWith('/admin')) {
    return null
  }

  return <Navigation currentPath={pathname} />
}
