'use client'

import { useEffect, useRef } from 'react'
import { CalendarEvent, getEventTypeConfig } from './calendar-constants'
import { Button } from '@/components/ui/button'
import { X, ExternalLink, Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventPopoverProps {
  event: CalendarEvent
  anchorEl: HTMLElement | null
  onClose: () => void
  onViewDetails: (event: CalendarEvent) => void
}

export function EventPopover({ event, anchorEl, onClose, onViewDetails }: EventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const config = getEventTypeConfig(event.event_type)
  const Icon = config.icon

  const displayTitle = event.guest_name
    ? `${event.guest_name}${event.room_name ? ` - ${event.room_name}` : ''}`
    : event.title

  const formatDateRange = () => {
    const start = new Date(event.start_date)
    const end = new Date(event.end_date || event.start_date)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', options)

    if (startStr === endStr) return startStr
    return `${startStr} - ${endStr}`
  }

  // Position popover relative to anchor
  useEffect(() => {
    if (!anchorEl || !popoverRef.current) return

    const rect = anchorEl.getBoundingClientRect()
    const popover = popoverRef.current
    const popoverRect = popover.getBoundingClientRect()

    // Position below the anchor, centered
    let left = rect.left + rect.width / 2 - popoverRect.width / 2
    let top = rect.bottom + 8

    // Keep within viewport
    if (left < 8) left = 8
    if (left + popoverRect.width > window.innerWidth - 8) {
      left = window.innerWidth - popoverRect.width - 8
    }
    if (top + popoverRect.height > window.innerHeight - 8) {
      top = rect.top - popoverRect.height - 8
    }

    popover.style.left = `${left}px`
    popover.style.top = `${top}px`
  }, [anchorEl])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72"
      style={{ position: 'fixed' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn('p-1.5 rounded', config.bgColor)}
          >
            <Icon className="h-4 w-4" style={{ color: config.color }} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {config.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Title */}
      <h4
        className={cn(
          'font-semibold text-gray-900 mb-2',
          event.status === 'cancelled' && 'line-through opacity-60'
        )}
      >
        {displayTitle}
      </h4>

      {/* Details */}
      <div className="space-y-1.5 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDateRange()}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{event.location}</span>
          </div>
        )}
        {event.participant_count && (
          <p>{event.participant_count} participants</p>
        )}
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
            event.status === 'confirmed' && 'bg-green-100 text-green-700',
            event.status === 'pending' && 'bg-yellow-100 text-yellow-700',
            event.status === 'cancelled' && 'bg-gray-100 text-gray-500',
            !event.status && 'bg-green-100 text-green-700'
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              event.status === 'confirmed' && 'bg-green-500',
              event.status === 'pending' && 'bg-yellow-500',
              event.status === 'cancelled' && 'bg-gray-400',
              !event.status && 'bg-green-500'
            )}
          />
          {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Confirmed'}
        </span>
      </div>

      {/* Action */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onViewDetails(event)}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        View Details
      </Button>
    </div>
  )
}
