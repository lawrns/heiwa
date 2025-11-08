'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Booking {
  id: string
  clientName: string
  email: string
  phone?: string
  checkIn: string
  checkOut: string
  roomType: string
  guests: number
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice?: number
}

interface BookingContextType {
  isBookingOpen: boolean
  openBooking: () => void
  closeBooking: () => void
  hasActiveBooking: boolean
  setBookingSuccess: (success: boolean) => void
  currentBooking: Booking | null
  setCurrentBooking: (booking: Booking | null) => void
  createBooking: (bookingData: Partial<Booking>) => Promise<{ success: boolean; bookingId?: string; error?: string }>
  checkAvailability: (roomId: string, checkIn: string, checkOut: string) => Promise<{ available: boolean; price?: number; message?: string }>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [hasActiveBooking, setHasActiveBooking] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)

  const openBooking = useCallback(() => setIsBookingOpen(true), [])
  const closeBooking = useCallback(() => setIsBookingOpen(false), [])
  const setBookingSuccess = useCallback((success: boolean) => setHasActiveBooking(success), [])

  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          booking_type: 'room',
          start_date: bookingData.checkIn,
          end_date: bookingData.checkOut,
          participants: [{
            name: bookingData.clientName,
            email: bookingData.email,
            phone: bookingData.phone,
            message: bookingData.message
          }]
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCurrentBooking({
          id: result.data.booking_id,
          ...bookingData,
          status: 'pending'
        } as Booking)
        setHasActiveBooking(true)
        return { success: true, bookingId: result.data.booking_id }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Booking creation error:', error)
      return { success: false, error: 'Failed to create booking' }
    }
  }, [])

  const checkAvailability = useCallback(async (roomId: string, checkIn: string, checkOut: string) => {
    try {
      const response = await fetch(`/api/availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`)
      const result = await response.json()

      if (result.success) {
        return {
          available: result.data.available,
          price: result.data.totalPrice,
          message: result.data.available ? undefined : 'Room not available for selected dates'
        }
      } else {
        return { available: false, message: result.error }
      }
    } catch (error) {
      console.error('Availability check error:', error)
      return { available: false, message: 'Failed to check availability' }
    }
  }, [])

  return (
    <BookingContext.Provider value={{ 
      isBookingOpen, 
      openBooking, 
      closeBooking, 
      hasActiveBooking, 
      setBookingSuccess,
      currentBooking,
      setCurrentBooking,
      createBooking,
      checkAvailability
    }}>
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
