'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  BarChart3, 
  Settings,
  ChevronRight,
  Home
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/cms',
    icon: Home
  },
  {
    title: 'Pages',
    href: '/admin/cms/pages',
    icon: FileText,
    children: [
      {
        title: 'Flow',
        href: '/admin/cms/pages/flow',
        icon: ChevronRight
      },
      {
        title: 'Play',
        href: '/admin/cms/pages/play',
        icon: ChevronRight
      },
      {
        title: 'Surf',
        href: '/admin/cms/pages/surf',
        icon: ChevronRight
      },
      {
        title: 'Surf Weeks',
        href: '/admin/cms/pages/surf-weeks',
        icon: ChevronRight
      },
      {
        title: 'The Spot',
        href: '/admin/cms/pages/the-spot',
        icon: ChevronRight
      },
      {
        title: 'About',
        href: '/admin/cms/pages/about',
        icon: ChevronRight
      },
      {
        title: 'Contact',
        href: '/admin/cms/pages/contact',
        icon: ChevronRight
      }
    ]
  },
  {
    title: 'Testimonials',
    href: '/admin/cms/testimonials',
    icon: MessageSquare,
    badge: '4'
  },
  {
    title: 'FAQ',
    href: '/admin/cms/faq',
    icon: HelpCircle
  },
  {
    title: 'Analytics',
    href: '/admin/cms/analytics',
    icon: BarChart3
  },
  {
    title: 'Settings',
    href: '/admin/cms/settings',
    icon: Settings
  }
]

interface CMSNavigationProps {
  className?: string
  onClose?: () => void
}

export default function CMSNavigation({ className, onClose }: CMSNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/cms') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isChildActive = (children: NavItem[]) => {
    return children.some(child => pathname === child.href)
  }

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <nav className={cn('w-64 h-full bg-white border-r border-gray-200 overflow-y-auto', className)}>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">CMS</h2>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-[color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded px-1"
            onClick={handleLinkClick}
          >
            <Home className="w-3 h-3" />
            <span>Back to Admin</span>
          </Link>
        </div>
        
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const childActive = item.children ? isChildActive(item.children) : false
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-[background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    active || childActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
                
                {/* Render children if parent is active */}
                {item.children && (active || childActive) && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      const childActive = pathname === child.href
                      
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center px-3 py-2 text-sm rounded-lg transition-[background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                              childActive
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            <ChildIcon className="mr-3 h-3 w-3 flex-shrink-0" />
                            {child.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
