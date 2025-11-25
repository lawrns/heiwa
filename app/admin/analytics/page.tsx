'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Home, Filter } from 'lucide-react'

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  growth: number
  thisMonthRevenue: number
  lastMonthRevenue: number
}

interface OccupancyData {
  overallOccupancyRate: number
  totalCapacity: number
  totalOccupied: number
  totalAvailable: number
  roomOccupancy: Array<{
    roomId: string
    roomName: string
    capacity: number
    occupied: number
    available: number
    occupancyRate: number
  }>
}

interface ClientsData {
  totalClients: number
  monthlyGrowth: Array<{ month: string; count: number }>
  growth: number
  thisMonthClients: number
  lastMonthClients: number
}

interface BookingsData {
  statusCounts: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
  }
  monthlyTrends: Array<{
    month: string
    total: number
    confirmed: number
    pending: number
    cancelled: number
  }>
  growth: number
  thisMonthBookings: number
  lastMonthBookings: number
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null)
  const [clientsData, setClientsData] = useState<ClientsData | null>(null)
  const [bookingsData, setBookingsData] = useState<BookingsData | null>(null)
  
  // Filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6) // Default to last 6 months
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [brand, setBrand] = useState<string>('all')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (startDate) params.set('start_date', startDate)
      if (endDate) params.set('end_date', endDate)
      if (brand !== 'all') params.set('brand', brand)

      const [revenueRes, occupancyRes, clientsRes, bookingsRes] = await Promise.all([
        fetch(`/api/analytics/revenue?${params.toString()}`),
        fetch(`/api/analytics/occupancy?${params.toString()}`),
        fetch(`/api/analytics/clients?${params.toString()}`),
        fetch(`/api/analytics/bookings?${params.toString()}`)
      ])

      const [revenue, occupancy, clients, bookings] = await Promise.all([
        revenueRes.json(),
        occupancyRes.json(),
        clientsRes.json(),
        bookingsRes.json()
      ])

      if (revenue.success) setRevenueData(revenue.data)
      if (occupancy.success) setOccupancyData(occupancy.data)
      if (clients.success) setClientsData(clients.data)
      if (bookings.success) setBookingsData(bookings.data)

    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, brand])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights into your business performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Brands</option>
              <option value="Heiwa House">Heiwa House</option>
              <option value="FreedomRoutes">FreedomRoutes</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                €{revenueData?.totalRevenue.toLocaleString() || '0'}
              </p>
              {revenueData && (
                <p className={`text-sm mt-1 ${revenueData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueData.growth >= 0 ? '+' : ''}{revenueData.growth.toFixed(1)}% vs last month
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {occupancyData?.overallOccupancyRate.toFixed(1) || '0'}%
              </p>
              {occupancyData && (
                <p className="text-sm text-gray-600 mt-1">
                  {occupancyData.totalOccupied} / {occupancyData.totalCapacity} rooms
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {clientsData?.totalClients || '0'}
              </p>
              {clientsData && (
                <p className={`text-sm mt-1 ${clientsData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {clientsData.growth >= 0 ? '+' : ''}{clientsData.growth.toFixed(1)}% vs last month
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bookingsData?.statusCounts.total || '0'}
              </p>
              {bookingsData && (
                <p className={`text-sm mt-1 ${bookingsData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bookingsData.growth >= 0 ? '+' : ''}{bookingsData.growth.toFixed(1)}% vs last month
                </p>
              )}
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Revenue
          </h3>
          {revenueData && revenueData.monthlyRevenue.length > 0 ? (
            <div className="space-y-2">
              {revenueData.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(item.revenue / Math.max(...revenueData.monthlyRevenue.map(r => r.revenue))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-semibold">€{item.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available</p>
          )}
        </div>

        {/* Booking Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Booking Trends
          </h3>
          {bookingsData && bookingsData.monthlyTrends.length > 0 ? (
            <div className="space-y-2">
              {bookingsData.monthlyTrends.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-green-500"
                        style={{ width: `${(item.confirmed / item.total) * 100}%` }}
                      />
                      <div
                        className="bg-yellow-500"
                        style={{ width: `${(item.pending / item.total) * 100}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${(item.cancelled / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-semibold">{item.total}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No booking data available</p>
          )}
        </div>

        {/* Client Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Growth
          </h3>
          {clientsData && clientsData.monthlyGrowth.length > 0 ? (
            <div className="space-y-2">
              {clientsData.monthlyGrowth.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${(item.count / Math.max(...clientsData.monthlyGrowth.map(c => c.count), 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-semibold">{item.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No client data available</p>
          )}
        </div>

        {/* Room Occupancy */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="h-5 w-5" />
            Room Occupancy
          </h3>
          {occupancyData && occupancyData.roomOccupancy.length > 0 ? (
            <div className="space-y-3">
              {occupancyData.roomOccupancy.map((room) => (
                <div key={room.roomId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{room.roomName}</span>
                    <span className="text-gray-600">{room.occupancyRate}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        room.occupancyRate >= 80 ? 'bg-red-500' :
                        room.occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${room.occupancyRate}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {room.occupied} / {room.capacity} beds
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No occupancy data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

