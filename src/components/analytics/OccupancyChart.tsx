'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface OccupancyData {
  month: string
  occupancy: number
  totalRooms: number
  occupiedRooms: number
}

export default function OccupancyChart() {
  const [data, setData] = useState<OccupancyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOccupancyData = async () => {
      try {
        setLoading(true)

        // Mock data - will be replaced with real Firebase data
        const mockData: OccupancyData[] = [
          { month: 'Jan', occupancy: 65, totalRooms: 8, occupiedRooms: 5 },
          { month: 'Feb', occupancy: 72, totalRooms: 8, occupiedRooms: 6 },
          { month: 'Mar', occupancy: 68, totalRooms: 8, occupiedRooms: 5 },
          { month: 'Apr', occupancy: 78, totalRooms: 8, occupiedRooms: 6 },
          { month: 'May', occupancy: 82, totalRooms: 8, occupiedRooms: 7 },
          { month: 'Jun', occupancy: 85, totalRooms: 8, occupiedRooms: 7 },
          { month: 'Jul', occupancy: 88, totalRooms: 8, occupiedRooms: 7 },
          { month: 'Aug', occupancy: 91, totalRooms: 8, occupiedRooms: 7 },
          { month: 'Sep', occupancy: 78, totalRooms: 8, occupiedRooms: 6 },
          { month: 'Oct', occupancy: 72, totalRooms: 8, occupiedRooms: 6 },
          { month: 'Nov', occupancy: 68, totalRooms: 8, occupiedRooms: 5 },
          { month: 'Dec', occupancy: 75, totalRooms: 8, occupiedRooms: 6 }
        ]

        // TODO: Replace with real Firebase data fetching
        // const response = await fetch('/api/analytics/occupancy')
        // const realData = await response.json()

        setData(mockData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch occupancy data:', err)
        setError('Failed to load occupancy data')
      } finally {
        setLoading(false)
      }
    }

    fetchOccupancyData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { occupancy: number; month: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Month: ${label}`}</p>
          <p className="text-teal-600">
            {`Occupancy: ${data.occupancy}%`}
          </p>
          <p className="text-gray-600 text-sm">
            {`${data.occupiedRooms}/${data.totalRooms} rooms occupied`}
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
            className="text-teal-600 hover:text-teal-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const currentOccupancy = data[data.length - 1]?.occupancy || 0
  const avgOccupancy = data.reduce((sum, item) => sum + item.occupancy, 0) / data.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
            {currentOccupancy}% Current
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {Math.round(avgOccupancy)}% Average
          </Badge>
        </div>
      </div>

      <div data-testid="occupancy-chart">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
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
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="occupancy"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Room occupancy rate over the past 12 months
        </p>
      </div>
    </div>
  )
}
