'use client'

import { useMemo } from 'react'
import { CalendarEvent, formatDateHeader, isDateInRange } from './calendar-constants'
import { EventCard } from './EventCard'
import { CalendarEmptyState } from './CalendarEmptyState'
import { Calendar } from 'lucide-react'

interface CalendarSidebarProps {
  selectedDate: Date
  events: CalendarEvent[]
  allEventsEmpty: boolean
  hasBookings: boolean
  onEventUpdate: (event: CalendarEvent) => void
  onEventViewFull: (event: CalendarEvent) => void
  onCreateEvent: () => void
}

export function CalendarSidebar({
  selectedDate,
  events,
  allEventsEmpty,
  hasBookings,
  onEventUpdate,
  onEventViewFull,
  onCreateEvent,
}: CalendarSidebarProps) {
  const dayEvents = useMemo(() => {
    return events.filter((event) =>
      isDateInRange(selectedDate, event.start_date, event.end_date || event.start_date)
    )
  }, [selectedDate, events])

  const getEmptyStateType = () => {
    if (allEventsEmpty) {
      return 'first-time'
    }
    if (dayEvents.length === 0 && events.length > 0 && !hasBookings) {
      return 'no-bookings'
    }
    if (dayEvents.length === 0 && events.length === 0) {
      return 'empty-month'
    }
    return 'day'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">{formatDateHeader(selectedDate)}</h3>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {dayEvents.length > 0 ? (
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onUpdate={onEventUpdate}
                onViewFull={onEventViewFull}
              />
            ))}
          </div>
        ) : (
          <CalendarEmptyState
            type={getEmptyStateType()}
            selectedDate={selectedDate}
            onCreateEvent={onCreateEvent}
          />
        )}
      </div>
    </div>
  )
}
