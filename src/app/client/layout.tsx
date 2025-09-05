import Link from 'next/link'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboardIcon,
  UserIcon,
  CalendarIcon,
  SettingsIcon,
  LogOutIcon,
  WavesIcon
} from 'lucide-react'

interface ClientLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboardIcon },
  { name: 'Profile', href: '/client/profile', icon: UserIcon },
  { name: 'Bookings', href: '/client/bookings', icon: CalendarIcon },
  { name: 'Preferences', href: '/client/preferences', icon: SettingsIcon }
]

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/client/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-oceanBlue-600 rounded-lg flex items-center justify-center">
                <WavesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Heiwa House</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back!</span>
              <Button variant="outline" size="sm">
                <LogOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-oceanBlue-50 hover:text-oceanBlue-700 transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

