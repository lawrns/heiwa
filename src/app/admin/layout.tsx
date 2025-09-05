'use client'

import Link from 'next/link'

import { Component, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/AuthProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { BarChart3Icon, ShieldIcon, FileTextIcon, UserCheckIcon } from 'lucide-react'

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

  componentDidCatch(error: Error, errorInfo: any) {
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Clients', href: '/admin/clients', icon: UserGroupIcon },
  { name: 'Surf Camps', href: '/admin/surfcamps', icon: BuildingOfficeIcon },
  { name: 'Rooms', href: '/admin/rooms', icon: CubeIcon },
  { name: 'Assignments', href: '/admin/assignments', icon: UserCheckIcon },
  { name: 'Add-ons', href: '/admin/addons', icon: CubeIcon },
  { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
  { name: 'Bookings', href: '/admin/bookings', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3Icon },
  { name: 'Compliance', href: '/admin/compliance', icon: FileTextIcon },
  { name: 'System', href: '/admin/system', icon: ShieldIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while during SSR only
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top header - Full width, always visible */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-50 relative">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700"
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.email}</span>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                aria-label="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main layout container - Flex row for desktop, column for mobile */}
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
            fixed md:relative inset-y-0 left-0 z-40 md:z-auto
            bg-white shadow-lg md:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
            w-64 md:block
            flex flex-col
            border-r border-gray-200 md:border-r-0
            mt-0 md:mt-0
          `}>
            {/* Sidebar header */}
            <div className="flex items-center justify-between h-16 px-4 bg-blue-600 border-b border-blue-700">
              <Link href="/admin" className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">H</span>
                </div>
                {!sidebarCollapsed && <span className="text-white font-semibold text-lg truncate">Heiwa House</span>}
              </Link>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:block text-white hover:text-gray-200 p-1 rounded transition-colors"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <Bars3Icon className={`h-5 w-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-white hover:text-gray-200 p-1 rounded transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-8 px-4 md:px-4 overflow-y-auto" aria-label="Navigation menu">
              <div className={`${sidebarCollapsed ? 'px-2' : 'px-0'} space-y-2`}>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center py-3 px-4 text-sm font-medium text-gray-700
                      rounded-lg hover:bg-gray-100 hover:text-blue-600
                      transition-colors duration-200
                      ${sidebarCollapsed ? 'px-3 justify-center' : ''}
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
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ErrorBoundary>
  )
}
