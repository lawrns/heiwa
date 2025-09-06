'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TrendingUpIcon } from 'lucide-react'

interface ClientData {
  month: string
  newClients: number
  totalClients: number
  heiwaHouse: number
  freedomRoutes: number
}

export default function ClientAcquisition() {
  const [data, setData] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)

        // Mock data - will be replaced with real Firebase data
        const mockData: ClientData[] = [
          { month: 'Jan', newClients: 8, totalClients: 95, heiwaHouse: 5, freedomRoutes: 3 },
          { month: 'Feb', newClients: 12, totalClients: 107, heiwaHouse: 7, freedomRoutes: 5 },
          { month: 'Mar', newClients: 6, totalClients: 113, heiwaHouse: 4, freedomRoutes: 2 },
          { month: 'Apr', newClients: 15, totalClients: 128, heiwaHouse: 9, freedomRoutes: 6 },
          { month: 'May', newClients: 18, totalClients: 146, heiwaHouse: 11, freedomRoutes: 7 },
          { month: 'Jun', newClients: 14, totalClients: 160, heiwaHouse: 8, freedomRoutes: 6 },
          { month: 'Jul', newClients: 22, totalClients: 182, heiwaHouse: 13, freedomRoutes: 9 },
          { month: 'Aug', newClients: 25, totalClients: 207, heiwaHouse: 15, freedomRoutes: 10 },
          { month: 'Sep', newClients: 19, totalClients: 226, heiwaHouse: 12, freedomRoutes: 7 },
          { month: 'Oct', newClients: 16, totalClients: 242, heiwaHouse: 10, freedomRoutes: 6 },
          { month: 'Nov', newClients: 11, totalClients: 253, heiwaHouse: 7, freedomRoutes: 4 },
          { month: 'Dec', newClients: 8, totalClients: 261, heiwaHouse: 5, freedomRoutes: 3 }
        ]

        // TODO: Replace with real Firebase data fetching
        // const response = await fetch('/api/analytics/clients')
        // const realData = await response.json()

        setData(mockData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch client data:', err)
        setError('Failed to load client data')
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { count: number; month: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Month: ${label}`}</p>
          <p className="text-purple-600">
            {`New Clients: ${data.newClients}`}
          </p>
          <p className="text-gray-600 text-sm">
            {`Total: ${data.totalClients}`}
          </p>
          <div className="text-xs text-gray-500 mt-1">
            <p>Heiwa House: {data.heiwaHouse}</p>
            <p>Freedom Routes: {data.freedomRoutes}</p>
          </div>
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
            className="text-purple-600 hover:text-purple-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const totalNewClients = data.reduce((sum, item) => sum + item.newClients, 0)
  const latestMonth = data[data.length - 1]
  const previousMonth = data[data.length - 2]
  const growthRate = previousMonth
    ? ((latestMonth.newClients - previousMonth.newClients) / previousMonth.newClients * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            +{totalNewClients} This Year
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center">
            <TrendingUpIcon className="w-3 h-3 mr-1" />
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          Total: {latestMonth?.totalClients || 0}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="newClients"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#clientGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-hhBlue-600 rounded mr-1"></div>
          <span>Heiwa House</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
          <span>Freedom Routes</span>
        </div>
      </div>
    </div>
  )
}

