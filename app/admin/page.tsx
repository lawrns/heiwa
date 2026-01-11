'use client'

import { useState, useEffect } from 'react'
import { Bed, Calendar, Users, TrendingUp, BarChart3, ClipboardList, Building2, Box, LucideIcon, CheckCircle, Clock } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import ActionCard from '@/components/admin/ActionCard'

interface Stat {
  name: string
  value: string
  icon: LucideIcon
  change: string
  changeType: 'positive' | 'negative'
}

interface Booking {
  id: string
  guest: string
  room: string
  checkIn: string
  status: string
  total_price?: number
  created_at?: string
}

interface DashboardData {
  stats: Stat[]
  recentBookings: Booking[]
  counts?: {
    clients: number
    rooms: number
    activeSurfCamps: number
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async (isRefresh = false) => {
      try {
        if (!isRefresh) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }
        
        // Fetch aggregated statistics (much more efficient than fetching all bookings)
        const statsResponse = await fetch('/api/admin/stats/aggregated')
        const statsResult = await statsResponse.json()
        
        if (!statsResult.success || !statsResult.data) {
          setError('Failed to fetch dashboard data')
          if (!isRefresh) setLoading(false)
          setIsRefreshing(false)
          return
        }

        const { stats, recentBookings, counts } = statsResult.data
        
        // Create stats array from aggregated data
        const statsArray: Stat[] = [
          {
            name: 'Total Bookings',
            value: stats.totalBookings.toString(),
            icon: Calendar,
            change: `${stats.bookingGrowth > 0 ? '+' : ''}${stats.bookingGrowth}%`,
            changeType: stats.bookingGrowth >= 0 ? 'positive' : 'negative'
          },
          {
            name: 'Confirmed',
            value: stats.confirmedCount.toString(),
            icon: CheckCircle,
            change: stats.totalBookings > 0 
              ? `${((stats.confirmedCount / stats.totalBookings) * 100).toFixed(0)}%`
              : '0%',
            changeType: 'positive'
          },
          {
            name: 'Pending',
            value: stats.pendingCount.toString(),
            icon: Clock,
            change: stats.totalBookings > 0
              ? `${((stats.pendingCount / stats.totalBookings) * 100).toFixed(0)}%`
              : '0%',
            changeType: 'positive'
          },
          {
            name: 'Revenue',
            value: `€${(stats.totalRevenue / 1000).toFixed(1)}k`,
            icon: TrendingUp,
            change: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%`,
            changeType: stats.revenueGrowth >= 0 ? 'positive' : 'negative'
          }
        ]

        setData({ stats: statsArray, recentBookings, counts })
        setError(null)
      } catch (err) {
        console.error('Dashboard error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard data'
        setError(errorMessage)
      } finally {
        if (!isRefresh) {
          setLoading(false)
        }
        setIsRefreshing(false)
      }
    }

    fetchDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardData(true), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-2xl">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  const stats = data?.stats || []
  const recentBookings = data?.recentBookings || []
  const counts = data?.counts
  
  const iconMap: { [key: string]: LucideIcon } = {
    'Bed': Bed,
    'Calendar': Calendar,
    'Users': Users,
    'TrendingUp': TrendingUp,
    'BarChart3': BarChart3,
    'ClipboardList': ClipboardList,
    'Building2': Building2,
    'Box': Box
  }

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between" data-testid="dashboard-header">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your bookings, rooms, and surf camps from one central location</p>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          const colors = ['orange', 'green', 'blue', 'purple'] as const
          const color = colors[idx % colors.length]
          
          // Determine filter URL based on stat type
          const getFilterUrl = () => {
            switch (stat.name) {
              case 'Total Bookings':
                return '/admin/bookings'
              case 'Confirmed':
                return '/admin/bookings?status=confirmed'
              case 'Pending':
                return '/admin/bookings?status=pending'
              case 'Revenue':
                return '/admin/bookings?payment_status=paid'
              default:
                return '/admin/bookings'
            }
          }
          
          return (
            <StatCard
              key={stat.name}
              title={stat.name}
              value={stat.value}
              icon={Icon}
              color={color}
              href={getFilterUrl()}
              trend={{
                value: parseInt(stat.change),
                direction: stat.changeType === 'positive' ? 'up' : 'down'
              }}
              data-testid={`stat-${stat.name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          )
        })}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="quick-actions">
        <ActionCard
          title="Bookings Management"
          description="View and manage all bookings for rooms and surf camps."
          icon={ClipboardList}
          href="/admin/bookings"
          buttonText="Manage Bookings"
          stat={{
            label: 'Active Bookings',
            value: stats[0]?.value || '0'
          }}
          color="orange"
        />
        <ActionCard
          title="Rooms Management"
          description="Manage room inventory, pricing, and availability."
          icon={Bed}
          href="/admin/rooms"
          buttonText="Manage Rooms"
          stat={{
            label: 'Available Rooms',
            value: (counts?.rooms ?? 0).toString()
          }}
          color="blue"
        />
        <ActionCard
          title="Surf Camps"
          description="Create and manage surf camp sessions and schedules."
          icon={Building2}
          href="/admin/surf-camps"
          buttonText="Manage Surf Camps"
          stat={{
            label: 'Active Camps',
            value: (counts?.activeSurfCamps ?? 0).toString()
          }}
          color="green"
        />
        <ActionCard
          title="Clients"
          description="View and manage client information and history."
          icon={Users}
          href="/admin/clients"
          buttonText="Manage Clients"
          stat={{
            label: 'Total Clients',
            value: (counts?.clients ?? 0).toString()
          }}
          color="purple"
        />
        <ActionCard
          title="Calendar"
          description="View booking calendar and manage schedules."
          icon={Calendar}
          href="/admin/calendar"
          buttonText="View Calendar"
          stat={{
            label: 'Events This Week',
            value: '15'
          }}
          color="orange"
        />
        <ActionCard
          title="Analytics"
          description="View booking statistics and revenue reports."
          icon={BarChart3}
          href="/admin/analytics"
          buttonText="View Analytics"
          stat={{
            label: 'Occupancy Rate',
            value: '80%'
          }}
          color="blue"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow rounded-lg" data-testid="recent-bookings">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200" data-testid="recent-bookings-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.guest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
