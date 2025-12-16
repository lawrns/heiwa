'use client'

import { CalendarEvent, getEventTypeConfig } from './calendar-constants'
import { cn } from '@/lib/utils'

interface EventPillProps {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
  compact?: boolean
}

export function EventPill({ event, onClick, compact = false }: EventPillProps) {
  const config = getEventTypeConfig(event.event_type)
  const Icon = config.icon
  const isConfirmed = event.status === 'confirmed' || !event.status
  const isPending = event.status === 'pending'
  const isCancelled = event.status === 'cancelled'

  const displayTitle = event.guest_name
    ? `${event.guest_name}${event.room_name ? ` - ${event.room_name}` : ''}`
    : event.title

  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium truncate w-full text-left transition-all',
        'hover:ring-1 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-offset-1',
        config.bgColor,
        config.borderColor,
        isConfirmed && 'border',
        isPending && 'border border-dashed opacity-80',
        isCancelled && 'opacity-50 line-through'
      )}
      style={{
        '--ring-color': config.color,
      } as React.CSSProperties}
      title={displayTitle}
    >
      <Icon
        className={cn('flex-shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        style={{ color: config.color }}
      />
      {!compact && (
        <span className="truncate" style={{ color: config.color }}>
          {displayTitle}
        </span>
      )}
    </button>
  )
}
