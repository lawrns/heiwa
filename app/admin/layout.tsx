import type { Metadata } from 'next'
import Link from 'next/link'
import { Home, Bed, Calendar, ShoppingCart, Image, Settings, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Heiwa House',
  description: 'Manage rooms, bookings, and content for Heiwa House',
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Rooms', href: '/admin/rooms', icon: Bed },
  { name: 'Surf Camps', href: '/admin/surf-camps', icon: Calendar },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Add-ons', href: '/admin/add-ons', icon: ShoppingCart },
  { name: 'Gallery', href: '/admin/gallery', icon: Image },
  { name: 'Homepage', href: '/admin/homepage', icon: Globe },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Heiwa House Admin
          </Link>
        </div>
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}
