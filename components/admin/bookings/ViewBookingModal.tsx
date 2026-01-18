'use client'

import { X } from 'lucide-react'

interface Participant {
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dietaryRequirements?: string
  specialRequests?: string
}

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  type: 'room' | 'surf_camp'
  item_name: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at: string
  special_requests?: string
  dietary_preferences?: string
  client_notes?: string
  notes?: string
  participants?: Participant[]
  room_assignments?: Array<{
    roomId: string
    roomName: string
    roomType: string
    maxOccupancy: number
    clientId: string
    clientName: string
    enrollmentId: string
  }>
}

interface ViewBookingModalProps {
  isOpen: boolean
  booking: Booking | null
  onClose: () => void
  onEdit?: (booking: Booking) => void
  onDelete?: (bookingId: string) => void
  onSendEmail?: (booking: Booking) => void
}

export function ViewBookingModal({
  isOpen,
  booking,
  onClose,
  onEdit,
  onDelete,
  onSendEmail,
}: ViewBookingModalProps) {
  if (!isOpen || !booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Get participants - FIRST check API-provided data, THEN parse from notes
  const getParticipants = (): Participant[] => {
    // Priority 1: Use participants array from API response (already parsed by GET endpoint)
    if (booking.participants && Array.isArray(booking.participants) && booking.participants.length > 0) {
      console.log('Using API-provided participants:', booking.participants)
      return booking.participants
    }
    
    // Priority 2: Parse from notes if no participants array provided
    if (!booking.notes) return []
    
    try {
      // Try to parse notes as JSON
      const notesData = JSON.parse(booking.notes)
      if (notesData && notesData.participants && Array.isArray(notesData.participants)) {
        console.log('Parsed participants from JSON notes:', notesData.participants)
        return notesData.participants
      }
    } catch {
      // Not JSON, try to parse from text format
      console.log('Parsing participants from text notes')
      const participants: Participant[] = []
      
      // Split by "Guest X:" pattern to find each guest section
      // Handle both "Guest 1: Name" and "\n\nGuest 1: Name" patterns
      const guestPattern = /(?:^|\n)Guest (\d+):\s*([^\n]+)/g
      let match
      const guestData: Map<number, Participant> = new Map()
      
      // First pass: extract guest names
      const notes = booking.notes
      while ((match = guestPattern.exec(notes)) !== null) {
        const guestNum = parseInt(match[1])
        const guestName = match[2].trim()
        if (!guestData.has(guestNum)) {
          guestData.set(guestNum, {
            name: guestName,
            firstName: guestName.split(' ')[0],
            lastName: guestName.split(' ').slice(1).join(' ')
          })
        }
      }
      
      // Second pass: extract details for each guest
      // Split notes into sections by double newline or by "Guest X:" markers
      const lines = notes.split('\n')
      let currentGuest = 0
      
      for (const line of lines) {
        const guestMatch = line.match(/^Guest (\d+):\s*(.+)/)
        if (guestMatch) {
          currentGuest = parseInt(guestMatch[1])
          const name = guestMatch[2].trim()
          if (!guestData.has(currentGuest)) {
            guestData.set(currentGuest, {
              name: name,
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' ')
            })
          }
        } else if (currentGuest > 0 && guestData.has(currentGuest)) {
          const participant = guestData.get(currentGuest)!
          
          if (line.startsWith('Email:')) {
            participant.email = line.replace(/Email:\s*/i, '').trim()
          } else if (line.startsWith('Phone:')) {
            participant.phone = line.replace(/Phone:\s*/i, '').trim()
          } else if (line.startsWith('Dietary Requirements:')) {
            participant.dietaryRequirements = line.replace(/Dietary Requirements:\s*/i, '').trim()
          } else if (line.startsWith('Special Requests:')) {
            participant.specialRequests = line.replace(/Special Requests:\s*/i, '').trim()
          }
        }
      }
      
      // Convert map to array, sorted by guest number
      const sortedGuests = Array.from(guestData.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([_, p]) => p)
      
      if (sortedGuests.length > 0) {
        console.log('Parsed participants from text:', sortedGuests)
        return sortedGuests
      }
    }
    
    return []
  }

  const participants = getParticipants()
  const hasMultipleParticipants = participants.length > 1 || (participants.length === 0 && booking.guests > 1)

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="button"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-testid="view-booking-modal">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-[color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 rounded-lg p-1"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Booking ID and Status */}
          <div className="flex justify-between items-start" data-testid="booking-id-display">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-lg font-semibold text-gray-900">{booking.id}</p>
            </div>
            <div className="flex gap-2" data-testid="payment-status-display">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`} data-testid={`status-${booking.status}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
              </span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="border-t pt-4" data-testid="guest-details-display">
            <h4 className="font-medium text-gray-900 mb-3">
              {hasMultipleParticipants ? `Participants (${participants.length || booking.guests})` : 'Guest Information'}
            </h4>
            
            {hasMultipleParticipants && participants.length > 0 ? (
              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-3">Guest {index + 1}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.name || `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{participant.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{participant.phone || 'Not provided'}</p>
                      </div>
                      {participant.dietaryRequirements && (
                        <div>
                          <p className="text-xs text-gray-500">Dietary Requirements</p>
                          <p className="text-sm text-gray-700">{participant.dietaryRequirements}</p>
                        </div>
                      )}
                      {participant.specialRequests && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">Special Requests</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{participant.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{booking.guest_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{booking.guest_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{booking.guest_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Guests</p>
                  <p className="text-sm font-medium text-gray-900">{booking.guests}</p>
                </div>
              </div>
            )}
          </div>

          {/* Room Assignments - Only for surf camp bookings */}
          {booking.type === 'surf_camp' && booking.room_assignments && booking.room_assignments.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Room Assignments</h4>
              <div className="space-y-3">
                {booking.room_assignments.map((assignment, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{assignment.clientName}</p>
                        <p className="text-xs text-gray-600">Room: {assignment.roomName}</p>
                        <p className="text-xs text-gray-500 capitalize">{assignment.roomType} • Max {assignment.maxOccupancy} guests</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="border-t pt-4" data-testid="booking-details-display">
            <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.type === 'room' ? 'Room' : 'Surf Camp'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Item</p>
                <p className="text-sm font-medium text-gray-900">{booking.item_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(booking.check_in)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(booking.check_out)}</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">€{booking.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Dietary Preferences - Only show if not already displayed per participant */}
          {booking.dietary_preferences && !hasMultipleParticipants && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Dietary Preferences</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {booking.dietary_preferences}
              </p>
            </div>
          )}

          {/* Special Requests - Only show if not already displayed per participant */}
          {booking.special_requests && !hasMultipleParticipants && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Special Requests</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Client Notes */}
          {booking.client_notes && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Client Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {booking.client_notes}
              </p>
            </div>
          )}

          {/* Internal Notes - Extract from JSON notes if present */}
          {(() => {
            try {
              if (booking.notes && booking.notes.trim().startsWith('{')) {
                const notesData = JSON.parse(booking.notes)
                if (notesData.internal_notes) {
                  return (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Internal Notes</h4>
                      <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 whitespace-pre-wrap border border-yellow-200">
                        {notesData.internal_notes}
                      </p>
                    </div>
                  )
                }
              }
              return null
            } catch {
              return null
            }
          })()}

          {/* Raw Notes - Only show for non-JSON notes that aren't special requests */}
          {booking.notes && 
           booking.notes !== booking.special_requests && 
           participants.length === 0 &&
           !booking.notes.trim().startsWith('{') &&
           !booking.notes.includes('[Internal Notes]:') && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Internal Notes from text format */}
          {booking.notes && 
           booking.notes.includes('[Internal Notes]:') && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Internal Notes</h4>
              <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 whitespace-pre-wrap border border-yellow-200">
                {booking.notes.split('[Internal Notes]:')[1]?.trim() || ''}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500">
              Created on {formatDateTime(booking.created_at)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4 flex justify-between">
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(booking)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 active:scale-[0.98] shadow-sm hover:shadow-md"
                  data-testid="edit-booking-btn"
                >
                  Edit
                </button>
              )}
              {onSendEmail && (
                <button
                  onClick={() => onSendEmail(booking)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:ring-offset-2 active:scale-[0.98] shadow-sm hover:shadow-md"
                  data-testid="send-email-btn"
                >
                  Send Email
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(booking.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 active:scale-[0.98] shadow-sm hover:shadow-md"
                  data-testid="delete-booking-btn"
                >
                  Delete
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewBookingModal
