'use client'

import { useState, useEffect } from 'react'
import { Bed, Calendar, Users, TrendingUp, BarChart3, ClipboardList, Building2, Box } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import ActionCard from '@/components/admin/ActionCard'

interface Stat {
  name: string
  value: string
  icon: any
  change: string
  changeType: 'positive' | 'negative'
}

interface Booking {
  id: string
  guest: string
  room: string
  checkIn: string
  status: string
}

interface DashboardData {
  stats: Stat[]
  recentBookings: Booking[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch bookings data
        const bookingsResponse = await fetch('/api/bookings')
        const bookingsResult = await bookingsResponse.json()
        
        if (!bookingsResult.success || !bookingsResult.data.bookings) {
          setError('Failed to fetch dashboard data')
          setLoading(false)
          return
        }

        const bookings = bookingsResult.data.bookings
        
        // Calculate statistics
        const totalBookings = bookings.length
        const confirmedCount = bookings.filter((b: any) => b.status === 'confirmed').length
        const pendingCount = bookings.filter((b: any) => b.status === 'pending').length
        const cancelledCount = bookings.filter((b: any) => b.status === 'cancelled').length
        const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
        
        // Calculate month-over-month growth
        const thisMonthBookings = bookings.filter((b: any) => {
          const bookingDate = new Date(b.created_at)
          const today = new Date()
          return bookingDate.getMonth() === today.getMonth() && 
                 bookingDate.getFullYear() === today.getFullYear()
        }).length
        
        const lastMonthBookings = bookings.filter((b: any) => {
          const bookingDate = new Date(b.created_at)
          const today = new Date()
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
          return bookingDate.getMonth() === lastMonth.getMonth() && 
                 bookingDate.getFullYear() === lastMonth.getFullYear()
        }).length
        
        const bookingGrowth = lastMonthBookings > 0 
          ? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100)
          : 0
        
        // Calculate revenue growth
        const thisMonthRevenue = bookings
          .filter((b: any) => {
            const bookingDate = new Date(b.created_at)
            const today = new Date()
            return bookingDate.getMonth() === today.getMonth() && 
                   bookingDate.getFullYear() === today.getFullYear()
          })
          .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
        
        const lastMonthRevenue = bookings
          .filter((b: any) => {
            const bookingDate = new Date(b.created_at)
            const today = new Date()
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
            return bookingDate.getMonth() === lastMonth.getMonth() && 
                   bookingDate.getFullYear() === lastMonth.getFullYear()
          })
          .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
        
        const revenueGrowth = lastMonthRevenue > 0 
          ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
          : 0
        
        // Create stats array
        const stats: Stat[] = [
          {
            name: 'Total Bookings',
            value: totalBookings.toString(),
            icon: 'Calendar',
            change: `${bookingGrowth > 0 ? '+' : ''}${bookingGrowth}%`,
            changeType: bookingGrowth >= 0 ? 'positive' : 'negative'
          },
          {
            name: 'Confirmed',
            value: confirmedCount.toString(),
            icon: 'CheckCircle',
            change: `${((confirmedCount / totalBookings) * 100).toFixed(0)}%`,
            changeType: 'positive'
          },
          {
            name: 'Pending',
            value: pendingCount.toString(),
            icon: 'Clock',
            change: `${((pendingCount / totalBookings) * 100).toFixed(0)}%`,
            changeType: 'positive'
          },
          {
            name: 'Revenue',
            value: `€${(totalRevenue / 1000).toFixed(1)}k`,
            icon: 'TrendingUp',
            change: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`,
            changeType: revenueGrowth >= 0 ? 'positive' : 'negative'
          }
        ]
        
        // Get recent bookings
        const recentBookings = bookings.slice(0, 5).map((b: any) => ({
          id: b.id.substring(0, 8) + '...',
          guest: b.guest_name || 'Unknown',
          room: b.item_name || 'N/A',
          checkIn: b.check_in ? new Date(b.check_in).toLocaleDateString() : 'N/A',
          status: b.status || 'pending'
        }))
        
        setData({ stats, recentBookings })
      } catch (err) {
        console.error('Dashboard error:', err)
        setError('Error loading dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  const stats = data?.stats || []
  const recentBookings = data?.recentBookings || []
  
  const iconMap: { [key: string]: any } = {
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
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your bookings, rooms, and surf camps from one central location</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = iconMap[stat.icon] || Calendar
          const colors = ['orange', 'green', 'blue', 'purple'] as const
          const color = colors[idx % colors.length]
          return (
            <StatCard
              key={stat.name}
              title={stat.name}
              value={stat.value}
              icon={Icon}
              color={color}
              trend={{
                value: parseInt(stat.change),
                direction: stat.changeType === 'positive' ? 'up' : 'down'
              }}
            />
          )
        })}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            value: '4'
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
            value: '7'
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
            value: stats[1]?.value || '0'
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
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
