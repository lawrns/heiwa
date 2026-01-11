'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface CreateBookingData {
  guest_name: string
  guest_email: string
  guest_phone: string
  type: 'room' | 'surf-week'
  item_name: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  payment_status: 'pending' | 'paid' | 'failed'
  status: 'pending' | 'confirmed' | 'cancelled'
}

interface CreateBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (booking: CreateBookingData) => Promise<void>
  isLoading?: boolean
}

export function CreateBookingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateBookingModalProps) {
  const [formData, setFormData] = useState<{
    guest_name: string
    guest_email: string
    guest_phone: string
    type: 'room' | 'surf-week'
    item_name: string
    check_in: string
    check_out: string
    guests: string
    total_price: string
    payment_status: 'pending' | 'paid' | 'failed'
    status: 'pending' | 'confirmed' | 'cancelled'
    special_requests: string
  }>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    type: 'room',
    item_name: '',
    check_in: '',
    check_out: '',
    guests: '1',
    total_price: '',
    payment_status: 'pending',
    status: 'pending',
    special_requests: '',
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.guest_name.trim()) {
      setError('Guest name is required')
      return false
    }
    if (!formData.guest_email.trim()) {
      setError('Guest email is required')
      return false
    }
    if (!formData.guest_phone.trim()) {
      setError('Guest phone is required')
      return false
    }
    if (!formData.item_name.trim()) {
      setError('Item name is required')
      return false
    }
    if (!formData.check_in) {
      setError('Check-in date is required')
      return false
    }
    if (!formData.check_out) {
      setError('Check-out date is required')
      return false
    }
    if (!formData.total_price) {
      setError('Total price is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        ...formData,
        guests: parseInt(formData.guests),
        total_price: parseFloat(formData.total_price),
      })
      
      // Reset form
      setFormData({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        type: 'room',
        item_name: '',
        check_in: '',
        check_out: '',
        guests: '1',
        total_price: '',
        payment_status: 'pending',
        status: 'pending',
        special_requests: '',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-testid="create-booking-modal">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Create New Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Guest Information */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Guest Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  name="guest_name"
                  value={formData.guest_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                  data-testid="booking-guest-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="guest_email"
                  value={formData.guest_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                  data-testid="booking-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="guest_phone"
                  value={formData.guest_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                  data-testid="booking-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="booking-guests"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="booking-experience-select"
                >
                  <option value="room" data-testid="option-room">Room</option>
                  <option value="surf_camp" data-testid="option-surf-week">Surf Camp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deluxe Room / Beginner Surf Week"
                  data-testid="booking-room-select"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="booking-date-picker"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="booking-checkout-date"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Status */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Pricing & Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price (€) *
                </label>
                <input
                  type="number"
                  name="total_price"
                  value={formData.total_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="booking-status-select"
                >
                  <option value="pending" data-testid="status-pending">Pending</option>
                  <option value="confirmed" data-testid="status-confirmed">Confirmed</option>
                  <option value="cancelled" data-testid="status-cancelled">Cancelled</option>
                  <option value="completed" data-testid="status-completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              name="special_requests"
              value={formData.special_requests}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requests or notes..."
              data-testid="booking-notes"
            />
          </div>

          {/* Actions */}
          <div className="border-t pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="save-booking"
            >
              {isLoading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBookingModal
