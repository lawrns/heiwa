'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Trash2, Calendar as CalendarIcon, MapPin, Tag } from 'lucide-react'
import { toast } from 'react-toastify'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  event_type?: string
  location?: string
  color?: string
  created_at: string
  updated_at?: string
}

interface EventDetailsModalProps {
  open: boolean
  onClose: () => void
  event: CalendarEvent | null
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
}

export function EventDetailsModal({ open, onClose, event, onEdit, onDelete }: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        start_date: event.start_date ? event.start_date.split('T')[0] : '',
        end_date: event.end_date ? event.end_date.split('T')[0] : '',
        event_type: event.event_type || 'general',
        location: event.location || '',
        color: event.color || '#3B82F6',
      })
      setIsEditing(false)
    }
  }, [event, open])

  const handleSave = async () => {
    if (!event || !formData.title || !formData.start_date) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/calendar-events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : formData.start_date ? new Date(formData.start_date).toISOString() : null,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event')
      }

      toast.success('Event updated successfully')
      setIsEditing(false)
      if (onEdit) {
        onEdit(data.data.event)
      }
    } catch (error: any) {
      console.error('Error updating event:', error)
      toast.error(error.message || 'Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/calendar-events/${event.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete event')
      }

      toast.success('Event deleted successfully')
      if (onDelete) {
        onDelete(event.id)
      }
      onClose()
    } catch (error: any) {
      console.error('Error deleting event:', error)
      toast.error(error.message || 'Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {isEditing ? 'Edit Event' : 'Event Details'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update event information' : 'View and manage event details'}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_type">Event Type</Label>
                <Select
                  value={formData.event_type || 'general'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="surf_camp">Surf Camp</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color || '#3B82F6'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Main Building, Beach, etc."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{event.title}</h3>
              {event.description && (
                <p className="text-gray-600 mt-2">{event.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">
                    {event.end_date ? new Date(event.end_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              )}

              {event.event_type && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{event.event_type}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-4 w-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete Event'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}








