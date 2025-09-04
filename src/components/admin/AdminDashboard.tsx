'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CalendarIcon,
  BedIcon,
  Waves,
  UsersIcon,
  Calendar,
  BarChart3Icon
} from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your bookings, rooms, and surf camps from one central location
        </p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {/* Bookings Management Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white border-gray-200 hover:border-blue-500/50 transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Bookings Management</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                View and manage all bookings for rooms and surf camps.
              </CardDescription>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700 text-sm">~ 12 Active Bookings</span>
              </div>
              <Link href="/admin/bookings" className="mt-auto">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Manage Bookings"
                >
                  Manage Bookings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rooms Management Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white border-gray-200 hover:border-green-500/50 transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <BedIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Rooms Management</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                Manage room inventory, pricing, and availability.
              </CardDescription>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-700 text-sm">~ 8 Available Rooms</span>
              </div>
              <Link href="/admin/rooms" className="mt-auto">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  aria-label="Manage Rooms"
                >
                  Manage Rooms
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Surf Camps Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white border-gray-200 hover:border-teal-500/50 transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                  <Waves className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Surf Camps</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                Create and manage surf camp sessions and schedules.
              </CardDescription>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <span className="text-gray-700 text-sm">~ 3 Active Camps</span>
              </div>
              <Link href="/admin/surfcamps" className="mt-auto">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  aria-label="Manage Surf Camps"
                >
                  Manage Surf Camps
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clients Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white border-gray-200 hover:border-purple-500/50 transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <UsersIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Clients</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                View and manage client information and history.
              </CardDescription>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700 text-sm">~ 45 Total Clients</span>
              </div>
              <Link href="/admin/clients" className="mt-auto">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  aria-label="Manage Clients"
                >
                  Manage Clients
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white border-gray-200 hover:border-orange-500/50 transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Calendar</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                View booking calendar and manage schedules.
              </CardDescription>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                <span className="text-gray-700 text-sm">~ 15 Events This Week</span>
              </div>
              <Link href="/admin/calendar" className="mt-auto">
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  aria-label="View Calendar"
                >
                  View Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-white border-gray-200 hover:border-gray-500/50 transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-500/10 rounded-lg border border-gray-500/20">
                  <BarChart3Icon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 text-lg">Analytics</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <CardDescription className="text-gray-600 mb-4 flex-1">
                View booking statistics and revenue reports.
              </CardDescription>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-700 text-sm">~ 80% Occupancy Rate</span>
              </div>
              <div className="mb-4">
                <Progress value={80} className="h-2" />
              </div>
              <Link href="/admin/analytics" className="mt-auto">
                <Button
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  aria-label="View Analytics"
                >
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
