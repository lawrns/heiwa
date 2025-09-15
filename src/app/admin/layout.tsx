'use client'

import Link from 'next/link'
import Image from 'next/image'

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
  XMarkIcon,
  ChevronRightIcon
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
                className="bg-heiwaOrange-600 text-white px-4 py-2 rounded hover:bg-heiwaOrange-700"
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

// AdminLogo component
interface AdminLogoProps {
  collapsed: boolean;
  className?: string;
}

function AdminLogo({ collapsed, className = "" }: AdminLogoProps) {
  return (
    <Link href="/admin" className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${collapsed ? 'w-36 h-36' : 'w-45 h-45'} flex-shrink-0`}>
        <Image
          src="/wordpress-plugin/heiwa-booking-widget/assets/images/heiwalogo.webp"
          alt="Heiwa House Admin"
          width={collapsed ? 144 : 180}
          height={collapsed ? 144 : 180}
          className="object-contain filter brightness-0 invert"
          onError={(e) => {
            // Fallback to 'H' text if image fails to load
            const target = e.target as HTMLElement;
            if (target) {
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.logo-fallback');
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex';
              }
            }
          }}
        />
        {/* Fallback 'H' text */}
        <div className="logo-fallback absolute inset-0 hidden items-center justify-center">
          <span className="text-white font-bold text-6xl">H</span>
        </div>
      </div>
    </Link>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (isClient && !loading && !user) {
      router.replace('/login');
    }
  }, [isClient, loading, user, router]);

  // Show loading state during SSR or auth check
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heiwaOrange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing...</p>
        </div>
      </div>
    );
  }

  // Don't render admin layout if user is not authenticated or not admin
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting to login…</h2>
          <p className="text-gray-600 mb-4">Admin access required.</p>
          <Link href="/login" className="text-heiwaOrange-600 underline">Go to Login</Link>
          {/* Immediate client-side redirect to avoid empty render triggering 404 */}
          <script dangerouslySetInnerHTML={{ __html: "window.location.replace('/login')" }} />
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="heiwa-admin min-h-screen bg-gray-50 flex">
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
                  {/* Mobile menu button for collapsed state */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-white hover:text-gray-200 p-1 rounded transition-colors mb-2"
                    aria-label="Open sidebar"
                    data-testid="sidebar-open-button"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                  {/* Logo positioned below mobile button when collapsed */}
                  <AdminLogo collapsed={true} />
                  {/* SVG button positioned below logo when collapsed */}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden md:block text-white hover:text-gray-200 p-1 rounded transition-colors"
                    title="Expand sidebar"
                    data-testid="sidebar-toggle"
                  >
                    <ChevronRightIcon className="h-5 w-5 transition-transform duration-200" />
                  </button>
                </>
              ) : (
                <>
                  {/* Expanded layout - centered logo */}
                  <Link href="/admin" className="flex items-center justify-center w-full">
                    <AdminLogo collapsed={false} />
                  </Link>
                  {/* Toggle button positioned absolutely in top-right corner */}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute top-2 right-2 hidden md:block text-white hover:text-gray-200 p-1 rounded transition-colors"
                    title="Collapse sidebar"
                    data-testid="sidebar-toggle"
                  >
                    <Bars3Icon className="h-5 w-5 transition-transform duration-200" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-2 right-2 md:hidden text-white hover:text-gray-200 p-1 rounded transition-colors"
                    data-testid="sidebar-close-button"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-8 px-4 md:px-4 overflow-y-auto md:max-h-[calc(100vh-4rem)]" aria-label="Navigation menu" data-testid="sidebar-nav">
              <div className={`${sidebarCollapsed ? 'px-2' : 'px-0'} space-y-2`}>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group relative flex items-center py-3 px-4 text-sm font-medium text-gray-300
                      rounded-lg hover:bg-gray-700 hover:text-white
                      transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-5 after:w-0 after:rounded-full after:bg-heiwaOrange-500 after:transition-all after:duration-300 group-hover:after:w-1
                      ${sidebarCollapsed ? 'px-3 justify-center' : ''}
                    `}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : ""}
                    data-testid={`sidebar-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
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
            {/* User/Logout header - positioned below sidebar, right-aligned */}
            <header className="bg-white border-b border-gray-200 shadow-sm px-6 h-16 flex items-center justify-end">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.email}</span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="ml-2 flex items-center space-x-2"
                  aria-label="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto motion-safe:animate-fade-in">
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
