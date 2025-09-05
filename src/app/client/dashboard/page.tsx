'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  WavesIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

interface Booking {
  id: string
  campName: string
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'cancelled'
  location: string
  participants: number
  totalAmount: number
}

interface DashboardStats {
  totalBookings: number
  upcomingBookings: number
  completedBookings: number
  totalSpent: number
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        campName: 'Beginner Surf Camp',
        startDate: '2024-02-15',
        endDate: '2024-02-20',
        status: 'confirmed',
        location: 'Heiwa House, Costa Rica',
        participants: 2,
        totalAmount: 1200
      },
      {
        id: '2',
        campName: 'Advanced Surf Camp',
        startDate: '2024-03-10',
        endDate: '2024-03-17',
        status: 'pending',
        location: 'Freedom Routes, Nicaragua',
        participants: 1,
        totalAmount: 800
      }
    ]

    const mockStats: DashboardStats = {
      totalBookings: mockBookings.length,
      upcomingBookings: mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
      completedBookings: 0,
      totalSpent: mockBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    }

    setTimeout(() => {
      setBookings(mockBookings)
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="w-4 h-4" />
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'cancelled': return <AlertCircleIcon className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-oceanBlue-600 to-surfTeal-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <WavesIcon className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Surfer'}!</h1>
            <p className="text-oceanBlue-100">Ready for your next adventure?</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest surf camp reservations</CardDescription>
              </div>
              <Button asChild>
                <Link href="/client/bookings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <WavesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet. Ready to catch some waves?</p>
                <Button className="mt-4" asChild>
                  <Link href="/client/bookings">Book Your First Camp</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-oceanBlue-100 rounded-lg flex items-center justify-center">
                        <WavesIcon className="w-6 h-6 text-oceanBlue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{booking.campName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{booking.startDate} - {booking.endDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{booking.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UsersIcon className="w-4 h-4" />
                            <span>{booking.participants} participant{booking.participants > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
                      </Badge>
                      <div className="text-right">
                        <div className="font-semibold">${booking.totalAmount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Book New Camp</span>
            </CardTitle>
            <CardDescription>Discover and book your next surf adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/client/bookings">Browse Camps</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5" />
              <span>Update Profile</span>
            </CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/client/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <WavesIcon className="w-5 h-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>Customize your surf camp experience</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/client/preferences">Manage Preferences</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
