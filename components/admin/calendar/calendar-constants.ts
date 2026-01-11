import { Bed, Waves, User, Wrench, Calendar, MapPin, Ban, LucideIcon } from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  event_type?: string
  location?: string
  color?: string
  blocks_bookings?: boolean
  status?: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
  updated_at?: string
  // Additional fields for bookings
  guest_name?: string
  room_name?: string
  participant_count?: number
}

export interface EventTypeConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: LucideIcon
}

export const EVENT_TYPES: Record<string, EventTypeConfig> = {
  booking: {
    label: 'Room Booking',
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: Bed,
  },
  surf_camp_booking: {
    label: 'Surf Week',
    color: '#14B8A6',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-300',
    icon: Waves,
  },
  surf_camp: {
    label: 'Surf Camp',
    color: '#06B6D4',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-300',
    icon: User,
  },
  maintenance: {
    label: 'Maintenance',
    color: '#F97316',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: Wrench,
  },
  block: {
    label: 'Blocked',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: Ban,
  },
  general: {
    label: 'General',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: Calendar,
  },
  event: {
    label: 'Event',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: Calendar,
  },
  other: {
    label: 'Other',
    color: '#6B7280',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: MapPin,
  },
}

export const getEventTypeConfig = (eventType?: string): EventTypeConfig => {
  return EVENT_TYPES[eventType || 'general'] || EVENT_TYPES.other
}

export const formatDateHeader = (date: Date): string => {
  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (isToday) {
    return `Today, ${monthNames[date.getMonth()]} ${date.getDate()}`
  }

  return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const isDateInRange = (date: Date, startDate: string, endDate: string): boolean => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate || startDate)
  end.setHours(23, 59, 59, 999)
  return d >= start && d <= end
}
