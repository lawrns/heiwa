'use client'

import { Calendar, Users } from 'lucide-react'

export function FloatingCheckAvailability() {
  const openBooking = () => {
    // TODO: Re-enable when BookingProvider is fixed
    console.log('Booking widget temporarily disabled')
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 pb-safe">
      <button
        onClick={openBooking}
        className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-full shadow-lg transition-colors duration-300 hover:shadow-xl flex items-center gap-3 font-medium text-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
      >
        <Calendar size={22} />
        <span className="font-semibold">Check Availability</span>
        <Users size={22} />
      </button>
    </div>
  )
}
