'use client'

import { Calendar, Users } from 'lucide-react'
import { useBooking } from '@/lib/booking-context'

export function FloatingCheckAvailability() {
  const { openBooking } = useBooking()

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <button
        onClick={openBooking}
        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-3 font-medium text-lg hover:scale-105"
      >
        <Calendar size={22} />
        <span className="font-semibold">Check Availability</span>
        <Users size={22} />
      </button>
    </div>
  )
}
