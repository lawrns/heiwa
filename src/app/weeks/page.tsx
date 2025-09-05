'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  SearchIcon,
  FilterIcon,
  WavesIcon,
  DollarSignIcon
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
}

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<CampWeek[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'spots'>('date')
  const [loading, setLoading] = useState(true)

  // Mock data for development
  useEffect(() => {
    const mockWeeks: CampWeek[] = [
      {
        id: 'week-1',
        campId: 'camp-1',
        startDate: '2024-03-15',
        endDate: '2024-03-22',
        category: 'Heiwa',
        published: true,
        maxGuests: 12,
        pricingRules: { basePrice: 1200, currency: 'MXN' },
        spotsLeft: 8
      },
      {
        id: 'week-2',
        campId: 'camp-2',
        startDate: '2024-03-22',
        endDate: '2024-03-29',
        category: 'FreedomRoutes',
        published: true,
        maxGuests: 8,
        pricingRules: { basePrice: 1500, currency: 'MXN' },
        spotsLeft: 3
      },
      {
        id: 'week-3',
        campId: 'camp-3',
        startDate: '2024-04-01',
        endDate: '2024-04-08',
        category: 'Heiwa',
        published: true,
        maxGuests: 10,
        pricingRules: { basePrice: 1100, currency: 'MXN' },
        spotsLeft: 10
      }
    ]

    setTimeout(() => {
      setWeeks(mockWeeks)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredAndSortedWeeks = useMemo(() => {
    let filtered = weeks.filter(week => {
      const matchesSearch = week.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           week.startDate.includes(searchTerm)
      const matchesCategory = categoryFilter === 'all' || week.category === categoryFilter
      return matchesSearch && matchesCategory && week.published
    })

    // Sort weeks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case 'price':
          return a.pricingRules.basePrice - b.pricingRules.basePrice
        case 'spots':
          return b.spotsLeft - a.spotsLeft
        default:
          return 0
      }
    })

    return filtered
  }, [weeks, searchTerm, categoryFilter, sortBy])

  const getCategoryColor = (category: string) => {
    return category === 'Heiwa' ? 'bg-oceanBlue-100 text-oceanBlue-800' : 'bg-surfTeal-100 text-surfTeal-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oceanBlue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available weeks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-900">Available Surf Weeks</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your perfect surf adventure from our curated Freedom Routes and Heiwa House weeks
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-center"
      >
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search weeks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Heiwa">Heiwa House</SelectItem>
            <SelectItem value="FreedomRoutes">Freedom Routes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="spots">Spots Left</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Weeks Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredAndSortedWeeks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <WavesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No weeks found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new weeks.</p>
          </div>
        ) : (
          filteredAndSortedWeeks.map((week, index) => (
            <motion.div
              key={week.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(week.category)}>
                      {week.category}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${week.pricingRules.basePrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{week.pricingRules.currency}</div>
                    </div>
                  </div>

                  <CardTitle className="text-lg">
                    {formatDate(week.startDate)} - {formatDate(week.endDate)}
                  </CardTitle>

                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>7 days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{week.spotsLeft} spots left</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max guests:</span>
                    <span className="font-medium">{week.maxGuests}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available spots:</span>
                    <Badge variant={week.spotsLeft > 5 ? 'default' : 'destructive'}>
                      {week.spotsLeft} left
                    </Badge>
                  </div>

                  <Button
                    className="w-full"
                    asChild
                    disabled={week.spotsLeft === 0}
                  >
                    <Link href={`/weeks/${week.id}`}>
                      {week.spotsLeft === 0 ? 'Sold Out' : 'View Details & Book'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center text-gray-600"
      >
        <p>Showing {filteredAndSortedWeeks.length} of {weeks.length} available weeks</p>
      </motion.div>
    </div>
  )
}

