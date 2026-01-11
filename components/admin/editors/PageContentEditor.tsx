'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, FileText, Image, Video, Star, Layout, DollarSign } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminModal from '@/components/admin/ui/AdminModal'
import AdminAlert from '@/components/admin/ui/AdminAlert'
import { formatDateCompact } from '@/lib/utils'

interface PageContent {
  id: string
  page_slug: string
  section_type: string
  section_name: string
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const PAGES = [
  { value: 'flow', label: 'Flow - Yoga & Wellness' },
  { value: 'play', label: 'Play - Activities & Fun' },
  { value: 'surf', label: 'Surf - Surfing & Lessons' },
  { value: 'the-spot', label: 'The Spot - Location & Venue' },
  { value: 'about', label: 'About - Our Story' },
  { value: 'contact', label: 'Contact - Get in Touch' }
]

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section', icon: Layout },
  { value: 'intro', label: 'Introduction', icon: FileText },
  { value: 'features', label: 'Features Grid', icon: Star },
  { value: 'gallery', label: 'Gallery', icon: Image },
  { value: 'pricing', label: 'Pricing', icon: DollarSign },
  { value: 'text', label: 'Text Content', icon: FileText },
  { value: 'image_text', label: 'Image & Text', icon: Image },
  { value: 'video', label: 'Video Section', icon: Video },
  { value: 'custom', label: 'Custom Content', icon: FileText }
]

export function PageContentEditor() {
  const [selectedPage, setSelectedPage] = useState('flow')
  const [pageContent, setPageContent] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSection, setEditingSection] = useState<PageContent | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPageContent()
  }, [selectedPage])

  const fetchPageContent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/pages?page_slug=${selectedPage}`)
      const data = await response.json()
      
      if (data.success) {
        setPageContent(data.data)
      } else {
        setError(data.error || 'Failed to fetch page content')
      }
    } catch (err) {
      setError('Error loading page content')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSection = () => {
    setEditingSection(null)
    setShowModal(true)
  }

  const handleEditSection = (section: PageContent) => {
    setEditingSection(section)
    setShowModal(true)
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return
    
    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess('Section deleted successfully')
        fetchPageContent()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to delete section')
      }
    } catch (err) {
      setError('Error deleting section')
    }
  }

  const handleToggleActive = async (section: PageContent) => {
    try {
      const response = await fetch(`/api/admin/pages/${section.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...section,
          is_active: !section.is_active,
          updated_by: 'admin'
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`Section ${section.is_active ? 'deactivated' : 'activated'} successfully`)
        fetchPageContent()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update section')
      }
    } catch (err) {
      setError('Error updating section')
    }
  }

  const getSectionIcon = (sectionType: string) => {
    const section = SECTION_TYPES.find(s => s.value === sectionType)
    return section ? section.icon : FileText
  }

  const getSectionTypeLabel = (sectionType: string) => {
    const section = SECTION_TYPES.find(s => s.value === sectionType)
    return section ? section.label : sectionType
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Page Content Editor</h2>
          <p className="text-gray-600 mt-1">Manage content sections for your pages</p>
        </div>
        <AdminButton onClick={handleCreateSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </AdminButton>
      </div>

      {/* Page Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Page
        </label>
        <select
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {PAGES.map(page => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
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

      {/* Content Sections */}
      <div className="space-y-4">
        {pageContent.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content sections
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first content section to this page.
            </p>
            <AdminButton onClick={handleCreateSection} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </AdminButton>
          </div>
        ) : (
          pageContent.map((section, index) => {
            const Icon = getSectionIcon(section.section_type)
            return (
              <div
                key={section.id}
                className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
                  section.is_active ? 'border-gray-200' : 'border-gray-100 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {section.section_name || getSectionTypeLabel(section.section_type)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getSectionTypeLabel(section.section_type)}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Order: {section.order_index} •
                        Created: {formatDateCompact(section.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(section)}
                      className={`p-2 rounded-lg transition-colors ${
                        section.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={section.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {section.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEditSection(section)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit section"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Section Editor Modal */}
      {showModal && (
        <SectionEditorModal
          section={editingSection}
          pageSlug={selectedPage}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchPageContent()
            setSuccess('Section saved successfully')
            setTimeout(() => setSuccess(null), 3000)
          }}
        />
      )}
    </div>
  )
}

// Section Editor Modal Component
interface SectionEditorModalProps {
  section: PageContent | null
  pageSlug: string
  onClose: () => void
  onSave: () => void
}

function SectionEditorModal({ section, pageSlug, onClose, onSave }: SectionEditorModalProps) {
  const [formData, setFormData] = useState({
    section_name: '',
    section_type: 'hero',
    content: {},
    order_index: 0,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (section) {
      setFormData({
        section_name: section.section_name,
        section_type: section.section_type,
        content: section.content,
        order_index: section.order_index,
        is_active: section.is_active
      })
    }
  }, [section])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = section 
        ? `/api/admin/pages/${section.id}`
        : '/api/admin/pages'
      
      const method = section ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          page_slug: pageSlug,
          created_by: 'admin',
          updated_by: 'admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        onSave()
      } else {
        setError(data.error || 'Failed to save section')
      }
    } catch (err) {
      setError('Error saving section')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal isOpen={true} onClose={onClose} title={section ? 'Edit Section' : 'Add Section'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <AdminAlert variant="error">
            {error}
          </AdminAlert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Type
          </label>
          <select
            value={formData.section_type}
            onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SECTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Name
          </label>
          <input
            type="text"
            value={formData.section_name}
            onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Hero Section, Features Grid"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Index
          </label>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Section is active
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <AdminButton type="button" variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : (section ? 'Update' : 'Create')} Section
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  )
}

export default PageContentEditor
