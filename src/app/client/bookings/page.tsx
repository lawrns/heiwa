'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  WavesIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  XIcon
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface Booking {
  id: string
  campName: string
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  location: string
  participants: number
  totalAmount: number
  description: string
  brand: 'Heiwa House' | 'Freedom Routes'
}

interface AvailableCamp {
  id: string
  name: string
  location: string
  duration: string
  price: number
  description: string
  brand: 'Heiwa House' | 'Freedom Routes'
  availableDates: string[]
}

export default function ClientBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableCamps, setAvailableCamps] = useState<AvailableCamp[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'my-bookings' | 'available-camps'>('my-bookings')

  // Mock data
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
        totalAmount: 1200,
        description: 'Perfect for beginners with daily lessons and equipment included',
        brand: 'Heiwa House'
      },
      {
        id: '2',
        campName: 'Advanced Surf Camp',
        startDate: '2024-03-10',
        endDate: '2024-03-17',
        status: 'pending',
        location: 'Freedom Routes, Nicaragua',
        participants: 1,
        totalAmount: 800,
        description: 'Advanced techniques and big wave training',
        brand: 'Freedom Routes'
      },
      {
        id: '3',
        campName: 'Family Surf Camp',
        startDate: '2024-01-05',
        endDate: '2024-01-12',
        status: 'completed',
        location: 'Heiwa House, Costa Rica',
        participants: 4,
        totalAmount: 2400,
        description: 'Family-friendly camp with activities for all ages',
        brand: 'Heiwa House'
      }
    ]

    const mockAvailableCamps: AvailableCamp[] = [
      {
        id: '4',
        name: 'Intermediate Surf Camp',
        location: 'Heiwa House, Costa Rica',
        duration: '7 days',
        price: 900,
        description: 'Take your surfing to the next level with intermediate techniques',
        brand: 'Heiwa House',
        availableDates: ['2024-04-01', '2024-04-15', '2024-05-01']
      },
      {
        id: '5',
        name: 'Yoga & Surf Retreat',
        location: 'Freedom Routes, Nicaragua',
        duration: '10 days',
        price: 1400,
        description: 'Combine surfing with daily yoga sessions for mind and body wellness',
        brand: 'Freedom Routes',
        availableDates: ['2024-04-20', '2024-05-10', '2024-06-01']
      },
      {
        id: '6',
        name: 'Pro Surf Training',
        location: 'Freedom Routes, Nicaragua',
        duration: '14 days',
        price: 2200,
        description: 'Intensive training for competitive surfers',
        brand: 'Freedom Routes',
        availableDates: ['2024-05-15', '2024-06-15', '2024-07-01']
      }
    ]

    setTimeout(() => {
      setBookings(mockBookings)
      setAvailableCamps(mockAvailableCamps)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBrandColor = (brand: string) => {
    return brand === 'Heiwa House' ? 'bg-oceanBlue-100 text-oceanBlue-800' : 'bg-surfTeal-100 text-surfTeal-800'
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.campName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesBrand = brandFilter === 'all' || booking.brand === brandFilter
    return matchesSearch && matchesStatus && matchesBrand
  })

  const filteredCamps = availableCamps.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camp.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = brandFilter === 'all' || camp.brand === brandFilter
    return matchesSearch && matchesBrand
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage your surf camp reservations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-bookings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Bookings
        </button>
        <button
          onClick={() => setActiveTab('available-camps')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available-camps'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Camps
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search camps or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'my-bookings' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="Heiwa House">Heiwa House</SelectItem>
                <SelectItem value="Freedom Routes">Freedom Routes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'my-bookings' ? (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <WavesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || brandFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Ready to book your first surf camp?'}
                </p>
                <Button onClick={() => setActiveTab('available-camps')}>
                  Browse Available Camps
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-oceanBlue-100 rounded-lg flex items-center justify-center">
                          <WavesIcon className="w-8 h-8 text-oceanBlue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{booking.campName}</h3>
                            <Badge className={getBrandColor(booking.brand)}>
                              {booking.brand}
                            </Badge>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{booking.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
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
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">${booking.totalAmount}</div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                <EditIcon className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline">
                                <XIcon className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCamps.map((camp) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{camp.name}</CardTitle>
                    <Badge className={getBrandColor(camp.brand)}>
                      {camp.brand}
                    </Badge>
                  </div>
                  <CardDescription>{camp.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{camp.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{camp.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-900">${camp.price}</div>
                    <Button>
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
