'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface BookingContextType {
  isBookingOpen: boolean
  openBooking: () => void
  closeBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const openBooking = useCallback(() => setIsBookingOpen(true), [])
  const closeBooking = useCallback(() => setIsBookingOpen(false), [])

  return (
    <BookingContext.Provider value={{ isBookingOpen, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
