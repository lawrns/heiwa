'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  WavesIcon,
  DollarSignIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon
} from 'lucide-react'
import Link from 'next/link'

interface CampWeek {
  id: string
  campId: string
  startDate: string
  endDate: string
  category: 'FreedomRoutes' | 'Heiwa'
  published: boolean
  maxGuests: number
  pricingRules: {
    basePrice: number
    currency: string
  }
  spotsLeft: number
  description: string
  location: string
  features: string[]
  included: string[]
}

interface RoomAvailability {
  id: string
  name: string
  type: 'private' | 'dorm'
  capacity: number
  available: number
  price: number
  amenities: string[]
}

export default function WeekDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [week, setWeek] = useState<CampWeek | null>(null)
  const [rooms, setRooms] = useState<RoomAvailability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for development
    const mockWeek: CampWeek = {
      id: params.weekId as string,
      campId: 'camp-1',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      category: 'Heiwa',
      published: true,
      maxGuests: 12,
      pricingRules: { basePrice: 1200, currency: 'MXN' },
      spotsLeft: 8,
      description: 'Join us for an incredible week of surfing at our beautiful beachfront location. This week combines world-class waves with authentic local culture and incredible food.',
      location: 'Mazatlan, Mexico',
      features: [
        'Professional surf instruction',
        'Beachfront accommodation',
        'Daily yoga sessions',
        'Cultural excursions',
        'Fresh local cuisine',
        'Airport transfers'
      ],
      included: [
        '7 nights accommodation',
        'Daily surf lessons',
        'All meals and snacks',
        'Beach equipment',
        'Airport pickup and drop-off'
      ]
    }

    const mockRooms: RoomAvailability[] = [
      {
        id: 'room-1',
        name: 'Ocean View Suite',
        type: 'private',
        capacity: 2,
        available: 2,
        price: 1400,
        amenities: ['Private bathroom', 'Ocean view', 'Balcony', 'WiFi']
      },
      {
        id: 'room-2',
        name: 'Garden Bungalow',
        type: 'private',
        capacity: 2,
        available: 1,
        price: 1200,
        amenities: ['Private bathroom', 'Garden view', 'Kitchen', 'WiFi']
      },
      {
        id: 'room-3',
        name: 'Beachfront Dorm',
        type: 'dorm',
        capacity: 8,
        available: 5,
        price: 800,
        amenities: ['Shared bathroom', 'Beach access', 'WiFi', 'Lockers']
      }
    ]

    setTimeout(() => {
      setWeek(mockWeek)
      setRooms(mockRooms)
      setLoading(false)
    }, 1000)
  }, [params.weekId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    return category === 'Heiwa' ? 'bg-oceanBlue-100 text-oceanBlue-800' : 'bg-surfTeal-100 text-surfTeal-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading week details...</p>
        </div>
      </div>
    )
  }

  if (!week) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Week not found</h2>
        <p className="text-gray-600 mb-4">The requested week could not be found.</p>
        <Button asChild>
          <Link href="/weeks">Back to Weeks</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to weeks
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {formatDate(week.startDate)}
              </h1>
              <Badge className={getCategoryColor(week.category)}>
                {week.category}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{week.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-4 h-4" />
                <span>{week.spotsLeft} spots available</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSignIcon className="w-4 h-4" />
                <span>From ${week.pricingRules.basePrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${week.pricingRules.basePrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{week.pricingRules.currency} per person</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{week.description}</p>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {week.included.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Week Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {week.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <WavesIcon className="w-4 h-4 text-oceanBlue-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Booking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Availability Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>Availability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Spots remaining:</span>
                <Badge variant={week.spotsLeft > 5 ? 'default' : 'destructive'}>
                  {week.spotsLeft} of {week.maxGuests}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Week starts:</span>
                <span className="text-sm font-medium">
                  {new Date(week.startDate).toLocaleDateString()}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Base price per person:</span>
                  <span className="font-medium">${week.pricingRules.basePrice.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Taxes and fees may apply
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Availability Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Room Availability</CardTitle>
              <CardDescription>Current availability snapshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{room.name}</div>
                    <div className="text-gray-600">
                      {room.available}/{room.capacity} available
                    </div>
                  </div>
                  <Badge variant={room.available > 0 ? 'default' : 'secondary'}>
                    {room.available > 0 ? 'Available' : 'Full'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Book Now CTA */}
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                size="lg"
                asChild
                disabled={week.spotsLeft === 0}
              >
                <Link href={`/checkout/${week.id}`}>
                  {week.spotsLeft === 0 ? 'Sold Out' : 'Book This Week'}
                </Link>
              </Button>

              {week.spotsLeft === 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  This week is fully booked. Check back later or browse other weeks.
                </p>
              )}

              {week.spotsLeft > 0 && week.spotsLeft <= 3 && (
                <p className="text-center text-sm text-orange-600 mt-2">
                  Only {week.spotsLeft} spot{week.spotsLeft > 1 ? 's' : ''} left!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

