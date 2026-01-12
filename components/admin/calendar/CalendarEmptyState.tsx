'use client'

import { Calendar, Plus, Bed, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type EmptyStateType = 'day' | 'no-bookings' | 'empty-month' | 'first-time'

interface CalendarEmptyStateProps {
  type: EmptyStateType
  selectedDate?: Date
  onCreateEvent: () => void
}

export function CalendarEmptyState({ type, selectedDate, onCreateEvent }: CalendarEmptyStateProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  }

  if (type === 'day') {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-4">
          Nothing scheduled{selectedDate ? ` for ${formatDate(selectedDate)}` : ''}
        </p>
        <Button variant="outline" size="sm" onClick={onCreateEvent}>
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
      </div>
    )
  }

  if (type === 'no-bookings') {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Bed className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No guest bookings this month</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Events and maintenance are scheduled, but no room or surf week reservations yet.
        </p>
        <Link href="/admin/bookings">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Booking System
          </Button>
        </Link>
      </div>
    )
  }

  if (type === 'empty-month') {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">This month is wide open</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          No bookings, events, or maintenance scheduled yet.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Link href="/admin/bookings">
            <Button variant="outline">
              View Bookings
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // first-time
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-8 w-8 text-teal-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your calendar</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        This is where all Heiwa House activity comes together. Room bookings appear automatically,
        surf weeks show when active, and you can add maintenance, events, and more.
      </p>
      <Button onClick={onCreateEvent}>
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Event
      </Button>
    </div>
  )
}
