'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Star, User, Mail, MessageSquare, Eye, EyeOff, Download } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminModal from '@/components/admin/ui/AdminModal'
import AdminAlert from '@/components/admin/ui/AdminAlert'
import { formatDateCompact } from '@/lib/utils'

interface Testimonial {
  id: string
  guest_name: string
  guest_email: string
  rating: number
  text: string
  is_featured: boolean
  guest_image_url?: string
  created_at: string
  updated_at: string
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'featured'>('all')

  useEffect(() => {
    fetchTestimonials()
  }, [filter])

  const fetchTestimonials = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const url = filter === 'featured' 
        ? '/api/admin/testimonials?featured=true'
        : '/api/admin/testimonials'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setTestimonials(data.data)
      } else {
        setError(data.error || 'Failed to fetch testimonials')
      }
    } catch (err) {
      setError('Error loading testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestimonial = () => {
    setEditingTestimonial(null)
    setShowModal(true)
  }

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setShowModal(true)
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess('Testimonial deleted successfully')
        fetchTestimonials()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to delete testimonial')
      }
    } catch (err) {
      setError('Error deleting testimonial')
    }
  }

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...testimonial,
          is_featured: !testimonial.is_featured,
          updated_by: 'admin'
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Testimonial ${testimonial.is_featured ? 'removed from' : 'added to'} featured`)
        fetchTestimonials()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update testimonial')
      }
    } catch (err) {
      setError('Error updating testimonial')
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Rating', 'Text', 'Featured', 'Date']
    const rows = testimonials.map(t => [
      t.guest_name,
      t.guest_email || '',
      t.rating,
      `"${t.text.replace(/"/g, '""')}"`,
      t.is_featured ? 'Yes' : 'No',
      formatDateCompact(t.created_at)
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `testimonials-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testimonials Manager</h2>
          <p className="text-gray-600 mt-1">Manage guest reviews and testimonials</p>
        </div>
        <div className="flex space-x-3">
          <AdminButton onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </AdminButton>
          <AdminButton onClick={handleCreateTestimonial}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </AdminButton>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Testimonials ({testimonials.length})
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'featured'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Featured ({testimonials.filter(t => t.is_featured).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <AdminAlert variant="success">
          {success}
        </AdminAlert>
      )}
      
      {error && (
        <AdminAlert variant="error">
          {error}
        </AdminAlert>
      )}

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No testimonials
            </h3>
            <p className="text-gray-600 mb-4">
              Start collecting guest reviews and testimonials.
            </p>
            <AdminButton onClick={handleCreateTestimonial} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Testimonial
            </AdminButton>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
                testimonial.is_featured ? 'border-yellow-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {testimonial.guest_image_url ? (
                      <img
                        src={testimonial.guest_image_url}
                        alt={testimonial.guest_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {testimonial.guest_name}
                      </h3>
                      {testimonial.is_featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {testimonial.guest_email && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {testimonial.guest_email}
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2">
                      {renderStars(testimonial.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({testimonial.rating}/5)
                      </span>
                    </div>
                    
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {testimonial.text}
                    </p>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Added on {formatDateCompact(testimonial.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFeatured(testimonial)}
                    className={`p-2 rounded-lg transition-colors ${
                      testimonial.is_featured 
                        ? 'text-yellow-600 hover:bg-yellow-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={testimonial.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleEditTestimonial(testimonial)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit testimonial"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete testimonial"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Testimonial Editor Modal */}
      {showModal && (
        <TestimonialEditorModal
          testimonial={editingTestimonial}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchTestimonials()
            setSuccess('Testimonial saved successfully')
            setTimeout(() => setSuccess(null), 3000)
          }}
        />
      )}
    </div>
  )
}

// Testimonial Editor Modal Component
interface TestimonialEditorModalProps {
  testimonial: Testimonial | null
  onClose: () => void
  onSave: () => void
}

function TestimonialEditorModal({ testimonial, onClose, onSave }: TestimonialEditorModalProps) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    rating: 5,
    text: '',
    is_featured: false,
    guest_image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (testimonial) {
      setFormData({
        guest_name: testimonial.guest_name,
        guest_email: testimonial.guest_email || '',
        rating: testimonial.rating,
        text: testimonial.text,
        is_featured: testimonial.is_featured,
        guest_image_url: testimonial.guest_image_url || ''
      })
    }
  }, [testimonial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = testimonial 
        ? `/api/admin/testimonials/${testimonial.id}`
        : '/api/admin/testimonials'
      
      const method = testimonial ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          created_by: 'admin',
          updated_by: 'admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        onSave()
      } else {
        setError(data.error || 'Failed to save testimonial')
      }
    } catch (err) {
      setError('Error saving testimonial')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal isOpen={true} onClose={onClose} title={testimonial ? 'Edit Testimonial' : 'Add Testimonial'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <AdminAlert variant="error">
            {error}
          </AdminAlert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Name *
          </label>
          <input
            type="text"
            value={formData.guest_name}
            onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Email
          </label>
          <input
            type="email"
            value={formData.guest_email}
            onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, rating })}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 ${
                    rating <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({formData.rating}/5)
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Testimonial Text *
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What did the guest say about their experience?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Image URL
          </label>
          <input
            type="url"
            value={formData.guest_image_url}
            onChange={(e) => setFormData({ ...formData, guest_image_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            checked={formData.is_featured}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
            Feature this testimonial
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <AdminButton type="button" variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : (testimonial ? 'Update' : 'Create')} Testimonial
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  )
}

export default TestimonialsManager
