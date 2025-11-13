'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { GoogleRatingSummary } from '@/components/ui/google-reviews'

interface SurfWeekPromoCardProps {
  surfWeek: {
    id: string
    name?: string
    start_date: string
    end_date: string
    price: number
    images?: string[]
  }
}

export function SurfWeekPromoCard({ surfWeek }: SurfWeekPromoCardProps) {
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const getOrdinal = (day: number) => {
      if (day > 3 && day < 21) return 'th'
      switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
      }
    }
    
    const startFormatted = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const endFormatted = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const year = end.getFullYear()
    
    return `${startFormatted}${getOrdinal(start.getDate())} to ${endFormatted}${getOrdinal(end.getDate())}, ${year}!`
  }

  const handleBookNow = () => {
    if (surfWeek.id) {
      window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: surfWeek.id }))
    } else {
      window.dispatchEvent(new CustomEvent('openBooking'))
    }
  }

  const groupPhoto = surfWeek.images?.[0] || '/images/surf-weeks-front-page.jpg'

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-100">
      {/* Date Header */}
      <div className="text-center py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">
          {formatDateRange(surfWeek.start_date, surfWeek.end_date)}
        </h3>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Group Photo */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[400px]">
          <Image
            src={groupPhoto}
            alt={surfWeek.name || 'Surf Week Group Photo'}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Right: Bullet Points */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <ul className="space-y-4 text-gray-700 italic mb-8">
            <li className="flex items-start gap-3">
              <span className="text-gray-900 font-normal">-</span>
              <span>Professional instructors for all levels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-900 font-normal">-</span>
              <span>Amazing food prepared by our chef</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-900 font-normal">-</span>
              <span>Daily yoga and meditation sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-900 font-normal">-</span>
              <span>Surfskate and other activities!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-900 font-normal">-</span>
              <span>Prices starting from EUR {surfWeek.price || 450}!</span>
            </li>
          </ul>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="w-full lg:w-auto px-8 py-4 bg-orange-500 border-2 border-black text-black font-bold text-lg rounded-lg hover:bg-orange-600 transition-colors mb-6"
            style={{ backgroundColor: '#ec681c', borderColor: '#000' }}
          >
            Book Now
          </button>

          {/* Google Reviews */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-sm text-gray-600">
              <GoogleRatingSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

