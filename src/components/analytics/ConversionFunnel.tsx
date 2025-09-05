'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowDownIcon, UsersIcon, UserCheckIcon, CalendarIcon } from 'lucide-react'

interface FunnelStep {
  stage: string
  count: number
  percentage: number
  icon: any
  color: string
  bgColor: string
}

export default function ConversionFunnel() {
  const [data, setData] = useState<FunnelStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        setLoading(true)

        // Mock data - will be replaced with real Firebase data
        const visitors = 1000
        const leads = 350
        const bookings = 120

        const funnelData: FunnelStep[] = [
          {
            stage: 'Website Visitors',
            count: visitors,
            percentage: 100,
            icon: UsersIcon,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100'
          },
          {
            stage: 'Leads/Inquiries',
            count: leads,
            percentage: (leads / visitors) * 100,
            icon: UserCheckIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          },
          {
            stage: 'Confirmed Bookings',
            count: bookings,
            percentage: (bookings / visitors) * 100,
            icon: CalendarIcon,
            color: 'text-hhBlue-600',
            bgColor: 'bg-hhBlue-100'
          }
        ]

        // TODO: Replace with real Firebase data fetching
        // const response = await fetch('/api/analytics/funnel')
        // const realData = await response.json()

        setData(funnelData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch funnel data:', err)
        setError('Failed to load funnel data')
      } finally {
        setLoading(false)
      }
    }

    fetchFunnelData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Funnel</h3>
        <p className="text-sm text-gray-600">Track customer journey from visitor to booking</p>
      </div>

      <div className="space-y-4">
        {data.map((step, index) => {
          const nextStep = data[index + 1]
          const dropOffRate = nextStep ? ((step.count - nextStep.count) / step.count * 100) : 0

          return (
            <div key={step.stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${step.bgColor}`}>
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{step.stage}</p>
                    <p className="text-sm text-gray-600">{step.count.toLocaleString()} people</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    {step.percentage.toFixed(1)}%
                  </Badge>
                  {nextStep && (
                    <div className="flex items-center text-xs text-red-600 mt-1">
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                      {dropOffRate.toFixed(1)}% drop-off
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <Progress
                  value={step.percentage}
                  className="h-8 bg-gray-100"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
                  style={{
                    background: `linear-gradient(90deg, ${step.bgColor.replace('bg-', '').replace('-100', '')} 0%, ${step.color.replace('text-', '').replace('-600', '')} ${step.percentage}%, transparent ${step.percentage}%)`,
                    borderRadius: '4px'
                  }}
                />
              </div>

              {index < data.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDownIcon className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-hhBlue-600">
              {((data[2]?.count || 0) / (data[0]?.count || 1) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Overall Conversion</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {((data[1]?.count || 0) / (data[0]?.count || 1) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Lead Generation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

