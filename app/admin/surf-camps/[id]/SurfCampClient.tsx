'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, Euro, Edit, Trash2, MapPin, CheckCircle, XCircle, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { ParticipantsList } from '@/components/admin/enrollments/ParticipantsList'
import { EnrollmentModal } from '@/components/admin/enrollments/EnrollmentModal'

interface SurfCamp {
  id: string
  name: string
  start_date: string
  end_date: string
  max_participants: number
  confirmed_booked?: number
  enrolled_count?: number
  available_spots?: number
  price: number
  level: string
  description: string
  includes: string[]
  images: string[]
  is_active: boolean
  location?: string
}

export default function SurfCampClient({ id }: { id: string }) {
  const router = useRouter()
  const [surfCamp, setSurfCamp] = useState<SurfCamp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false)
  const [participantsKey, setParticipantsKey] = useState(0) // Force refresh

  useEffect(() => {
    const fetchSurfCamp = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/surf-camps/${id}`)
        const data = await response.json()
        
        if (data.success) {
          setSurfCamp(data.data.surf_camp)
        } else {
          setError(data.error || 'Failed to fetch surf week')
        }
      } catch (err) {
        setError('Error loading surf week')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSurfCamp()
  }, [id])

  const refreshData = () => {
    // Refresh both surf camp data and participants list
    setParticipantsKey(prev => prev + 1)
    // Re-fetch surf camp to update counts
    fetch(`/api/surf-camps/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSurfCamp(data.data.surf_camp)
        }
      })
      .catch(console.error)
  }

  const formatDate = (dateString: string) => {
    // Parse date string as UTC to avoid timezone offset issues
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  const getAvailabilityStatus = (camp: SurfCamp) => {
    const spotsLeft = camp.available_spots ?? (camp.max_participants - (camp.confirmed_booked ?? 0))
    if (spotsLeft <= 0) return { text: 'Fully Booked', color: 'bg-red-100 text-red-800' }
    if (spotsLeft <= 3) return { text: `${spotsLeft} Spots Left`, color: 'bg-orange-100 text-orange-800' }
    return { text: `${spotsLeft} Available`, color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error || !surfCamp) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Surf camp not found'}</p>
          <Link href="/admin/surf-camps" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            ← Back to Surf Weeks
          </Link>
        </div>
      </div>
    )
  }

  const availability = getAvailabilityStatus(surfCamp)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/surf-camps" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Surf Weeks
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setEnrollmentModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Enroll
          </button>
          <Link
            href={`/admin/surf-camps/${surfCamp.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image */}
        {surfCamp.images && surfCamp.images.length > 0 && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={surfCamp.images[0]}
              alt={surfCamp.name}
              fill
              style={{ objectFit: 'cover' }}
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{surfCamp.name}</h1>
              <p className="text-gray-600 mt-2">{surfCamp.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${availability.color}`}>
                {availability.text}
              </span>
              {surfCamp.is_active ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <XCircle className="h-4 w-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Start Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatDate(surfCamp.start_date)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">End Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatDate(surfCamp.end_date)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Participants</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {surfCamp.confirmed_booked ?? surfCamp.enrolled_count ?? 0} / {surfCamp.max_participants}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Euro className="h-5 w-5" />
                <span className="text-sm font-medium">Price</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">€{surfCamp.price}/person</p>
            </div>
          </div>

          {/* Level */}
          <div className="border-t pt-4">
            <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Level: {surfCamp.level}
            </span>
          </div>

          {/* Location */}
          {surfCamp.location && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Location:</span>
                <span>{surfCamp.location}</span>
              </div>
            </div>
          )}

          {/* Includes */}
          {surfCamp.includes && surfCamp.includes.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {surfCamp.includes.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Images */}
          {surfCamp.images && surfCamp.images.length > 1 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {surfCamp.images.slice(1).map((image, index) => (
                  <div key={index} className="relative w-full h-32 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${surfCamp.name} - Image ${index + 2}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants List */}
      <ParticipantsList 
        key={participantsKey}
        surfCampId={surfCamp.id} 
        onParticipantRemoved={refreshData}
      />

      {/* Enrollment Modal */}
      <EnrollmentModal
        open={enrollmentModalOpen}
        onClose={() => setEnrollmentModalOpen(false)}
        surfCampId={surfCamp.id}
        onEnrolled={refreshData}
      />
    </div>
  )
}

