'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

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
    if (typeof window !== 'undefined') {
      if (surfWeek.id) {
        window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: surfWeek.id }))
      } else {
        window.dispatchEvent(new CustomEvent('openBooking'))
      }
    }
  }

  const groupPhoto = surfWeek.images?.[0] || '/images/surf-weeks-front-page.jpg'

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Date Header */}
      <div className="text-center py-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-3xl font-bold text-gray-900">
          {formatDateRange(surfWeek.start_date, surfWeek.end_date)}
        </h3>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Group Photo */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px]">
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
          <ul className="space-y-4 text-gray-900 mb-8">
            <li className="flex items-start gap-3">
              <span className="text-accent font-semibold text-lg mt-0.5">-</span>
              <span className="text-lg italic text-gray-900">Professional instructors for all levels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-semibold text-lg mt-0.5">-</span>
              <span className="text-lg italic text-gray-900">Amazing food prepared by our chef</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-semibold text-lg mt-0.5">-</span>
              <span className="text-lg italic text-gray-900">Daily yoga and meditation sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-semibold text-lg mt-0.5">-</span>
              <span className="text-lg italic text-gray-900">Surfskate and other activities!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-semibold text-lg mt-0.5">-</span>
              <span className="text-lg italic text-gray-900">Prices starting from EUR {surfWeek.price || 450}!</span>
            </li>
          </ul>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="w-full lg:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-white font-bold text-xl rounded-lg transition-colors mb-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            style={{ backgroundColor: '#ec681c' }}
          >
            Book Now
          </button>

          {/* Google Reviews */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-sm text-gray-700">
              5 based on 73 reviews
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurfWeekPromoCard
