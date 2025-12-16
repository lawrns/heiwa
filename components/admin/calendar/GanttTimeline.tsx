'use client'

import { useMemo, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarEvent, isDateInRange } from './calendar-constants'
import { GanttEventBar } from './GanttEventBar'
import { EventPopover } from './EventPopover'
import { cn } from '@/lib/utils'

type ViewType = 'quarter' | 'year'

interface GanttTimelineProps {
  viewType: ViewType
  currentDate: Date
  events: CalendarEvent[]
  onDateChange: (date: Date) => void
  onEventViewDetails: (event: CalendarEvent) => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getQuarterMonths(date: Date): { year: number; month: number }[] {
  const quarter = Math.floor(date.getMonth() / 3)
  const year = date.getFullYear()
  return [
    { year, month: quarter * 3 },
    { year, month: quarter * 3 + 1 },
    { year, month: quarter * 3 + 2 },
  ]
}

function getYearMonths(date: Date): { year: number; month: number }[] {
  const year = date.getFullYear()
  return Array.from({ length: 12 }, (_, i) => ({ year, month: i }))
}

interface MonthRow {
  year: number
  month: number
  daysInMonth: number
  events: { event: CalendarEvent; startDay: number; endDay: number }[]
}

export function GanttTimeline({
  viewType,
  currentDate,
  events,
  onDateChange,
  onEventViewDetails,
}: GanttTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)

  const today = useMemo(() => new Date(), [])

  const months = useMemo(() => {
    return viewType === 'quarter' ? getQuarterMonths(currentDate) : getYearMonths(currentDate)
  }, [viewType, currentDate])

  const monthRows: MonthRow[] = useMemo(() => {
    return months.map(({ year, month }) => {
      const daysInMonth = getDaysInMonth(year, month)
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month, daysInMonth)

      // Find events that overlap with this month
      const monthEvents = events
        .map((event) => {
          const eventStart = new Date(event.start_date)
          const eventEnd = new Date(event.end_date || event.start_date)

          // Check if event overlaps with this month
          if (eventEnd < monthStart || eventStart > monthEnd) {
            return null
          }

          // Calculate start and end days within this month
          const startDay = eventStart < monthStart ? 1 : eventStart.getDate()
          const endDay = eventEnd > monthEnd ? daysInMonth : eventEnd.getDate()

          return { event, startDay, endDay }
        })
        .filter((e): e is NonNullable<typeof e> => e !== null)

      return { year, month, daysInMonth, events: monthEvents }
    })
  }, [months, events])

  // Calculate max events in any row to set row height
  const maxEventsInRow = useMemo(() => {
    return Math.max(1, ...monthRows.map((r) => r.events.length))
  }, [monthRows])

  const handlePrev = () => {
    if (viewType === 'quarter') {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1))
    } else {
      onDateChange(new Date(currentDate.getFullYear() - 1, 0, 1))
    }
  }

  const handleNext = () => {
    if (viewType === 'quarter') {
      onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1))
    } else {
      onDateChange(new Date(currentDate.getFullYear() + 1, 0, 1))
    }
  }

  const getHeaderTitle = () => {
    if (viewType === 'year') {
      return currentDate.getFullYear().toString()
    }
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1
    return `Q${quarter} ${currentDate.getFullYear()}`
  }

  const handleEventClick = (event: CalendarEvent, anchorEl: HTMLElement) => {
    setPopoverEvent(event)
    setPopoverAnchor(anchorEl)
  }

  const handleClosePopover = () => {
    setPopoverEvent(null)
    setPopoverAnchor(null)
  }

  const handleViewDetails = (event: CalendarEvent) => {
    handleClosePopover()
    onEventViewDetails(event)
  }

  // Check if today is in a specific month
  const isTodayInMonth = (year: number, month: number) => {
    return today.getFullYear() === year && today.getMonth() === month
  }

  // Day width based on view type
  const dayWidth = viewType === 'year' ? 16 : 28

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={handlePrev}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label={viewType === 'quarter' ? 'Previous quarter' : 'Previous year'}
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{getHeaderTitle()}</h2>
        <button
          onClick={handleNext}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label={viewType === 'quarter' ? 'Next quarter' : 'Next year'}
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto" ref={scrollRef}>
        <div className="min-w-max">
          {monthRows.map(({ year, month, daysInMonth, events: monthEvents }) => {
            const rowHeight = Math.max(60, monthEvents.length * 28 + 16)

            return (
              <div key={`${year}-${month}`} className="flex border-b border-gray-100">
                {/* Month label */}
                <div className="w-24 flex-shrink-0 px-3 py-2 bg-gray-50 border-r border-gray-200 font-medium text-sm text-gray-700 sticky left-0 z-10">
                  {viewType === 'year' ? MONTH_ABBREV[month] : MONTH_NAMES[month]}
                </div>

                {/* Days grid */}
                <div
                  className="relative flex-1"
                  style={{ height: `${rowHeight}px` }}
                >
                  {/* Day columns */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1
                      const isToday = isTodayInMonth(year, month) && today.getDate() === day
                      const isWeekend = new Date(year, month, day).getDay() % 6 === 0

                      return (
                        <div
                          key={day}
                          className={cn(
                            'border-r border-gray-100 flex-shrink-0 relative',
                            isWeekend && 'bg-gray-50/50',
                            isToday && 'bg-blue-50'
                          )}
                          style={{ width: `${dayWidth}px` }}
                        >
                          {/* Day number header */}
                          <div
                            className={cn(
                              'text-xs text-center py-1 border-b border-gray-100',
                              isToday ? 'text-blue-600 font-semibold' : 'text-gray-400'
                            )}
                          >
                            {day}
                          </div>
                          {/* Today marker line */}
                          {isToday && (
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-500 z-5" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Event bars */}
                  <div className="absolute inset-0 pt-6 px-0">
                    {monthEvents.map((eventData, idx) => (
                      <GanttEventBar
                        key={eventData.event.id}
                        event={eventData.event}
                        startDay={eventData.startDay}
                        endDay={eventData.endDay}
                        totalDays={daysInMonth}
                        row={idx}
                        onClick={handleEventClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No events scheduled for this {viewType === 'quarter' ? 'quarter' : 'year'}
        </div>
      )}

      {/* Popover */}
      {popoverEvent && popoverAnchor && (
        <EventPopover
          event={popoverEvent}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  )
}
