'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface SurfCampPricing {
  strategy: 'perBed' | 'perRoomOccupancy'
  perBed?: number
  occupancy?: Record<number, number>
}

interface RoomFormData {
  name: string
  description: string
  capacity: number
  price_per_night: number
  off_season_price: number
  booking_type: 'whole' | 'perBed'
  surfCampPricing: SurfCampPricing
  amenities: string[]
  featured_image: string
  images: string[]
  is_active: boolean
}

export default function NewRoomPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
    capacity: 1,
    price_per_night: 0,
    off_season_price: 0,
    booking_type: 'whole',
    surfCampPricing: {
      strategy: 'perBed',
      perBed: undefined,
      occupancy: undefined,
    },
    amenities: [],
    featured_image: '',
    images: [],
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const commonAmenities = [
    'WiFi',
    'Private Bathroom',
    'Air Conditioning',
    'Kitchen',
    'Balcony',
    'Sea View',
    'Parking',
    'Towels',
    'Linens',
    'Safe',
    'Minibar',
    'TV',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          capacity: formData.capacity,
          booking_type: formData.booking_type,
          pricing: {
            standard: formData.price_per_night,
            offSeason: formData.off_season_price || formData.price_per_night,
            surfCamp: formData.surfCampPricing.perBed || formData.surfCampPricing.occupancy ? {
              strategy: formData.surfCampPricing.strategy,
              perBed: formData.surfCampPricing.strategy === 'perBed' ? formData.surfCampPricing.perBed : undefined,
              occupancy: formData.surfCampPricing.strategy === 'perRoomOccupancy' ? formData.surfCampPricing.occupancy : undefined,
            } : undefined,
          },
          amenities: formData.amenities,
          featured_image: formData.featured_image,
          images: formData.images,
          is_active: formData.is_active,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to rooms list
        router.push('/admin/rooms')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create room. Please try again.')
      }
    } catch (err) {
      console.error('Error creating room:', err)
      setError('Failed to create room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }))
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/rooms"
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
        <p className="text-gray-600 mt-2">Create a new accommodation option</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Room Information</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., The Cave, Room Nr 2"
                />
              </div>
              
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the room, its features, and what makes it special..."
              />
            </div>

            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Type
              </label>
              <select
                value={formData.booking_type}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_type: e.target.value as 'whole' | 'perBed' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              >
                <option value="whole">Entire Room</option>
                <option value="perBed">Per Bed</option>
              </select>
            </div>

            {/* Standard Pricing Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-4">Standard Room Pricing</h4>
              <p className="text-sm text-gray-600 mb-4">Regular nightly rates for direct room bookings (not part of surf camp packages)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-2">
                    Peak Season Rate (€) * <span className="text-gray-500 font-normal">May - September</span>
                  </label>
                  <input
                    type="number"
                    id="price_per_night"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                    placeholder="80.00"
                  />
                </div>
                <div>
                  <label htmlFor="off_season_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Off-Season Rate (€) <span className="text-gray-500 font-normal">October - April</span>
                  </label>
                  <input
                    type="number"
                    id="off_season_price"
                    min="0"
                    step="0.01"
                    value={formData.off_season_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, off_season_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                    placeholder="Leave empty to use peak rate"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty to use peak season rate</p>
                </div>
              </div>
            </div>

            {/* Surf Camp Pricing Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Surf Camp Package Pricing</h4>
              <p className="text-sm text-gray-600 mb-4">Configure pricing when this room is booked as part of a surf week package</p>
              
              <div className="space-y-4">
                {/* Pricing Strategy Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Strategy
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="surfCampStrategy"
                        value="perBed"
                        checked={formData.surfCampPricing.strategy === 'perBed'}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          surfCampPricing: {
                            strategy: 'perBed',
                            perBed: prev.surfCampPricing.perBed,
                            occupancy: undefined,
                          }
                        }))}
                        className="text-heiwaOrange-600 focus:ring-heiwaOrange-500"
                      />
                      <span className="text-sm font-medium">Per Bed (Fixed)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="surfCampStrategy"
                        value="perRoomOccupancy"
                        checked={formData.surfCampPricing.strategy === 'perRoomOccupancy'}
                        onChange={() => {
                          const occupancy: Record<number, number> = {}
                          for (let i = 1; i <= formData.capacity; i++) {
                            occupancy[i] = formData.surfCampPricing.perBed || 500
                          }
                          setFormData(prev => ({
                            ...prev,
                            surfCampPricing: {
                              strategy: 'perRoomOccupancy',
                              perBed: undefined,
                              occupancy,
                            }
                          }))
                        }}
                        className="text-heiwaOrange-600 focus:ring-heiwaOrange-500"
                      />
                      <span className="text-sm font-medium">Tiered by Occupancy</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.surfCampPricing.strategy === 'perRoomOccupancy' 
                      ? 'Set different prices per person based on how many guests share the room'
                      : 'Same price per bed regardless of room occupancy'}
                  </p>
                </div>

                {/* Per Bed Pricing */}
                {formData.surfCampPricing.strategy === 'perBed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Bed (€/person for full surf week)
                    </label>
                    <input
                      type="number"
                      value={formData.surfCampPricing.perBed || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        surfCampPricing: {
                          ...prev.surfCampPricing,
                          perBed: parseFloat(e.target.value) || undefined
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                      placeholder="500.00"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Each guest pays this amount regardless of how many people share the room</p>
                  </div>
                )}

                {/* Tiered Occupancy Pricing */}
                {formData.surfCampPricing.strategy === 'perRoomOccupancy' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Per Person by Occupancy (€/person for full surf week)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: formData.capacity }, (_, i) => i + 1).map((occupancy) => (
                        <div key={occupancy} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-24">
                            {occupancy} {occupancy === 1 ? 'person' : 'people'}:
                          </span>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                            <input
                              type="number"
                              value={formData.surfCampPricing.occupancy?.[occupancy] || ''}
                              onChange={(e) => {
                                const newOccupancy = { ...formData.surfCampPricing.occupancy }
                                newOccupancy[occupancy] = parseFloat(e.target.value) || 0
                                setFormData(prev => ({
                                  ...prev,
                                  surfCampPricing: {
                                    ...prev.surfCampPricing,
                                    occupancy: newOccupancy
                                  }
                                }))
                              }}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                              placeholder={occupancy === 1 ? '800' : occupancy === 2 ? '580' : '500'}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <span className="text-xs text-gray-500">/person</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Example: If 2 people share this room, each pays the "2 people" rate
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commonAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <ImageUpload
                value={formData.featured_image ? [formData.featured_image] : []}
                onChange={(urls) => setFormData(prev => ({ ...prev, featured_image: urls[0] || '' }))}
                maxFiles={1}
                bucketName="room-images"
                storagePath="featured"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Images
              </label>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                maxFiles={10}
                bucketName="room-images"
                storagePath="gallery"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active (room is available for booking)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            href="/admin/rooms"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  )
}
