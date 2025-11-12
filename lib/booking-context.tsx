'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Booking {
  id: string
  clientName: string
  email: string
  phone?: string
  checkIn: string
  checkOut: string
  roomType: string
  roomId?: string
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

  const openBooking = useCallback((surfWeekId?: string | any) => {
    // Handle case where an object is passed instead of a string ID
    let weekId: string | undefined
    if (surfWeekId) {
      if (typeof surfWeekId === 'string') {
        weekId = surfWeekId
      } else if (typeof surfWeekId === 'object' && surfWeekId.id) {
        weekId = surfWeekId.id
      } else {
        console.warn('Invalid surfWeekId provided:', surfWeekId)
        weekId = undefined
      }
    }

    if (weekId) {
      // Fetch surf week data first, then open widget after data is loaded
      fetch(`/api/surf-camps?category=surf-week`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const surfWeek = data.data.surf_camps.find((camp: any) => camp.id === weekId)
            if (surfWeek) {
              // Set surf week first, then open widget
              // React 18+ automatically batches these updates
              setSelectedSurfWeek(surfWeek)
              setIsBookingOpen(true) // Open AFTER setting surf week
            } else {
              console.error('Surf week not found:', weekId)
              setIsBookingOpen(true) // Still open widget even if not found
            }
          } else {
            setIsBookingOpen(true)
          }
        })
        .catch((error) => {
          console.error('Error fetching surf week:', error)
          setIsBookingOpen(true) // Open widget even on error
        })
    } else {
      // React 18+ automatically batches these updates
      setSelectedSurfWeek(null)
      setIsBookingOpen(true)
    }
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
        booking_type: bookingType,
        room_id: bookingData.roomId || 'default-room',
        start_date: bookingData.checkIn,
        end_date: bookingData.checkOut,
        participants: [{
          name: bookingData.clientName,
          email: bookingData.email,
          phone: bookingData.phone,
          message: bookingData.message
        }],
        clientName: bookingData.clientName,
        email: bookingData.email,
        phone: bookingData.phone,
        guests: bookingData.guests || 1
      }

      // Add surf week data if selected
      if (selectedSurfWeek) {
        payload.camp_id = selectedSurfWeek.id
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
