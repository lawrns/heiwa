'use client'

import { useState, useEffect } from 'react'
import { Users, Trash2, Mail, Phone, AlertCircle, Bed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-toastify'

interface Participant {
  id: string
  name: string
  email: string
  phone: string
  surfLevel: string
  clientId: string
  status: string
  roomId: string | null
  roomName: string
  roomType: string | null
  bedNumber: number | null
}

interface ParticipantsListProps {
  surfCampId: string
  onParticipantRemoved?: () => void
}

export function ParticipantsList({ surfCampId, onParticipantRemoved }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/assignments/participants?weekId=${surfCampId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch participants: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setParticipants(data)
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        setParticipants([])
      }
    } catch (err) {
      console.error('Error fetching participants:', err)
      setError(err instanceof Error ? err.message : 'Failed to load participants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (surfCampId) {
      fetchParticipants()
    }
  }, [fetchParticipants, surfCampId])

  const handleRemoveParticipant = async (participant: Participant) => {
    const confirmMessage = `Are you sure you want to remove ${participant.name} from this surf week?\n\nThis will:\n- Cancel their enrollment\n- Remove their room assignment (if any)\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    setRemovingId(participant.id)
    
    try {
      // Delete enrollment (participant.id is the enrollment ID)
      const response = await fetch(`/api/enrollments?id=${participant.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove participant')
      }

      // Also delete room assignment if exists
      if (participant.roomId) {
        try {
          await fetch(`/api/room-assignments?enrollmentId=${participant.id}`, {
            method: 'DELETE',
          })
        } catch (e) {
          console.warn('Room assignment deletion failed (may not exist):', e)
        }
      }

      toast.success(`${participant.name} has been removed from this surf week`)
      
      // Refresh the list
      await fetchParticipants()
      
      // Notify parent to refresh counts
      onParticipantRemoved?.()
    } catch (err) {
      console.error('Error removing participant:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to remove participant')
    } finally {
      setRemovingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getSurfLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-purple-100 text-purple-800',
      advanced: 'bg-orange-100 text-orange-800',
    }
    return (
      <Badge className={colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
        {level || 'Unknown'}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Enrolled Participants</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Error Loading Participants</h3>
        </div>
        <p className="text-gray-600 text-sm">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchParticipants}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Enrolled Participants</h3>
          <Badge variant="secondary">{participants.length}</Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchParticipants}
        >
          Refresh
        </Button>
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No participants enrolled yet</p>
          <p className="text-sm mt-1">Use the "Enroll" button to add participants</p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {participant.name}
                  </span>
                  {getStatusBadge(participant.status)}
                  {getSurfLevelBadge(participant.surfLevel)}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {participant.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {participant.email}
                    </span>
                  )}
                  {participant.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {participant.phone}
                    </span>
                  )}
                  {participant.roomName && participant.roomName !== 'Not Assigned' && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {participant.roomName}
                      {participant.bedNumber && ` (Bed ${participant.bedNumber})`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveParticipant(participant)}
                  disabled={removingId === participant.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remove from surf week"
                >
                  {removingId === participant.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
