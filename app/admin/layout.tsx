'use client'

import Link from 'next/link'
import { Component, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home,
  Users,
  Building2,
  Box,
  Calendar,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  FileText,
  Key,
  CreditCard,
  BookOpen
} from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin dashboard error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">An error occurred while loading the admin dashboard.</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Try again
              </button>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 inline-block"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface AdminLayoutProps {
  children: React.ReactNode
}

// Navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Surf Camps', href: '/admin/surf-camps', icon: Building2 },
  { name: 'Rooms', href: '/admin/rooms', icon: Box },
  { name: 'Bookings', href: '/admin/bookings', icon: ClipboardList },
  { name: 'Assignments', href: '/admin/assignments', icon: Key },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'CMS', href: '/admin/cms', icon: FileText },
  { name: 'Blog', href: '/admin/blog', icon: BookOpen },
]

// Admin Logo component
interface AdminLogoProps {
  collapsed: boolean
  className?: string
}

function AdminLogo({ collapsed, className = "" }: AdminLogoProps) {
  return (
    <Link href="/admin" className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${collapsed ? 'w-10 h-10' : 'w-12 h-12'} flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-xl">H</span>
      </div>
    </Link>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    setIsClient(true)
    // Get user email from localStorage or session
    const email = localStorage.getItem('userEmail') || 'admin@heiwa.house'
    setUserEmail(email)
  }, [])

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userEmail')
      localStorage.removeItem('authToken')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="heiwa-admin min-h-screen bg-gray-50 flex">
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 md:hidden">
              <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          )}

          {/* Sidebar */}
          <aside className={`
            fixed md:sticky inset-y-0 md:top-0 left-0 z-40 md:z-auto
            bg-gray-800 shadow-lg md:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
            w-64 md:block
            flex flex-col
            border-r border-gray-700 md:border-r-0
            mt-0 md:mt-0
            h-screen md:overflow-hidden
          `}>
            {/* Sidebar header */}
            <div className={`${sidebarCollapsed ? 'flex flex-col items-center py-4 space-y-3' : 'flex items-center justify-center h-24 px-4 relative'} bg-gray-800 border-b border-gray-700`}>
              {sidebarCollapsed ? (
                <>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-white hover:text-gray-200 p-1 rounded transition-colors mb-2"
                    aria-label="Open sidebar"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden md:block text-white hover:text-gray-200 p-2 rounded transition-colors"
                    title="Expand sidebar"
                  >
                    <ChevronRight className="h-6 w-6 transition-transform duration-200" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-full">
                    <AdminLogo collapsed={false} />
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute top-2 right-2 hidden md:block text-white hover:text-gray-200 p-1 rounded transition-colors"
                    title="Collapse sidebar"
                  >
                    <Menu className="h-5 w-5 transition-transform duration-200" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-2 right-2 md:hidden text-white hover:text-gray-200 p-1 rounded transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-8 px-4 md:px-4 overflow-y-auto md:max-h-[calc(100vh-4rem)]" aria-label="Navigation menu">
              <div className="px-0 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group relative flex items-center py-3 text-sm font-medium text-gray-300
                      rounded-lg hover:bg-gray-700 hover:text-white
                      transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-5 after:w-0 after:rounded-full after:bg-orange-500 after:transition-all after:duration-300 group-hover:after:w-1
                      ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'}
                    `}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : ""}
                  >
                    <item.icon className={`${sidebarCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'} flex-shrink-0`} />
                    {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main content area */}
          <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
            {/* User/Logout header */}
            <header className="bg-white border-b border-gray-200 shadow-sm px-6 h-16 flex items-center justify-end">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {userEmail?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium text-sm">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
