'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { RoomCardSkeleton } from '@/components/ui/skeleton-loaders'

interface Room {
  id: string
  name: string
  capacity: number
  price_per_night: number
  featured_image: string
  is_active: boolean
  amenities: string[]
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.data.rooms)
      } else {
        setError('Failed to fetch rooms')
      }
    } catch (err) {
      setError('Error loading rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    
    try {
      // In a real implementation, this would be a DELETE request
      console.log('Deleting room:', roomId)
      // For now, just remove from local state
      setRooms(rooms.filter(room => room.id !== roomId))
    } catch (err) {
      console.error('Error deleting room:', err)
    }
  }

  const toggleActive = async (roomId: string) => {
    try {
      // In a real implementation, this would be a PATCH request
      console.log('Toggling room status:', roomId)
      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, is_active: !room.is_active } : room
      ))
    } catch (err) {
      console.error('Error updating room:', err)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-2">Manage your accommodation options</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchRooms}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-2">Manage your accommodation options</p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Room
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <img
                src={room.featured_image}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  room.is_active 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Capacity:</span> {room.capacity} guests
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Price:</span> €{room.price_per_night}/night
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amenities:</span> {room.amenities.length} items
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link
                  href={`/rooms/${room.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <Link
                  href={`/admin/rooms/${room.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => toggleActive(room.id)}
                className={`w-full mt-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  room.is_active
                    ? 'text-red-700 bg-red-50 hover:bg-red-100'
                    : 'text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {room.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first room.</p>
          <Link
            href="/admin/rooms/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Room
          </Link>
        </div>
      )}
    </div>
  )
}
