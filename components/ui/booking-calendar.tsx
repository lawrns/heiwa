'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Users, BedDouble, Waves } from 'lucide-react'

interface Booking {
  id: string
  customerName: string
  type: 'room' | 'surf-week'
  item: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

interface BookingCalendarProps {
  bookings: Booking[]
  onBookingClick?: (booking: Booking) => void
}

export function BookingCalendar({ bookings, onBookingClick }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate])

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      return date >= checkIn && date < checkOut
    })
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500'
      case 'Pending':
        return 'bg-yellow-500'
      case 'Cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get booking type icon
  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'room':
        return <BedDouble size={12} />
      case 'surf-week':
        return <Waves size={12} />
      default:
        return <Calendar size={12} />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking Calendar</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-800 min-w-[200px] text-center">
            {formatDate(currentDate)}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          const dayBookings = getBookingsForDate(date)
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDate = isToday(date)
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-colors
                ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                ${isTodayDate ? 'ring-2 ring-accent' : ''}
                hover:bg-gray-100
              `}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                {date.getDate()}
              </div>
              
              {/* Booking indicators */}
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    className={`
                      flex items-center gap-1 px-1 py-0.5 rounded text-xs text-white
                      ${getStatusColor(booking.status)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation()
                      onBookingClick?.(booking)
                    }}
                  >
                    {getBookingTypeIcon(booking.type)}
                    <span className="truncate">{booking.customerName}</span>
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <BedDouble size={16} className="text-gray-600" />
          <span>Room</span>
        </div>
        <div className="flex items-center gap-2">
          <Waves size={16} className="text-gray-600" />
          <span>Surf Week</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            Bookings for {selectedDate.toLocaleDateString()}
          </h3>
          {getBookingsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">No bookings on this date</p>
          ) : (
            <div className="space-y-2">
              {getBookingsForDate(selectedDate).map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {getBookingTypeIcon(booking.type)}
                    <div>
                      <div className="font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.item}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">€{booking.totalPrice}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}