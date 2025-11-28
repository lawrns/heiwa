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
  BookOpen,
  AlertCircle
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
    // You could send this to an error tracking service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-2">An error occurred while loading the admin dashboard.</p>
              {this.state.error && (
                <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 p-3 rounded break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                  window.location.reload()
                }}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Reload Page
              </button>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium inline-block"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium inline-block"
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
  { name: 'Surf Weeks', href: '/admin/surf-camps', icon: Building2 },
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginPage, setIsLoginPage] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showLayout, setShowLayout] = useState(false)
  const [sidebarInitialized, setSidebarInitialized] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check if we're on login page
    const pathname = window.location.pathname
    setIsLoginPage(pathname === '/admin/login')
    
    // For non-login pages, show layout immediately to prevent flash
    if (pathname !== '/admin/login') {
      setShowLayout(true)
    }
    
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/login', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (response.ok) {
          setIsAuthenticated(true)
          setShowLayout(true)
          const email = localStorage.getItem('userEmail') || 'admin@heiwa.house'
          setUserEmail(email)
          setSidebarInitialized(true)
        } else {
          setIsAuthenticated(false)
          setShowLayout(false)
          // If not on login page and not authenticated, redirect to login
          if (pathname !== '/admin/login') {
            router.push('/admin/login')
          }
        }
      } catch (err) {
        setIsAuthenticated(false)
        setShowLayout(false)
        if (pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  // Open sidebar on desktop after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && sidebarInitialized && typeof window !== 'undefined') {
      // On desktop (md breakpoint), sidebar should be visible
      // The CSS handles this with md:translate-x-0, but we ensure state is correct
      if (window.innerWidth >= 768) {
        // Sidebar is visible via CSS on desktop, but ensure mobile state is correct
        // Don't force sidebarOpen to true on desktop as CSS handles visibility
      }
    }
  }, [isAuthenticated, sidebarInitialized])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
      localStorage.removeItem('userEmail')
      localStorage.removeItem('authToken')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  // Show loading state while checking auth or if not client, but only for login page
  if (!isClient || (checkingAuth && isLoginPage)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // If on login page, don't show sidebar - just render children
  if (isLoginPage) {
    return <ErrorBoundary>{children}</ErrorBoundary>
  }

  // If not showing layout (not authenticated), show loading and redirect
  // But allow rendering if authenticated even if showLayout is temporarily false
  if (!showLayout && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
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

          {/* Sidebar - Always visible on desktop, fixed position to stay in place when scrolling */}
          <aside className={`
            fixed inset-y-0 left-0 z-40
            bg-gray-800 shadow-lg md:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:!translate-x-0
            ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
            w-64 md:block
            flex flex-col
            border-r border-gray-700 md:border-r-0
            h-screen overflow-hidden
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

          {/* Main content area - offset for fixed sidebar on desktop */}
          <main className={`flex-1 flex flex-col min-w-0 bg-gray-50 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} transition-all duration-300`}>
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
