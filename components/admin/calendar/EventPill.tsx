'use client'

import { CalendarEvent, getEventTypeConfig } from './calendar-constants'
import { cn } from '@/lib/utils'

interface EventPillProps {
  event: CalendarEvent
  onClick?: (e: React.MouseEvent, event: CalendarEvent) => void
  compact?: boolean
}

// Helper to determine if a color is a valid hex color
const isHexColor = (color?: string): boolean => {
  if (!color) return false
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color)
}

// Helper to create a lighter shade of a hex color for background
const getLighterShade = (hexColor: string, opacity: number = 0.15): string => {
  // Return with alpha for background use
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function EventPill({ event, onClick, compact = false }: EventPillProps) {
  const config = getEventTypeConfig(event.event_type)
  const Icon = config.icon
  const isConfirmed = event.status === 'confirmed' || !event.status
  const isPending = event.status === 'pending'
  const isCancelled = event.status === 'cancelled'

  // Use custom color from event if it's a valid hex, otherwise use config color
  const hasCustomColor = isHexColor(event.color)
  const effectiveColor = hasCustomColor ? event.color! : config.color

  const displayTitle = event.guest_name
    ? `${event.guest_name}${event.room_name ? ` - ${event.room_name}` : ''}`
    : event.title

  // Show blocking indicator if event blocks bookings
  const showBlockIndicator = event.blocks_bookings

  return (
    <button
      onClick={(e) => onClick?.(e, event)}
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium truncate w-full text-left transition-[box-shadow,ring,opacity,background-color,border-color]',
        'hover:ring-1 hover:ring-offset-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        !hasCustomColor && config.bgColor,
        !hasCustomColor && config.borderColor,
        isConfirmed && 'border',
        isPending && 'border border-dashed opacity-80',
        isCancelled && 'opacity-50 line-through'
      )}
      style={{
        '--ring-color': effectiveColor,
        ...(hasCustomColor ? {
          backgroundColor: getLighterShade(effectiveColor),
          borderColor: effectiveColor,
        } : {}),
      } as React.CSSProperties}
      title={`${displayTitle}${showBlockIndicator ? ' (blocks bookings)' : ''}`}
    >
      <Icon
        className={cn('flex-shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        style={{ color: effectiveColor }}
      />
      {!compact && (
        <span className="truncate" style={{ color: effectiveColor }}>
          {displayTitle}
        </span>
      )}
    </button>
  )
}
