'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarEvent, isSameDay, isDateInRange } from './calendar-constants'
import { EventPill } from './EventPill'
import { cn } from '@/lib/utils'

interface CalendarGridProps {
  currentMonth: Date
  selectedDate: Date
  events: CalendarEvent[]
  onMonthChange: (date: Date) => void
  onDateSelect: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const MAX_VISIBLE_EVENTS = 3

export function CalendarGrid({
  currentMonth,
  selectedDate,
  events,
  onMonthChange,
  onDateSelect,
  onEventClick,
}: CalendarGridProps) {
  const today = useMemo(() => new Date(), [])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: Date[] = []

    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Next month's leading days to complete the grid (6 rows)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }, [currentMonth])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()

    calendarDays.forEach((day) => {
      const key = day.toISOString().split('T')[0]
      const dayEvents = events.filter((event) =>
        isDateInRange(day, event.start_date, event.end_date || event.start_date)
      )
      if (dayEvents.length > 0) {
        map.set(key, dayEvents)
      }
    })

    return map
  }, [calendarDays, events])

  const handlePrevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth()
  const isToday = (date: Date) => isSameDay(date, today)
  const isSelected = (date: Date) => isSameDay(date, selectedDate)

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 w-full">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-500 min-w-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 w-full">
        {calendarDays.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0]
          const dayEvents = eventsByDate.get(dateKey) || []
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const hiddenCount = dayEvents.length - MAX_VISIBLE_EVENTS

          return (
            <div
              key={index}
              onClick={() => onDateSelect(date)}
              className={cn(
                'min-h-[120px] sm:min-h-[140px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors min-w-0',
                'hover:bg-gray-50',
                !isCurrentMonth(date) && 'bg-gray-50/50',
                isSelected(date) && 'bg-blue-50 ring-2 ring-inset ring-blue-500'
              )}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'flex items-center justify-center w-7 h-7 text-sm rounded-full',
                    isToday(date) && 'bg-blue-600 text-white font-semibold',
                    !isToday(date) && isCurrentMonth(date) && 'text-gray-900',
                    !isToday(date) && !isCurrentMonth(date) && 'text-gray-400'
                  )}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Event pills */}
              <div className="space-y-0.5">
                {visibleEvents.map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  />
                ))}
                {hiddenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDateSelect(date)
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-1.5 py-0.5"
                  >
                    +{hiddenCount} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
