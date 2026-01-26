import {
  Home,
  Users,
  Building2,
  Box,
  Calendar,
  ClipboardList,
  BarChart3,
  FileText,
  BookOpen,
  Package,
  Receipt,
  Image,
  LucideIcon
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  description?: string
}

export const adminNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Overview and key metrics'
  },
  {
    name: 'Clients',
    href: '/admin/clients',
    icon: Users,
    description: 'Manage client information'
  },
  {
    name: 'Surf Weeks',
    href: '/admin/surf-camps',
    icon: Building2,
    description: 'Manage surf week sessions'
  },
  {
    name: 'Rooms',
    href: '/admin/rooms',
    icon: Box,
    description: 'Manage room inventory'
  },
  {
    name: 'Add-ons',
    href: '/admin/add-ons',
    icon: Package,
    description: 'Manage extras and services'
  },
  {
    name: 'Bookings',
    href: '/admin/bookings',
    icon: ClipboardList,
    description: 'View and manage bookings'
  },
  {
    name: 'Invoices',
    href: '/admin/invoices',
    icon: Receipt,
    description: 'Manage invoices and billing'
  },
  {
    name: 'Calendar',
    href: '/admin/calendar',
    icon: Calendar,
    description: 'View booking calendar'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'View reports and analytics'
  },
  {
    name: 'Media Library',
    href: '/admin/media',
    icon: Image,
    description: 'Upload images and copy links'
  },
  {
    name: 'CMS',
    href: '/admin/cms',
    icon: FileText,
    description: 'Manage website content'
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: BookOpen,
    description: 'Manage blog posts and content'
  },
]

// CMS submenu items
export const cmsNavigationItems: NavigationItem[] = [
  {
    name: 'Pages',
    href: '/admin/cms/pages',
    icon: FileText,
    description: 'Manage website pages'
  },
  {
    name: 'Homepage',
    href: '/admin/homepage',
    icon: Home,
    description: 'Edit homepage sections'
  },
  {
    name: 'Testimonials',
    href: '/admin/cms/testimonials',
    icon: FileText,
    description: 'Manage testimonials'
  },
  {
    name: 'FAQ',
    href: '/admin/cms/faq',
    icon: FileText,
    description: 'Manage FAQ items'
  },
  {
    name: 'Analytics',
    href: '/admin/cms/analytics',
    icon: BarChart3,
    description: 'CMS analytics'
  }
]

export const getNavigationItem = (href: string): NavigationItem | undefined => {
  return adminNavigationItems.find(item => item.href === href)
}

export const getNavigationItemsByCategory = (category: string): NavigationItem[] => {
  // Can be extended for categorized navigation
  return adminNavigationItems
}
