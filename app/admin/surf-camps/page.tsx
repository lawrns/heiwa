'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Calendar, Users, Search, Download, UserPlus } from 'lucide-react'
import { RoomCardSkeleton } from '@/components/ui/skeleton-loaders'
import { EnrollmentModal } from '@/components/admin/enrollments/EnrollmentModal'

interface SurfCamp {
  id: string
  name: string
  start_date: string
  end_date: string
  max_participants: number
  enrolled_count: number  // Changed from confirmed_booked to match API
  available_spots: number
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
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'past'>('all')
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false)
  const [selectedCampId, setSelectedCampId] = useState<string>('')

  useEffect(() => {
    fetchSurfCamps()
  }, [])

  const fetchSurfCamps = async () => {
    try {
      setLoading(true)
      setError(null)
      // Admin needs to manage both active + inactive camps
      const response = await fetch('/api/surf-camps?admin=true', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const camps = data.data?.surf_camps || data.data || []
        setSurfCamps(Array.isArray(camps) ? camps : [])
      } else {
        setError(data.error || 'Failed to fetch surf weeks')
      }
    } catch (err: unknown) {
      console.error('Error fetching surf weeks:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error loading surf weeks'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (campId: string) => {
    if (!confirm('Are you sure you want to delete this surf week? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/surf-camps/${campId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSurfCamps(surfCamps.filter(camp => camp.id !== campId))
      } else {
        alert('Failed to delete surf week: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting surf week:', err)
      alert('Error deleting surf week. Please try again.')
    }
  }

  const toggleActive = async (campId: string) => {
    const camp = surfCamps.find(c => c.id === campId)
    if (!camp) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(camp.end_date)
    endDate.setHours(0, 0, 0, 0)
    const isPast = endDate < today
    if (isPast) {
      alert('This surf week has already ended. Past surf weeks are intentionally hidden from the public booking widget, even if activated.')
      return
    }
    
    // Show confirmation for deactivation
    if (camp.is_active && !confirm('Are you sure you want to deactivate this surf week? It will no longer be available for booking.')) {
      return
    }
    
    try {
      // Only send database fields, not computed fields like enrolled_count or available_spots
      const updateData = {
        name: camp.name,
        description: camp.description || '',
        start_date: camp.start_date,
        end_date: camp.end_date,
        max_participants: camp.max_participants,
        price: camp.price,
        level: camp.level || 'all',
        includes: camp.includes || [],
        images: camp.images || [],
        is_active: !camp.is_active,
      }
      
      const response = await fetch(`/api/surf-camps/${campId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSurfCamps(surfCamps.map(c => 
          c.id === campId ? { ...c, is_active: !c.is_active } : c
        ))
      } else {
        alert('Failed to update surf week: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error updating surf week:', err)
      alert('Error updating surf week. Please try again.')
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
    // Use available_spots from API if present, otherwise calculate from enrolled_count
    const spotsLeft = camp.available_spots ?? (camp.max_participants - (camp.enrolled_count || 0))
    if (spotsLeft <= 0) return { text: 'Fully Booked', color: 'bg-red-100 text-red-800' }
    if (spotsLeft <= 3) return { text: `${spotsLeft} Spots Left`, color: 'bg-orange-100 text-orange-800' }
    return { text: `${spotsLeft} Available`, color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Surf Weeks Management</h1>
          <p className="text-gray-600 mt-2">Manage your surf week programs</p>
        </div>

      {/* Explanation */}
      <div className="bg-heiwaOrange-50 border border-heiwaOrange-200 rounded-lg p-4">
        <p className="text-sm text-heiwaOrange-900">
          Public booking only shows surf weeks that are <span className="font-semibold">Active</span> and <span className="font-semibold">not ended</span>.
          Past surf weeks are kept here for reference and reporting.
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={
            statusFilter === 'all'
              ? 'px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm'
              : 'px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200'
          }
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={
            statusFilter === 'active'
              ? 'px-3 py-1.5 rounded-full bg-green-700 text-white text-sm'
              : 'px-3 py-1.5 rounded-full bg-green-50 text-green-800 text-sm hover:bg-green-100'
          }
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('inactive')}
          className={
            statusFilter === 'inactive'
              ? 'px-3 py-1.5 rounded-full bg-yellow-700 text-white text-sm'
              : 'px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-800 text-sm hover:bg-yellow-100'
          }
        >
          Inactive
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('past')}
          className={
            statusFilter === 'past'
              ? 'px-3 py-1.5 rounded-full bg-gray-700 text-white text-sm'
              : 'px-3 py-1.5 rounded-full bg-gray-50 text-gray-800 text-sm hover:bg-gray-100'
          }
        >
          Past
        </button>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Filter surf weeks
  const filteredCamps = surfCamps.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || camp.level === levelFilter

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(camp.end_date)
    endDate.setHours(0, 0, 0, 0)
    const isPast = endDate < today
    const isInactive = !camp.is_active

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'past'
          ? isPast
          : statusFilter === 'inactive'
            ? (!isPast && isInactive)
            : (!isPast && !isInactive)

    return matchesSearch && matchesLevel && matchesStatus
  })

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchSurfCamps}
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
          <h1 className="text-3xl font-bold text-gray-900">Surf Weeks Management</h1>
          <p className="text-gray-600 mt-2">Manage your surf week programs and schedules</p>
        </div>
        <Link
          href="/admin/surf-camps/new"
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
          style={{ backgroundColor: '#ea580c' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2410c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
        >
          <Plus className="h-5 w-5" />
          Add Surf Week
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
                placeholder="Search surf weeks by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Surf Weeks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCamps.map((camp) => {
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
                    <span>{camp.enrolled_count || 0}/{camp.max_participants} enrolled</span>
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
                
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/admin/surf-camps/${camp.id}`}
                    className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedCampId(camp.id)
                      setEnrollmentModalOpen(true)
                    }}
                    className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Enroll
                  </button>
                  <Link
                    href={`/admin/surf-camps/${camp.id}/edit`}
                    className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
                    style={{ backgroundColor: '#ea580c' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2410c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete surf week"
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

      {filteredCamps.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surf weeks found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || levelFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by creating your first surf week program.'}
          </p>
          {!searchTerm && levelFilter === 'all' && (
            <Link
              href="/admin/surf-camps/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Surf Week
            </Link>
          )}
        </div>
      )}

      {/* Enrollment Modal */}
      <EnrollmentModal
        open={enrollmentModalOpen}
        onClose={() => {
          setEnrollmentModalOpen(false)
          setSelectedCampId('')
        }}
        surfCampId={selectedCampId}
        onEnrolled={() => {
          fetchSurfCamps() // Refresh the list
        }}
      />
    </div>
  )
}
// Deployment test Mon Dec 15 13:33:10 CST 2025
