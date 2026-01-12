'use client'

import { useState } from 'react'
import { CalendarEvent, getEventTypeConfig } from './calendar-constants'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Check, X, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: CalendarEvent
  onUpdate: (event: CalendarEvent) => void
  onViewFull: (event: CalendarEvent) => void
}

// Helper to determine if a color is a valid hex color
const isHexColor = (color?: string): boolean => {
  if (!color) return false
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color)
}

// Helper to create a lighter shade of a hex color for background
const getLighterShade = (hexColor: string, opacity: number = 0.15): string => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function EventCard({ event, onUpdate, onViewFull }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(event.title)
  const [editedStatus, setEditedStatus] = useState(event.status || 'confirmed')
  const [saving, setSaving] = useState(false)

  const config = getEventTypeConfig(event.event_type)
  const Icon = config.icon

  // Use custom color from event if it's a valid hex, otherwise use config color
  const hasCustomColor = isHexColor(event.color)
  const effectiveColor = hasCustomColor ? event.color! : config.color

  const displayTitle = event.guest_name
    ? `${event.guest_name}${event.room_name ? ` - ${event.room_name}` : ''}`
    : event.title

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/calendar-events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          status: editedStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      const data = await response.json()
      onUpdate({ ...event, title: editedTitle, status: editedStatus as CalendarEvent['status'] })
      toast.success('Event updated')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedTitle(event.title)
    setEditedStatus(event.status || 'confirmed')
    setIsEditing(false)
  }

  const handleQuickStatusChange = async (newStatus: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/calendar-events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      onUpdate({ ...event, status: newStatus as CalendarEvent['status'] })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
  }

  const formatDateRange = () => {
    const start = new Date(event.start_date)
    const end = new Date(event.end_date || event.start_date)
    const startStr = start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })

    if (startStr === endStr) {
      return startStr
    }
    return `${startStr} - ${endStr}`
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all',
        !hasCustomColor && config.bgColor,
        !hasCustomColor && config.borderColor,
        event.status === 'cancelled' && 'opacity-60'
      )}
      style={hasCustomColor ? {
        backgroundColor: getLighterShade(effectiveColor),
        borderColor: effectiveColor,
      } : undefined}
    >
      {/* Header with type label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className="h-4 w-4" style={{ color: effectiveColor }} />
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: effectiveColor }}>
            {config.label}{event.blocks_bookings ? ' (Blocks Bookings)' : ''}
          </span>
        </div>
        <button
          onClick={() => onViewFull(event)}
          className="text-gray-500 hover:text-gray-700 p-1"
          title="View full details"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Title - editable */}
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-sm font-medium bg-white"
            autoFocus
          />
          <Select value={editedStatus} onValueChange={(v) => setEditedStatus(v as 'confirmed' | 'pending' | 'cancelled')}>
            <SelectTrigger className="bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-white/50 rounded p-1 -m-1 transition-colors"
        >
          <p
            className={cn(
              'font-medium text-gray-900',
              event.status === 'cancelled' && 'line-through'
            )}
          >
            {displayTitle}
          </p>
        </div>
      )}

      {/* Details */}
      {!isEditing && (
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <p>{formatDateRange()}</p>
          {event.participant_count && (
            <p>{event.participant_count} participants</p>
          )}
          {event.location && <p>{event.location}</p>}

          {/* Status indicator with quick change */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Status:</span>
            <Select
              value={event.status || 'confirmed'}
              onValueChange={handleQuickStatusChange}
              disabled={saving}
            >
              <SelectTrigger className="h-7 w-auto text-xs bg-white/80 border-0 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      event.status === 'confirmed' && 'bg-green-500',
                      event.status === 'pending' && 'bg-yellow-500',
                      event.status === 'cancelled' && 'bg-gray-400',
                      !event.status && 'bg-green-500'
                    )}
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
