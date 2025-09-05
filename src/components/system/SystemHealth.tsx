'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DatabaseIcon,
  CloudIcon,
  ServerIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  RefreshCwIcon,
  ActivityIcon
} from 'lucide-react'

interface HealthMetric {
  service: string
  status: 'healthy' | 'warning' | 'error'
  latency?: number
  uptime?: number
  quota?: number
  details?: string
}

interface IndexStatus {
  name: string
  state: 'CREATED' | 'CREATING' | 'ERROR'
  queryScope: string
}

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [indexes, setIndexes] = useState<IndexStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchSystemHealth()
  }, [])

  const fetchSystemHealth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data - will be replaced with real Firebase monitoring API calls
      const mockMetrics: HealthMetric[] = [
        {
          service: 'Firestore Database',
          status: 'healthy',
          latency: 45,
          uptime: 99.9,
          quota: 85,
          details: 'All operations normal'
        },
        {
          service: 'Firebase Auth',
          status: 'healthy',
          latency: 32,
          uptime: 99.8,
          quota: 92,
          details: 'Authentication services operational'
        },
        {
          service: 'Cloud Storage',
          status: 'warning',
          latency: 120,
          uptime: 99.5,
          quota: 78,
          details: 'Higher latency detected'
        },
        {
          service: 'Cloud Functions',
          status: 'healthy',
          latency: 25,
          uptime: 99.7,
          quota: 45,
          details: 'All functions responding'
        }
      ]

      const mockIndexes: IndexStatus[] = [
        { name: 'clients_email', state: 'CREATED', queryScope: 'COLLECTION' },
        { name: 'bookings_date', state: 'CREATED', queryScope: 'COLLECTION' },
        { name: 'rooms_availability', state: 'CREATING', queryScope: 'COLLECTION' },
        { name: 'audit_logs_timestamp', state: 'CREATED', queryScope: 'COLLECTION' }
      ]

      // TODO: Replace with real Firebase monitoring API calls
      // const response = await fetch('/api/system/health')
      // const realData = await response.json()

      setMetrics(mockMetrics)
      setIndexes(mockIndexes)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to fetch system health:', err)
      setError('Failed to load system health data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-orange-600" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-orange-100 text-orange-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIndexStatusColor = (state: string) => {
    switch (state) {
      case 'CREATED':
        return 'bg-green-100 text-green-800'
      case 'CREATING':
        return 'bg-blue-100 text-blue-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DatabaseIcon className="w-6 h-6 text-oceanBlue-600 mr-2" />
            System Health Monitoring
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor Firebase services and system performance
          </p>
        </div>
        <Button
          onClick={fetchSystemHealth}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCwIcon className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Last updated: {lastRefresh.toLocaleString()}
      </div>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.service}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  {metric.service === 'Firestore Database' && <DatabaseIcon className="w-5 h-5 mr-2" />}
                  {metric.service === 'Firebase Auth' && <ShieldIcon className="w-5 h-5 mr-2" />}
                  {metric.service === 'Cloud Storage' && <CloudIcon className="w-5 h-5 mr-2" />}
                  {metric.service === 'Cloud Functions' && <ServerIcon className="w-5 h-5 mr-2" />}
                  {metric.service}
                </CardTitle>
                {getStatusIcon(metric.status)}
              </div>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {metric.latency && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Latency</span>
                    <span>{metric.latency}ms</span>
                  </div>
                  <Progress value={Math.min(metric.latency / 2, 100)} className="h-2" />
                </div>
              )}

              {metric.uptime && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uptime</span>
                    <span>{metric.uptime}%</span>
                  </div>
                  <Progress value={metric.uptime} className="h-2" />
                </div>
              )}

              {metric.quota && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quota Usage</span>
                    <span>{metric.quota}%</span>
                  </div>
                  <Progress value={metric.quota} className="h-2" />
                </div>
              )}

              {metric.details && (
                <p className="text-sm text-gray-600">{metric.details}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Firestore Indexes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <DatabaseIcon className="w-5 h-5 text-oceanBlue-600 mr-2" />
            Firestore Indexes
          </CardTitle>
          <CardDescription>
            Status of database indexes for optimal query performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {indexes.map((index) => (
              <div key={index.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{index.name}</p>
                  <p className="text-sm text-gray-600">{index.queryScope}</p>
                </div>
                <Badge className={getIndexStatusColor(index.state)}>
                  {index.state}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <ActivityIcon className="w-5 h-5 text-oceanBlue-600 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics.filter(m => m.status === 'healthy').length}
              </div>
              <p className="text-sm text-gray-600">Healthy Services</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <p className="text-sm text-gray-600">Services with Warnings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {Math.round(metrics.reduce((acc, m) => acc + (m.uptime || 0), 0) / metrics.length)}%
              </div>
              <p className="text-sm text-gray-600">Average Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
