'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3Icon, TrendingUpIcon, UsersIcon, CalendarIcon, DownloadIcon, FilterIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RevenueChart from '@/components/analytics/RevenueChart'
import OccupancyChart from '@/components/analytics/OccupancyChart'
import BookingTrendsChart from '@/components/analytics/BookingTrendsChart'
import ClientAcquisition from '@/components/analytics/ClientAcquisition'
import ConversionFunnel from '@/components/analytics/ConversionFunnel'
import { exportAnalyticsData } from '@/lib/analytics/export'

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [brandFilter, setBrandFilter] = useState('all')

  useEffect(() => {
    setIsClient(true)

    // Set default date range (last 12 months)
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)

    setDateRange({
      start: twelveMonthsAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    })
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportAnalyticsData()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Prevent SSR rendering to avoid Firebase prerendering errors
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
      {/* Dashboard Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <BarChart3Icon className="w-8 h-8 text-hhBlue-600 mr-3" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track revenue, occupancy, and client metrics for Heiwa House
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-hhBlue-600 hover:bg-hhBlue-700 text-white flex items-center space-x-2"
          data-testid="export-csv"
        >
          <DownloadIcon className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Download Report'}</span>
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FilterIcon className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>
            Filter analytics data by date range and brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                data-testid="date-filter"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="brand-filter">Brand</Label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger data-testid="brand-filter">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="heiwa-house">Heiwa House</SelectItem>
                  <SelectItem value="freedom-routes">Freedom Routes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-hhBlue-50 to-hhBlue-100 border-hhBlue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-hhBlue-800">Total Revenue</CardTitle>
              <TrendingUpIcon className="w-4 h-4 text-hhBlue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hhBlue-900">$24,750</div>
            <div className="text-xs text-hhBlue-600 mt-1">
              <Badge variant="secondary" className="bg-hhBlue-200 text-hhBlue-800">+12.5%</Badge>
              {' '}from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-teal-800">Occupancy Rate</CardTitle>
              <CalendarIcon className="w-4 h-4 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">78%</div>
            <div className="text-xs text-teal-600 mt-1">
              <Badge variant="secondary" className="bg-teal-200 text-teal-800">+5.2%</Badge>
              {' '}from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800">Total Clients</CardTitle>
              <UsersIcon className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">127</div>
            <div className="text-xs text-purple-600 mt-1">
              <Badge variant="secondary" className="bg-purple-200 text-purple-800">+8</Badge>
              {' '}new this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-800">Booking Rate</CardTitle>
              <BarChart3Icon className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">68%</div>
            <div className="text-xs text-orange-600 mt-1">
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">+3.1%</Badge>
              {' '}conversion rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center">
              <TrendingUpIcon className="w-5 h-5 text-hhBlue-600 mr-2" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>
              Track revenue trends over time with monthly breakdowns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        {/* Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center">
              <CalendarIcon className="w-5 h-5 text-teal-600 mr-2" />
              Occupancy Rate
            </CardTitle>
            <CardDescription>
              Room occupancy percentage by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OccupancyChart />
          </CardContent>
        </Card>

        {/* Client Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center">
              <UsersIcon className="w-5 h-5 text-purple-600 mr-2" />
              Client Acquisition
            </CardTitle>
            <CardDescription>
              New client registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientAcquisition />
          </CardContent>
        </Card>
      </div>

      {/* Booking Trends Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center">
            <TrendingUpIcon className="w-5 h-5 text-blue-600 mr-2" />
            Booking Trends
          </CardTitle>
          <CardDescription>
            Track booking patterns and status breakdown over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingTrendsChart />
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center">
            <BarChart3Icon className="w-5 h-5 text-orange-600 mr-2" />
            Booking Conversion Funnel
          </CardTitle>
          <CardDescription>
            Track the customer journey from visitor to booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConversionFunnel />
        </CardContent>
      </Card>
    </div>
  )
}
