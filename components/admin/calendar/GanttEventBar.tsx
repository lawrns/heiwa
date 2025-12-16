'use client'

import { CalendarEvent, getEventTypeConfig } from './calendar-constants'
import { cn } from '@/lib/utils'

interface GanttEventBarProps {
  event: CalendarEvent
  startDay: number
  endDay: number
  dayWidth: number
  row: number
  onClick: (event: CalendarEvent, anchorEl: HTMLElement) => void
}

export function GanttEventBar({
  event,
  startDay,
  endDay,
  dayWidth,
  row,
  onClick,
}: GanttEventBarProps) {
  const config = getEventTypeConfig(event.event_type)
  const isConfirmed = event.status === 'confirmed' || !event.status
  const isPending = event.status === 'pending'
  const isCancelled = event.status === 'cancelled'

  const displayTitle = event.guest_name
    ? `${event.guest_name}${event.room_name ? ` - ${event.room_name}` : ''}`
    : event.title

  // Calculate position and width in pixels
  const leftPx = (startDay - 1) * dayWidth
  const widthPx = (endDay - startDay + 1) * dayWidth

  return (
    <button
      onClick={(e) => onClick(event, e.currentTarget)}
      className={cn(
        'absolute h-6 rounded text-xs font-medium truncate px-1 flex items-center gap-1',
        'hover:ring-2 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all',
        'shadow-sm hover:shadow-md cursor-pointer',
        isConfirmed && 'opacity-100',
        isPending && 'opacity-75 border-2 border-dashed',
        isCancelled && 'opacity-50 line-through'
      )}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        top: `${row * 28 + 4}px`,
        backgroundColor: config.color,
        color: 'white',
        minWidth: '20px',
      }}
      title={`${displayTitle} (${startDay}-${endDay})`}
    >
      <span className="truncate">{displayTitle}</span>
    </button>
  )
}
