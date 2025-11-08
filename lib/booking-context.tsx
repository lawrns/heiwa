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
  surfWeekId?: string
  bookingType?: 'room' | 'surf-week'
}

interface BookingContextType {
  isBookingOpen: boolean
  openBooking: (surfWeekId?: string) => void
  closeBooking: () => void
  hasActiveBooking: boolean
  setBookingSuccess: (success: boolean) => void
  currentBooking: Booking | null
  setCurrentBooking: (booking: Booking | null) => void
  createBooking: (bookingData: Partial<Booking>) => Promise<{ success: boolean; bookingId?: string; error?: string }>
  checkAvailability: (roomId: string, checkIn: string, checkOut: string) => Promise<{ available: boolean; price?: number; message?: string }>
  selectedSurfWeek: any | null
  setSelectedSurfWeek: (surfWeek: any | null) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [hasActiveBooking, setHasActiveBooking] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [selectedSurfWeek, setSelectedSurfWeek] = useState<any | null>(null)

  const openBooking = useCallback((surfWeekId?: string) => {
    if (surfWeekId) {
      // Fetch surf week data and pre-select it
      fetch(`/api/surf-camps?category=surf-week`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const surfWeek = data.data.surf_camps.find((camp: any) => camp.id === surfWeekId)
            if (surfWeek) {
              setSelectedSurfWeek(surfWeek)
            }
          }
        })
        .catch(console.error)
    } else {
      setSelectedSurfWeek(null)
    }
    setIsBookingOpen(true)
  }, [])
  const closeBooking = useCallback(() => {
    setIsBookingOpen(false)
    setSelectedSurfWeek(null)
  }, [])
  const setBookingSuccess = useCallback((success: boolean) => setHasActiveBooking(success), [])

  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    try {
      const bookingType = selectedSurfWeek ? 'surf-week' : 'room'
      const payload: any = {
        ...bookingData,
        booking_type: bookingType,
        start_date: bookingData.checkIn,
        end_date: bookingData.checkOut,
        participants: [{
          name: bookingData.clientName,
          email: bookingData.email,
          phone: bookingData.phone,
          message: bookingData.message
        }]
      }

      // Add surf week data if selected
      if (selectedSurfWeek) {
        payload.surf_camp_id = selectedSurfWeek.id
        payload.surf_week_name = selectedSurfWeek.name
        payload.surf_week_dates = `${selectedSurfWeek.start_date} to ${selectedSurfWeek.end_date}`
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setCurrentBooking({
          id: result.data.booking_id,
          ...bookingData,
          surfWeekId: selectedSurfWeek?.id,
          bookingType,
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
  }, [selectedSurfWeek])

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
      checkAvailability,
      selectedSurfWeek,
      setSelectedSurfWeek
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
