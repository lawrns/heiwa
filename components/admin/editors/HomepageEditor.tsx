"use client"

// Homepage Editor Component
// Comprehensive editor for managing homepage sections with drag-and-drop

import React, { useState, useEffect } from 'react'
import { 
  AdminButton, 
  AdminInput, 
  AdminTextarea, 
  AdminSelect, 
  AdminModal, 
  AdminAlert,
  AdminTable
} from '../ui'
import { HomepageSection } from '@/lib/cms-validators'
import { 
  Eye, 
  EyeOff, 
  Save,
  X
} from 'lucide-react'

interface HomepageEditorProps {
  className?: string
}

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'activities_around', label: 'Activities Around' },
  { value: 'what_we_are_about', label: 'What We Are About' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'cta', label: 'Call to Action' }
] as const

const HomepageEditor: React.FC<HomepageEditorProps> = ({ className }) => {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Load sections
  const loadSections = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cms/homepage?limit=200&sort_by=order_index&sort_order=asc', {
        method: 'GET'
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.message || `Failed to load sections (${response.status})`)
      }

      setSections(result?.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSections()
  }, [])

  // Show alert
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  // Handle edit
  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section)
    setIsModalOpen(true)
  }

  // Handle create
  const handleCreate = () => {
    setEditingSection(null)
    setIsModalOpen(true)
  }

  // Handle delete
  const handleDelete = async (section: HomepageSection) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const response = await fetch(`/api/cms/homepage?id=${encodeURIComponent(String(section.id))}`, {
        method: 'DELETE'
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.message || `Failed to delete (${response.status})`)
      
      showAlert('success', 'Section deleted successfully')
      loadSections()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed to delete section')
    }
  }

  // Handle toggle active
  const handleToggleActive = async (section: HomepageSection) => {
    try {
      const response = await fetch('/api/cms/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: section.id, is_active: !section.is_active })
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.message || `Failed to toggle (${response.status})`)
      
      showAlert('success', `Section ${section.is_active ? 'deactivated' : 'activated'} successfully`)
      loadSections()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed to toggle section')
    }
  }

  // Handle reorder
  const handleReorder = async (section: HomepageSection, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === section.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= sections.length) return

    try {
      const updatedSections = [...sections]
      const [movedSection] = updatedSections.splice(currentIndex, 1)
      updatedSections.splice(newIndex, 0, movedSection)

      // Update order indices
      const updates = updatedSections.map((s, index) => ({ id: s.id, order_index: index }))

      await Promise.all(
        updates.map(async (u) => {
          const response = await fetch('/api/cms/homepage', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u),
          })
          if (!response.ok) {
            const result = await response.json().catch(() => null)
            throw new Error(result?.message || `Failed to reorder (${response.status})`)
          }
        })
      )
      
      showAlert('success', 'Section reordered successfully')
      loadSections()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed to reorder section')
    }
  }

  // Table columns
  const columns: AdminTableColumn<HomepageSection>[] = [
    {
      key: 'section_type',
      title: 'Section Type',
      render: (value: unknown) => {
        const type = SECTION_TYPES.find(t => t.value === value)
        return type?.label || String(value)
      }
    },
    {
      key: 'title',
      title: 'Title',
      render: (value: unknown) => String(value) || 'No title'
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: unknown) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'order_index',
      title: 'Order',
      align: 'center'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <AdminButton
          variant="primary"
          icon="add"
          onClick={handleCreate}
        >
          Add Section
        </AdminButton>
      </div>

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <AdminAlert
            variant={alert.type}
            dismissible
            onDismiss={() => setAlert(null)}
          >
            {alert.message}
          </AdminAlert>
        </div>
      )}

      {/* Error */}
      {error && (
        <AdminAlert variant="error" className="mb-4">
          {error}
        </AdminAlert>
      )}

      {/* Table */}
      <AdminTable
        data={sections}
        columns={columns}
        empty="No homepage sections found. Create your first section to get started."
        onRowClick={(row) => handleEdit(row)}
        rowClassName={(row) => !row.is_active ? 'opacity-60' : ''}
      />

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        {sections.map((section, index) => (
          <div key={section.id} className="flex gap-1">
            <AdminButton
              variant="ghost"
              size="sm"
              icon="edit"
              onClick={() => handleEdit(section)}
            >
              Edit
            </AdminButton>
            
            <AdminButton
              variant="ghost"
              size="sm"
              icon={section.is_active ? 'hide' : 'view'}
              onClick={() => handleToggleActive(section)}
            >
              {section.is_active ? 'Hide' : 'Show'}
            </AdminButton>
            
            <AdminButton
              variant="ghost"
              size="sm"
              icon="up"
              onClick={() => handleReorder(section, 'up')}
              disabled={index === 0}
            >
              Up
            </AdminButton>
            
            <AdminButton
              variant="ghost"
              size="sm"
              icon="down"
              onClick={() => handleReorder(section, 'down')}
              disabled={index === sections.length - 1}
            >
              Down
            </AdminButton>
            
            <AdminButton
              variant="destructive"
              size="sm"
              icon="delete"
              onClick={() => handleDelete(section)}
            >
              Delete
            </AdminButton>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? 'Edit Section' : 'Create Section'}
        size="lg"
      >
        <HomepageSectionForm
          section={editingSection}
          onSave={() => {
            setIsModalOpen(false)
            loadSections()
            showAlert('success', `Section ${editingSection ? 'updated' : 'created'} successfully`)
          }}
          onCancel={() => setIsModalOpen(false)}
          onError={(message) => showAlert('error', message)}
        />
      </AdminModal>
    </div>
  )
}

