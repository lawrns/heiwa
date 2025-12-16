'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { CalendarGrid } from '@/components/admin/calendar/CalendarGrid'
import { CalendarSidebar } from '@/components/admin/calendar/CalendarSidebar'
import { EventDetailsModal } from '@/components/admin/calendar/EventDetailsModal'
import { CreateEventModal } from '@/components/admin/calendar/CreateEventModal'
import { CalendarEvent } from '@/components/admin/calendar/calendar-constants'

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const start = startOfMonth(currentMonth).toISOString().split('T')[0]
      const end = endOfMonth(currentMonth).toISOString().split('T')[0]

      const response = await fetch(`/api/calendar-events?start_date=${start}&end_date=${end}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.data.events || [])
      } else {
        setError('Failed to fetch events')
      }
    } catch (err) {
      setError('Error loading events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const hasBookings = useMemo(() => {
    return events.some(
      (e) => e.event_type === 'booking' || e.event_type === 'surf_camp_booking'
    )
  }, [events])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)))
  }

  const handleEventUpdatedFromModal = (updatedEvent: CalendarEvent) => {
    handleEventUpdated(updatedEvent)
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const handleEventDeleted = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId))
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const handleEventCreated = () => {
    fetchEvents()
  }

  const handleCreateEvent = () => {
    setShowCreateModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Manage events and schedules</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="animate-pulse bg-gray-200 rounded-lg h-[600px]" />
          <div className="animate-pulse bg-gray-200 rounded-lg h-[600px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage events and schedules</p>
        </div>
        <button
          onClick={handleCreateEvent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar Grid */}
        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          events={events}
          onMonthChange={setCurrentMonth}
          onDateSelect={setSelectedDate}
          onEventClick={handleEventClick}
        />

        {/* Sidebar */}
        <CalendarSidebar
          selectedDate={selectedDate}
          events={events}
          allEventsEmpty={events.length === 0}
          hasBookings={hasBookings}
          onEventUpdate={handleEventUpdated}
          onEventViewFull={handleEventClick}
          onCreateEvent={handleCreateEvent}
        />
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleEventCreated}
          defaultDate={selectedDate.toISOString().split('T')[0]}
        />
      )}

      {showEventModal && selectedEvent && (
        <EventDetailsModal
          open={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
          event={selectedEvent}
          onEdit={handleEventUpdatedFromModal}
          onDelete={handleEventDeleted}
        />
      )}
    </div>
  )
}
