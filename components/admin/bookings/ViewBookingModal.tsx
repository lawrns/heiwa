'use client'

import { X } from 'lucide-react'

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
}

interface ViewBookingModalProps {
  isOpen: boolean
  booking: Booking | null
  onClose: () => void
}

export function ViewBookingModal({
  isOpen,
  booking,
  onClose,
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
      return new Date(dateString).toLocaleDateString('en-US', {
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
      return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Booking ID and Status */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-lg font-semibold text-gray-900">{booking.id}</p>
            </div>
            <div className="flex gap-2">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
              </span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Guest Information</h4>
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
          </div>

          {/* Booking Details */}
          <div className="border-t pt-4">
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

          {/* Dietary Preferences */}
          {booking.dietary_preferences && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Dietary Preferences</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {booking.dietary_preferences}
              </p>
            </div>
          )}

          {/* Special Requests */}
          {booking.special_requests && (
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

          {/* Raw Notes (if different from special requests) */}
          {booking.notes && booking.notes !== booking.special_requests && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Additional Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500">
              Created on {formatDateTime(booking.created_at)}
            </p>
          </div>

          {/* Close Button */}
          <div className="border-t pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
