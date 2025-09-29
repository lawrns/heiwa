'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'

export function NavigationWrapper() {
  const pathname = usePathname()
  
  return <Navigation currentPath={pathname} />
}
