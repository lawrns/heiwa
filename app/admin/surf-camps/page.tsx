'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Calendar, Users } from 'lucide-react'
import { RoomCardSkeleton } from '@/components/ui/skeleton-loaders'

interface SurfCamp {
  id: string
  name: string
  start_date: string
  end_date: string
  max_participants: number
  confirmed_booked: number
  price: number
  level: string
  description: string
  includes: string[]
  images: string[]
  is_active: boolean
}

export default function SurfCampsPage() {
  const [surfCamps, setSurfCamps] = useState<SurfCamp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSurfCamps()
  }, [])

  const fetchSurfCamps = async () => {
    try {
      const response = await fetch('/api/surf-camps')
      const data = await response.json()
      
      if (data.success) {
        setSurfCamps(data.data.surf_camps || [])
      } else {
        setError('Failed to fetch surf camps')
      }
    } catch (err) {
      setError('Error loading surf camps')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (campId: string) => {
    if (!confirm('Are you sure you want to delete this surf camp?')) return
    
    try {
      // In a real implementation, this would be a DELETE request
      console.log('Deleting surf camp:', campId)
      setSurfCamps(surfCamps.filter(camp => camp.id !== campId))
    } catch (err) {
      console.error('Error deleting surf camp:', err)
    }
  }

  const toggleActive = async (campId: string) => {
    try {
      // In a real implementation, this would be a PATCH request
      console.log('Toggling surf camp status:', campId)
      setSurfCamps(surfCamps.map(camp => 
        camp.id === campId ? { ...camp, is_active: !camp.is_active } : camp
      ))
    } catch (err) {
      console.error('Error updating surf camp:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getAvailabilityStatus = (camp: SurfCamp) => {
    const spotsLeft = camp.max_participants - camp.confirmed_booked
    if (spotsLeft <= 0) return { text: 'Fully Booked', color: 'bg-red-100 text-red-800' }
    if (spotsLeft <= 3) return { text: `${spotsLeft} Spots Left`, color: 'bg-orange-100 text-orange-800' }
    return { text: `${spotsLeft} Available`, color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Surf Camps Management</h1>
          <p className="text-gray-600 mt-2">Manage your surf camp programs</p>
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
            onClick={fetchSurfCamps}
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
          <h1 className="text-3xl font-bold text-gray-900">Surf Camps Management</h1>
          <p className="text-gray-600 mt-2">Manage your surf camp programs and schedules</p>
        </div>
        <Link
          href="/admin/surf-camps/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Surf Camp
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surfCamps.map((camp) => {
          const availability = getAvailabilityStatus(camp)
          return (
            <div key={camp.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                {camp.images && camp.images.length > 0 ? (
                  <img
                    src={camp.images[0]}
                    alt={camp.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl">🏄‍♂️</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    camp.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {camp.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${availability.color}`}>
                    {availability.text}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{camp.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(camp.start_date)} - {formatDate(camp.end_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{camp.confirmed_booked}/{camp.max_participants} participants</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Level:</span> {camp.level}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> €{camp.price}/person
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Includes:</span> {camp.includes.length} items
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/surf-weeks`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/surf-camps/${camp.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => toggleActive(camp.id)}
                  className={`w-full mt-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    camp.is_active
                      ? 'text-red-700 bg-red-50 hover:bg-red-100'
                      : 'text-green-700 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {camp.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {surfCamps.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surf camps found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first surf camp program.</p>
          <Link
            href="/admin/surf-camps/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Surf Camp
          </Link>
        </div>
      )}
    </div>
  )
}