// Form component (simplified for this example)
const HomepageSectionForm: React.FC<{
  section?: HomepageSection | null
  onSave: () => void
  onCancel: () => void
  onError: (message: string) => void
}> = ({ section, onSave, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    section_type: section?.section_type || 'hero',
    title: section?.title || '',
    subtitle: section?.subtitle || '',
    description: section?.description || '',
    video_url: section?.video_url || '',
    background_image: section?.background_image || '',
    link_url: section?.link_url || '',
    link_text: section?.link_text || '',
    is_active: section?.is_active ?? true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        order_index: section?.order_index || 0
      }

      if (section) {
        const response = await fetch('/api/cms/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: section.id, ...payload })
        })
        const result = await response.json().catch(() => null)
        if (!response.ok) throw new Error(result?.message || `Failed to update (${response.status})`)
      } else {
        const response = await fetch('/api/cms/homepage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const result = await response.json().catch(() => null)
        if (!response.ok) throw new Error(result?.message || `Failed to create (${response.status})`)
      }

      onSave()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AdminSelect
        label="Section Type"
        options={SECTION_TYPES}
        value={formData.section_type}
        onChange={(value) => setFormData({ ...formData, section_type: value as HomepageSection['section_type'] })}
        required
      />

      <AdminInput
        label="Title"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
      />

      <AdminInput
        label="Subtitle"
        value={formData.subtitle}
        onChange={(value) => setFormData({ ...formData, subtitle: value })}
      />

      <AdminTextarea
        label="Description"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        rows={4}
      />

      <AdminInput
        label="Video URL"
        type="url"
        value={formData.video_url}
        onChange={(value) => setFormData({ ...formData, video_url: value })}
      />

      <AdminInput
        label="Background Image URL"
        type="url"
        value={formData.background_image}
        onChange={(value) => setFormData({ ...formData, background_image: value })}
      />

      <AdminInput
        label="Link URL"
        type="url"
        value={formData.link_url}
        onChange={(value) => setFormData({ ...formData, link_url: value })}
      />

      <AdminInput
        label="Link Text"
        value={formData.link_text}
        onChange={(value) => setFormData({ ...formData, link_text: value })}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <AdminButton
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </AdminButton>
        <AdminButton
          variant="primary"
          type="submit"
          loading={saving}
          icon="save"
        >
          {section ? 'Update' : 'Create'}
        </AdminButton>
      </div>
    </form>
  )
}

export default HomepageEditor
