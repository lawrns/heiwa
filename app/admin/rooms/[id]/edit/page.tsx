'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface SurfCampPricing {
  strategy: 'perBed' | 'perRoomOccupancy'
  perBed?: number
  occupancy?: Record<number, number>  // { 1: 800, 2: 580, 3: 500, ... }
}

interface RoomPricing {
  standard: number
  offSeason?: number
  surfCamp?: SurfCampPricing
}

interface Room {
  id: string
  name: string
  capacity: number
  booking_type: 'whole' | 'perBed'
  pricing: RoomPricing
  amenities: string[]
  description: string
  images: string[]
  is_active: boolean
  bed_types: string[]
  created_at: string
  updated_at: string
}

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAmenity, setNewAmenity] = useState('')
  const [newBedType, setNewBedType] = useState('')
  const [newImage, setNewImage] = useState('')

  useEffect(() => {
    fetchRoom()
  }, [params.id])

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setRoom(data.data.room)
      } else {
        setError('Failed to fetch room')
      }
    } catch (err) {
      setError('Error loading room')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!room) return
    
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/rooms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to save room')
      }

      // Verify the save persisted - API returns { success: true, data: { room: {...} } }
      if (!data.data || !data.data.room || !data.data.room.id) {
        throw new Error('Save response missing room data - save may not have persisted')
      }
      
      router.push('/admin/rooms')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving room'
      console.error('Error saving room:', err)
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim() && room) {
      setRoom({
        ...room,
        amenities: [...room.amenities, newAmenity.trim()]
      })
      setNewAmenity('')
    }
  }

  const removeAmenity = (index: number) => {
    if (room) {
      setRoom({
        ...room,
        amenities: room.amenities.filter((_, i) => i !== index)
      })
    }
  }

  const addBedType = () => {
    if (newBedType.trim() && room) {
      setRoom({
        ...room,
        bed_types: [...room.bed_types, newBedType.trim()]
      })
      setNewBedType('')
    }
  }

  const removeBedType = (index: number) => {
    if (room) {
      setRoom({
        ...room,
        bed_types: room.bed_types.filter((_, i) => i !== index)
      })
    }
  }

  const addImage = () => {
    if (newImage.trim() && room) {
      setRoom({
        ...room,
        images: [...room.images, newImage.trim()]
      })
      setNewImage('')
    }
  }

  const removeImage = (index: number) => {
    if (room) {
      setRoom({
        ...room,
        images: room.images.filter((_, i) => i !== index)
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Room not found'}</p>
          <Link
            href="/admin/rooms"
            className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/rooms"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Room</h1>
            <p className="text-gray-600 mt-1">Update room information and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setRoom({ ...room, is_active: !room.is_active })}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              room.is_active
                ? 'text-red-700 bg-red-50 hover:bg-red-100'
                : 'text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {room.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {room.is_active ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={room.name}
                onChange={(e) => setRoom({ ...room, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Enter room name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={room.capacity}
                onChange={(e) => setRoom({ ...room, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Number of guests"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Type
              </label>
              <select
                value={room.booking_type}
                onChange={(e) => setRoom({ ...room, booking_type: e.target.value as 'whole' | 'perBed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              >
                <option value="whole">Entire Room</option>
                <option value="perBed">Per Bed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={room.description}
                onChange={(e) => setRoom({ ...room, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Describe the room..."
              />
            </div>
          </div>
        </div>

        {/* Standard Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Standard Room Pricing</h2>
          <p className="text-sm text-gray-600 mb-4">Regular nightly rates for direct room bookings (not part of surf camp packages)</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peak Season Rate (€) - May to September
              </label>
              <input
                type="number"
                value={room.pricing?.standard || ''}
                onChange={(e) => setRoom({
                  ...room,
                  pricing: { ...room.pricing, standard: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="80.00"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Price per night during peak season (May-September)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Off-Season Rate (€) - October to April
              </label>
              <input
                type="number"
                value={room.pricing?.offSeason || ''}
                onChange={(e) => setRoom({
                  ...room,
                  pricing: { ...room.pricing, offSeason: parseFloat(e.target.value) || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="60.00"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Price per night during off-season (October-April). Leave empty to use peak rate.</p>
            </div>
          </div>
        </div>

        {/* Surf Camp Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Surf Camp Package Pricing</h2>
          <p className="text-sm text-gray-600 mb-6">Configure pricing when this room is booked as part of a surf week package</p>
          
          <div className="space-y-6">
            {/* Pricing Strategy Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pricing Strategy
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="surfCampStrategy"
                    value="perBed"
                    checked={room.pricing?.surfCamp?.strategy === 'perBed' || !room.pricing?.surfCamp?.strategy}
                    onChange={() => setRoom({
                      ...room,
                      pricing: {
                        ...room.pricing,
                        surfCamp: {
                          ...room.pricing?.surfCamp,
                          strategy: 'perBed',
                          occupancy: undefined
                        }
                      }
                    })}
                    className="text-heiwaOrange-600 focus:ring-heiwaOrange-500"
                  />
                  <span className="text-sm font-medium">Per Bed (Fixed)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="surfCampStrategy"
                    value="perRoomOccupancy"
                    checked={room.pricing?.surfCamp?.strategy === 'perRoomOccupancy'}
                    onChange={() => {
                      const occupancy: Record<number, number> = {}
                      for (let i = 1; i <= room.capacity; i++) {
                        occupancy[i] = room.pricing?.surfCamp?.perBed || 500
                      }
                      setRoom({
                        ...room,
                        pricing: {
                          ...room.pricing,
                          surfCamp: {
                            strategy: 'perRoomOccupancy',
                            perBed: undefined,
                            occupancy
                          }
                        }
                      })
                    }}
                    className="text-heiwaOrange-600 focus:ring-heiwaOrange-500"
                  />
                  <span className="text-sm font-medium">Tiered by Occupancy</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {room.pricing?.surfCamp?.strategy === 'perRoomOccupancy' 
                  ? 'Set different prices per person based on how many guests share the room'
                  : 'Same price per bed regardless of room occupancy'}
              </p>
            </div>

            {/* Per Bed Pricing */}
            {(!room.pricing?.surfCamp?.strategy || room.pricing?.surfCamp?.strategy === 'perBed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Bed (€/person for full surf week)
                </label>
                <input
                  type="number"
                  value={room.pricing?.surfCamp?.perBed || ''}
                  onChange={(e) => setRoom({
                    ...room,
                    pricing: {
                      ...room.pricing,
                      surfCamp: {
                        ...room.pricing?.surfCamp,
                        strategy: 'perBed',
                        perBed: parseFloat(e.target.value) || undefined
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                  placeholder="500.00"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Each guest pays this amount regardless of how many people share the room</p>
              </div>
            )}

            {/* Tiered Occupancy Pricing */}
            {room.pricing?.surfCamp?.strategy === 'perRoomOccupancy' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Price Per Person by Occupancy (€/person for full surf week)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map((occupancy) => (
                    <div key={occupancy} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">
                        {occupancy} {occupancy === 1 ? 'person' : 'people'}:
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          value={room.pricing?.surfCamp?.occupancy?.[occupancy] || ''}
                          onChange={(e) => {
                            const newOccupancy = { ...room.pricing?.surfCamp?.occupancy }
                            newOccupancy[occupancy] = parseFloat(e.target.value) || 0
                            setRoom({
                              ...room,
                              pricing: {
                                ...room.pricing,
                                surfCamp: {
                                  ...room.pricing?.surfCamp,
                                  strategy: 'perRoomOccupancy',
                                  occupancy: newOccupancy
                                }
                              }
                            })
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
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Add an amenity"
              />
              <button
                onClick={addAmenity}
                className="px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-heiwaOrange-100 text-heiwaOrange-800 rounded-full text-sm"
                >
                  {amenity}
                  <button
                    onClick={() => removeAmenity(index)}
                    className="text-heiwaOrange-600 hover:text-heiwaOrange-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bed Types */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Bed Types</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newBedType}
                onChange={(e) => setNewBedType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBedType()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Add a bed type"
              />
              <button
                onClick={addBedType}
                className="px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {room.bed_types.map((bedType, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {bedType}
                  <button
                    onClick={() => removeBedType(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
          
          <div className="space-y-4">
            <ImageUpload
              value={room.images}
              onChange={(urls) => setRoom({ ...room, images: urls })}
              maxFiles={12}
              bucketName="room-images"
              storagePath={room.id}
            />

            <div className="flex gap-2">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
                placeholder="Add image URL"
              />
              <button
                onClick={addImage}
                className="px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700"
              >
                Add
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {room.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Room image ${index + 1}`}
                    className="w-full h-28 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-room.svg'
                      target.onerror = null
                    }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              {room.images.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  No images added yet. Add image URLs above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
