'use client'

import { useEffect, useState } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)

        // For now, using mock data - will be replaced with real Firebase data
        const mockData: RevenueData[] = [
          { month: 'Jan', revenue: 18500, bookings: 12 },
          { month: 'Feb', revenue: 21200, bookings: 15 },
          { month: 'Mar', revenue: 19800, bookings: 14 },
          { month: 'Apr', revenue: 22300, bookings: 18 },
          { month: 'May', revenue: 25600, bookings: 22 },
          { month: 'Jun', revenue: 24750, bookings: 20 },
          { month: 'Jul', revenue: 26800, bookings: 24 },
          { month: 'Aug', revenue: 28900, bookings: 26 },
          { month: 'Sep', revenue: 31200, bookings: 28 },
          { month: 'Oct', revenue: 33400, bookings: 31 },
          { month: 'Nov', revenue: 35800, bookings: 35 },
          { month: 'Dec', revenue: 24750, bookings: 20 }
        ]

        // TODO: Replace with real Firebase data fetching
        // const response = await fetch('/api/analytics/revenue')
        // const realData = await response.json()

        setData(mockData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch revenue data:', err)
        setError('Failed to load revenue data')
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { revenue: number; month: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Month: ${label}`}</p>
          <p className="text-hhBlue-600">
            {`Revenue: ${formatCurrency(data.revenue)}`}
          </p>
          <p className="text-gray-600 text-sm">
            {`Bookings: ${data.bookings}`}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-hhBlue-600 hover:text-hhBlue-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0)
  const avgRevenue = totalRevenue / data.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-hhBlue-100 text-hhBlue-800">
            {formatCurrency(totalRevenue)} Total
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {totalBookings} Bookings
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          Avg: {formatCurrency(avgRevenue)}
        </div>
      </div>

      <div data-testid="revenue-chart">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
