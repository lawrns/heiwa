'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Calendar, User, Mail, Phone, Home, Users } from 'lucide-react'

interface Room {
  id: string
  name: string
  capacity: number
  price_per_night: number
  is_active: boolean
}

interface SurfCamp {
  id: string
  name: string
  start_date: string
  end_date: string
  price: number
  max_participants: number
  available_spots: number
  is_active: boolean
}

interface BookingFormData {
  type: 'room' | 'surf_camp'
  item_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed'
  payment_status: 'pending' | 'paid'
  special_requests: string
  notes: string
}

export default function NewBookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [surfCamps, setSurfCamps] = useState<SurfCamp[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [formData, setFormData] = useState<BookingFormData>({
    type: 'room',
    item_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
    total_price: 0,
    status: 'pending',
    payment_status: 'pending',
    special_requests: '',
    notes: '',
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true)
      const [roomsRes, campsRes] = await Promise.all([
        fetch('/api/admin/rooms'),
        fetch('/api/surf-camps'),
      ])

      const roomsData = await roomsRes.json()
      const campsData = await campsRes.json()

      if (roomsData.success) {
        setRooms(roomsData.data.rooms.filter((r: Room) => r.is_active))
      }
      if (campsData.success) {
        const camps = campsData.data?.surf_camps || campsData.data || []
        setSurfCamps(camps.filter((c: SurfCamp) => c.is_active && c.available_spots > 0))
      }
    } catch (err) {
      console.error('Error fetching options:', err)
    } finally {
      setLoadingOptions(false)
    }
  }

  const calculatePrice = () => {
    if (formData.type === 'room' && formData.item_id && formData.check_in && formData.check_out) {
      const room = rooms.find(r => r.id === formData.item_id)
      if (room) {
        const checkIn = new Date(formData.check_in)
        const checkOut = new Date(formData.check_out)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        if (nights > 0) {
          setFormData(prev => ({ ...prev, total_price: nights * room.price_per_night }))
        }
      }
    } else if (formData.type === 'surf_camp' && formData.item_id) {
      const camp = surfCamps.find(c => c.id === formData.item_id)
      if (camp) {
        setFormData(prev => ({ 
          ...prev, 
          total_price: camp.price * formData.guests,
          check_in: camp.start_date,
          check_out: camp.end_date,
        }))
      }
    }
  }

  useEffect(() => {
    calculatePrice()
  }, [formData.item_id, formData.check_in, formData.check_out, formData.guests, formData.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get item name
      let itemName = ''
      if (formData.type === 'room') {
        const room = rooms.find(r => r.id === formData.item_id)
        itemName = room?.name || 'Unknown Room'
      } else {
        const camp = surfCamps.find(c => c.id === formData.item_id)
        itemName = camp?.name || 'Unknown Surf Camp'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          item_name: itemName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/bookings')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create booking')
      }
    } catch (err) {
      console.error('Error creating booking:', err)
      setError('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
        <p className="text-gray-600 mt-2">Manually create a booking for a guest</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Booking Type */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Type</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="room"
                checked={formData.type === 'room'}
                onChange={() => setFormData(prev => ({ ...prev, type: 'room', item_id: '' }))}
                className="text-heiwaOrange-600 focus:ring-heiwaOrange-500"
              />
              <Home className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Room Booking</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="surf_camp"
                checked={formData.type === 'surf_camp'}
                onChange={() => setFormData(prev => ({ ...prev, type: 'surf_camp', item_id: '' }))}
                className="text-heiwaOrange-600 focus:ring-heiwaOrange-500"
              />
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Surf Week Booking</span>
            </label>
          </div>
        </div>

        {/* Select Item */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {formData.type === 'room' ? 'Select Room' : 'Select Surf Week'}
          </h2>
          {loadingOptions ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
          ) : (
            <select
              value={formData.item_id}
              onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
            >
              <option value="">Select {formData.type === 'room' ? 'a room' : 'a surf week'}...</option>
              {formData.type === 'room' ? (
                rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} - €{room.price_per_night}/night (Capacity: {room.capacity})
                  </option>
                ))
              ) : (
                surfCamps.map(camp => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} - €{camp.price}/person ({camp.available_spots} spots available)
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={formData.guest_name}
                onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.guest_email}
                onChange={(e) => setFormData(prev => ({ ...prev, guest_email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.guest_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, guest_phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Number of Guests *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dates (only for room bookings) */}
        {formData.type === 'room' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.check_in}
                  onChange={(e) => setFormData(prev => ({ ...prev, check_in: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.check_out}
                  min={formData.check_in}
                  onChange={(e) => setFormData(prev => ({ ...prev, check_out: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Status & Payment */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status & Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'confirmed' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as 'pending' | 'paid' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.total_price}
                onChange={(e) => setFormData(prev => ({ ...prev, total_price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                rows={3}
                value={formData.special_requests}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Any special requests from the guest..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Internal notes (not visible to guest)..."
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/bookings"
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.item_id}
            className="inline-flex items-center gap-2 px-6 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  )
}
