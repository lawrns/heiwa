'use client'

import { useEffect } from 'react'
import { useBooking } from '@/lib/booking-context'

export function SurfWeeksClient() {
  const { openBooking } = useBooking()

  useEffect(() => {
    // Handle general booking button
    const handleOpenBooking = () => {
      openBooking()
    }

    // Handle specific surf week booking
    const handleOpenBookingForWeek = (event: CustomEvent) => {
      openBooking(event.detail)
    }

    window.addEventListener('openBooking', handleOpenBooking)
    window.addEventListener('openBookingForWeek', handleOpenBookingForWeek as EventListener)

    return () => {
      window.removeEventListener('openBooking', handleOpenBooking)
      window.removeEventListener('openBookingForWeek', handleOpenBookingForWeek as EventListener)
    }
  }, [openBooking])

  return null
}
