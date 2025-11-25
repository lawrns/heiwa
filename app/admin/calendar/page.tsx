'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { EventDetailsModal } from '@/components/admin/calendar/EventDetailsModal'
import { CreateEventModal } from '@/components/admin/calendar/CreateEventModal'
// toast import removed - not currently used
// Helper functions for date manipulation
const formatDate = (date: Date, formatStr: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  if (formatStr === 'd') return date.getDate().toString()
  if (formatStr === 'MMMM yyyy') return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  if (formatStr === 'MMM d, yyyy') return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  return date.toLocaleDateString()
}

const startOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const endOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isSameMonth = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth()
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  event_type?: string
  location?: string
  color?: string
  created_at: string
  updated_at?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
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

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return
    
    setSelectedDate(date)
    // Check if there are events on this date
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.start_date)
      const eventEnd = new Date(event.end_date || event.start_date)
      return date >= eventStart && date <= eventEnd
    })

    if (dayEvents.length > 0) {
      // If multiple events, show first one (could be enhanced to show list)
      setSelectedEvent(dayEvents[0])
      setShowEventModal(true)
    } else {
      // No events, open create modal with this date
      setShowCreateModal(true)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const handleEventDeleted = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const handleEventCreated = () => {
    fetchEvents()
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date)
      const eventEnd = new Date(event.end_date || event.start_date)
      return date >= eventStart && date <= eventEnd
    })
  }


  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Manage events and schedules</p>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Manage events and schedules</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg transition-all duration-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {formatDate(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg transition-all duration-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateClick}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md"
            modifiers={{
              hasEvents: (date) => getEventsForDate(date).length > 0
            }}
            modifiersClassNames={{
              hasEvents: 'bg-blue-50 border-blue-200'
            }}
          />
          
          {/* Events for selected date */}
          {selectedDate && getEventsForDate(selectedDate).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">
                Events on {formatDate(selectedDate, 'MMM d, yyyy')}
              </h4>
              <div className="space-y-2">
                {getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.color || '#3B82F6' }}
                    />
                    <span className="text-sm">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Events List */}
        {events.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            <div className="space-y-2">
              {events.slice(0, 10).map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.color || '#3B82F6' }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(new Date(event.start_date), 'MMM d, yyyy')}
                      {event.end_date && event.end_date !== event.start_date && 
                        ` - ${formatDate(new Date(event.end_date), 'MMM d, yyyy')}`
                      }
                    </p>
                  </div>
                  {event.event_type && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {event.event_type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 mb-4">
              <Plus className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events scheduled for this month</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by creating your first event. You can schedule activities, workshops, or special dates.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md font-medium"
            >
              <Plus className="h-5 w-5" />
              Create Your First Event
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedDate(undefined)
          }}
          onCreated={handleEventCreated}
          defaultDate={selectedDate?.toISOString().split('T')[0]}
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
          onEdit={handleEventUpdated}
          onDelete={handleEventDeleted}
        />
      )}
    </div>
  )
}

