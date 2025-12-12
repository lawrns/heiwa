'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
}

interface EnrollmentModalProps {
  open: boolean
  onClose: () => void
  surfCampId: string
  onEnrolled: () => void
}

export function EnrollmentModal({ open, onClose, surfCampId, onEnrolled }: EnrollmentModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [skillLevel, setSkillLevel] = useState('beginner')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  })
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch clients with server-side search
  const fetchClients = useCallback(async (search: string = '') => {
    try {
      setSearchLoading(true)
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      params.set('limit', '100')

      const response = await fetch(`/api/clients?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        const message = result?.error || `Failed to load clients (${response.status})`
        throw new Error(message)
      }

      setClients(result.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Initial fetch when modal opens
  useEffect(() => {
    if (open) {
      fetchClients('')
    }
  }, [open, fetchClients])

  // Debounced search - fetch from server when search term changes
  useEffect(() => {
    if (!open) return

    const debounceTimer = setTimeout(() => {
      fetchClients(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, open, fetchClients])

  // Use all clients from server (already filtered server-side)
  const filteredClients = clients

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedClientId) {
      setError('Please select a client')
      return
    }

    setLoading(true)
    try {
      console.log('Submitting enrollment:', { surfCampId, selectedClientId, skillLevel })
      
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surf_camp_id: surfCampId,
          client_id: selectedClientId,
          skill_level: skillLevel,
          dietary_restrictions: dietaryRestrictions || null,
          emergency_contact: emergencyContact.name ? emergencyContact : null,
          notes: notes || null,
          status: 'confirmed'
        })
      })

      const data = await response.json()
      console.log('Enrollment response:', { status: response.status, data })

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Failed to enroll client (${response.status})`
        console.error('Enrollment API error:', {
          status: response.status,
          error: data.error,
          message: data.message,
          data
        })
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      if (!data.success) {
        setError(data.error || 'Enrollment failed')
        throw new Error(data.error || 'Enrollment failed')
      }

      toast.success('Client enrolled successfully!')
      onEnrolled()
      handleClose()
    } catch (error: any) {
      console.error('Error enrolling client:', error)
      setError(error.message || 'Failed to enroll client. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedClientId('')
    setSkillLevel('beginner')
    setDietaryRestrictions('')
    setEmergencyContact({ name: '', phone: '', relationship: '' })
    setNotes('')
    setSearchTerm('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll Client in Surf Week</DialogTitle>
          <DialogDescription>
            Add a client to this surf week. They will appear in room assignments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Select Client *</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="client-search"
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                )}
              </div>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <div className="text-red-500">{error}</div>}
            </div>
          </div>

          {/* Skill Level */}
          <div className="space-y-2">
            <Label htmlFor="skill-level">Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-2">
            <Label htmlFor="dietary">Dietary Restrictions</Label>
            <Textarea
              id="dietary"
              placeholder="Vegetarian, allergies, etc."
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <Label>Emergency Contact (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Name</Label>
                <Input
                  id="emergency-name"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Phone</Label>
                <Input
                  id="emergency-phone"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-relationship">Relationship</Label>
                <Input
                  id="emergency-relationship"
                  value={emergencyContact.relationship}
                  onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                  placeholder="Parent, Spouse, etc."
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedClientId}>
              {loading ? 'Enrolling...' : 'Enroll Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

