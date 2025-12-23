'use client'

import { Calendar, Users } from 'lucide-react'

export function FloatingCheckAvailability() {
  const openBooking = () => {
    // Dispatch event to open booking widget
    window.dispatchEvent(new CustomEvent('openBooking'))
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 pb-safe">
      <button
        onClick={openBooking}
        className="bg-accent hover:bg-accent-dark text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg transition-colors duration-300 hover:shadow-xl flex items-center gap-2 sm:gap-3 font-medium text-base sm:text-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
      >
        <Calendar size={20} className="sm:w-[22px] sm:h-[22px]" />
        <span className="font-semibold hidden sm:inline">Check Availability</span>
        <span className="font-semibold sm:hidden">Check</span>
        <Users size={20} className="sm:w-[22px] sm:h-[22px]" />
      </button>
    </div>
  )
}
