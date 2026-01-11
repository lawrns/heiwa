'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Search, Download } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/admin/rooms')
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.data.rooms)
      } else {
        setError('Failed to fetch rooms')
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
      setError('Error loading rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setRooms(rooms.filter(room => room.id !== roomId))
      } else {
        alert('Failed to delete room: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting room:', err)
      alert('Error deleting room. Please try again.')
    }
  }

  const toggleActive = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return
    
    // Show confirmation for deactivation
    if (room.is_active && !confirm('Are you sure you want to deactivate this room? It will no longer be available for booking.')) {
      return
    }
    
    try {
      // Fetch full room data from API to get all database fields
      const getResponse = await fetch(`/api/rooms/${roomId}`)
      const getData = await getResponse.json()
      
      if (!getData.success || !getData.data?.room) {
        alert('Failed to fetch room data for update')
        return
      }
      
      const dbRoom = getData.data.room
      
      // Send only database fields, properly formatted
      const updateData = {
        name: dbRoom.name || room.name,
        capacity: dbRoom.capacity || room.capacity,
        booking_type: dbRoom.booking_type || 'whole',
        pricing: dbRoom.pricing || (room.price_per_night ? { standard: room.price_per_night } : { standard: 0 }),
        amenities: dbRoom.amenities || room.amenities || [],
        description: dbRoom.description || '',
        images: dbRoom.images || (room.featured_image ? [room.featured_image] : []),
        is_active: !room.is_active,
        bed_types: dbRoom.bed_types || [],
      }
      
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRooms(rooms.map(r => 
          r.id === roomId ? { ...r, is_active: !r.is_active } : r
        ))
      } else {
        alert('Failed to update room: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error updating room:', err)
      alert('Error updating room. Please try again.')
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

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? room.is_active : !room.is_active)
    return matchesSearch && matchesStatus
  })

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchRooms}
            className="px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-2">Manage your accommodation options</p>
        </div>
        <Link
          href="/admin/rooms/new"
          data-testid="create-room-btn"
          className="inline-flex items-center gap-2 px-6 py-3 bg-heiwaOrange-600 hover:bg-heiwaOrange-700 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
        >
          <Plus className="h-5 w-5" />
          Add Room
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="rooms-search-input"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div data-testid="rooms-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} data-testid="room-card" className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              {room.featured_image ? (
                <img
                  src={room.featured_image}
                  alt={room.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement
                    target.src = '/images/rooms/room1.jpg'
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
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
              <h3 data-testid="room-name" className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
              <div className="space-y-2 mb-4">
                <p data-testid="room-capacity" className="text-sm text-gray-600">
                  <span className="font-medium">Capacity:</span> {room.capacity} guests
                </p>
                <p data-testid="room-price" className="text-sm text-gray-600">
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
                  data-testid="edit-room-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-heiwaOrange-600 hover:bg-heiwaOrange-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(room.id)}
                  data-testid="delete-room-btn"
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

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by adding your first room.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link
              href="/admin/rooms/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Room
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
