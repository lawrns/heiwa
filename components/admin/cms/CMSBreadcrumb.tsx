'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

export default function CMSBreadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'CMS', href: '/admin/cms' }
    ]

    // Handle different page types
    if (pathname.startsWith('/admin/cms/pages')) {
      breadcrumbs.push({ label: 'Pages', href: '/admin/cms/pages' })
      
      if (pathSegments.length > 3) { // /admin/cms/pages/[slug]
        const slug = pathSegments[3]
        const pageTitles: Record<string, string> = {
          flow: 'Flow',
          play: 'Play',
          surf: 'Surf',
          'the-spot': 'The Spot',
          about: 'About',
          contact: 'Contact'
        }
        breadcrumbs.push({ 
          label: pageTitles[slug] || slug.charAt(0).toUpperCase() + slug.slice(1), 
          href: `/admin/cms/pages/${slug}` 
        })
      }
    } else if (pathname.startsWith('/admin/cms/testimonials')) {
      breadcrumbs.push({ label: 'Testimonials', href: '/admin/cms/testimonials' })
    } else if (pathname.startsWith('/admin/cms/faq')) {
      breadcrumbs.push({ label: 'FAQ', href: '/admin/cms/faq' })
    } else if (pathname.startsWith('/admin/cms/analytics')) {
      breadcrumbs.push({ label: 'Analytics', href: '/admin/cms/analytics' })
    } else if (pathname.startsWith('/admin/cms/settings')) {
      breadcrumbs.push({ label: 'Settings', href: '/admin/cms/settings' })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500">
      {/* Add Admin Dashboard link at the start */}
      <Link
        href="/admin"
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Admin
      </Link>
      <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
      
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <div key={item.href} className="flex items-center">
            {index === 0 && <Home className="w-4 h-4 mr-1" />}
            
            {isLast ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}
          </div>
        )
      })}
    </nav>
  )
}
