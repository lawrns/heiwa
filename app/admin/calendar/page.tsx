'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { CalendarGrid } from '@/components/admin/calendar/CalendarGrid'
import { CalendarSidebar } from '@/components/admin/calendar/CalendarSidebar'
import { GanttTimeline } from '@/components/admin/calendar/GanttTimeline'
import { CalendarViewTabs, CalendarView } from '@/components/admin/calendar/CalendarViewTabs'
import { EventDetailsModal } from '@/components/admin/calendar/EventDetailsModal'
import { CreateEventModal } from '@/components/admin/calendar/CreateEventModal'
import { CalendarEvent } from '@/components/admin/calendar/calendar-constants'

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)
const startOfQuarter = (date: Date) => {
  const quarter = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), quarter * 3, 1)
}
const endOfQuarter = (date: Date) => {
  const quarter = Math.floor(date.getMonth() / 3)
  return new Date(date.getFullYear(), quarter * 3 + 3, 0)
}
const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1)
const endOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31)

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<CalendarView>('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Fetch events when date or view changes
  useEffect(() => {
    fetchEvents()
  }, [currentDate, currentView])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      let start: string
      let end: string

      if (currentView === 'month') {
        start = startOfMonth(currentDate).toISOString().split('T')[0]
        end = endOfMonth(currentDate).toISOString().split('T')[0]
      } else if (currentView === 'quarter') {
        start = startOfQuarter(currentDate).toISOString().split('T')[0]
        end = endOfQuarter(currentDate).toISOString().split('T')[0]
      } else {
        start = startOfYear(currentDate).toISOString().split('T')[0]
        end = endOfYear(currentDate).toISOString().split('T')[0]
      }

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

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view)
  }

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Manage events and schedules</p>
          </div>
        </div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-[600px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage events and schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <CalendarViewTabs currentView={currentView} onViewChange={handleViewChange} />
          <button
            onClick={handleCreateEvent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Calendar Views */}
      {currentView === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <CalendarGrid
            currentMonth={currentDate}
            selectedDate={selectedDate}
            events={events}
            onMonthChange={setCurrentDate}
            onDateSelect={setSelectedDate}
            onEventClick={handleEventClick}
          />
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
      ) : (
        <GanttTimeline
          viewType={currentView}
          currentDate={currentDate}
          events={events}
          onDateChange={setCurrentDate}
          onEventViewDetails={handleEventClick}
        />
      )}

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
