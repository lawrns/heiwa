'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Settings, Eye, Save, ArrowLeft, MoreVertical, Copy, Trash2, Edit, Clock, Users, MessageSquare } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminAlert from '@/components/admin/ui/AdminAlert'
import AdminModal from '@/components/admin/ui/AdminModal'
import SectionCard from './SectionCard'
import PageMetadataEditor from './PageMetadataEditor'
import SectionEditModal from './SectionEditModal'
import SectionTypeSelector from './SectionTypeSelector'
import AutoSaveManager from './AutoSaveManager'
import VersionHistory from './VersionHistory'
import CollaborationManager from './CollaborationManager'
import { PageSection, PageData } from '@/lib/cms-types'

interface PageEditorProps {
  pageSlug: string
  onBack: () => void
  initialData?: PageData
}

const pageTitles: Record<string, string> = {
  flow: 'Heiwa Flow',
  play: 'Heiwa Play',
  surf: 'Heiwa Surf',
  'surf-weeks': 'Surf Weeks',
  'the-spot': 'The Spot',
  about: 'About Us',
  contact: 'Contact'
}

const pageDescriptions: Record<string, string> = {
  flow: 'Yoga, massage, ice bath, sauna, and wellness services',
  play: 'Activities, experiences, and recreational services',
  surf: 'Surf lessons, equipment, and surf week information',
  'surf-weeks': 'Manage surf weeks listing, process, and content sections',
  'the-spot': 'Beach club, restaurant, and local attractions',
  about: 'Company story, team, and mission',
  contact: 'Contact information, location, and inquiry forms'
}

export default function PageEditor({ pageSlug, onBack, initialData }: PageEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [showAddSection, setShowAddSection] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null)
  const [showEditSection, setShowEditSection] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [isPageLocked, setIsPageLocked] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // Auto-save functionality
  useEffect(() => {
    if (!hasChanges) return

    const timer = setTimeout(() => {
      handleAutoSave()
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer)
  }, [hasChanges, pageData])

  const fetchPageData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch sections and metadata in parallel
      const [sectionsResponse, metadataResponse] = await Promise.all([
        fetch(`/api/admin/pages?page_slug=${encodeURIComponent(pageSlug)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/cms/pages/${encodeURIComponent(pageSlug)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ])

      const sectionsResult = await sectionsResponse.json().catch(() => null)
      if (!sectionsResponse.ok || !sectionsResult?.success) {
        throw new Error(sectionsResult?.error || `Failed to load page data (${sectionsResponse.status})`)
      }

      const sections = (sectionsResult.data || []) as any[]

      // Parse metadata response - may not exist for new pages
      let seoTitle = pageTitles[pageSlug] || ''
      let seoDescription = pageDescriptions[pageSlug] || ''
      let featuredImage = ''
      let lastModified = new Date().toISOString()

      if (metadataResponse.ok) {
        const metadataResult = await metadataResponse.json().catch(() => null)
        if (metadataResult?.success && metadataResult?.data) {
          const meta = metadataResult.data
          seoTitle = meta.title || seoTitle
          seoDescription = meta.meta_description || seoDescription
          featuredImage = meta.og_image || ''
          lastModified = meta.updated_at || lastModified
        }
      }

      setPageData({
        slug: pageSlug,
        title: pageTitles[pageSlug] || pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
        description: pageDescriptions[pageSlug] || '',
        sections: sections || [],
        metadata: {
          seoTitle,
          seoDescription,
          featuredImage,
          lastModified
        }
      })
    } catch (err) {
      setError('Failed to load page data')
    } finally {
      setLoading(false)
    }
  }, [pageSlug])

  useEffect(() => {
    fetchPageData()
  }, [fetchPageData])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Save all changes
      await handleAutoSave()
      
      setSuccess('Page saved successfully')
      setTimeout(() => setSuccess(null), 3000)
      setHasChanges(false)
    } catch (err) {
      setError('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !pageData) return

    const items = Array.from(pageData.sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order indices
    const updatedSections = items.map((section, index) => ({
      ...section,
      order_index: index
    }))

    setPageData({ ...pageData, sections: updatedSections })
    setHasChanges(true)

    // Update database
    try {
      const updatePromises = updatedSections.map(async (section) => {
        const response = await fetch(`/api/admin/pages/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_index: section.order_index }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorJson.message || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
          throw new Error(`Failed to update order for section ${section.id}: ${errorMessage}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(`Failed to update order: ${result.error || 'Unknown error'}`)
        }

        return result.data
      })

      await Promise.all(updatePromises)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update section order'
      console.error('Error updating section order:', err)
      setError(errorMessage)
    }
  }

  const handleAddSection = async (sectionType: string, sectionName: string) => {
    if (!pageData) return

    try {
      setError(null)
      const newSection = {
        page_slug: pageSlug,
        section_type: sectionType,
        section_name: sectionName || `${sectionType} section`,
        content: {}, // JSONB field - empty object is valid
        order_index: pageData.sections.length,
        is_active: true
      }

      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || `Failed to create section (${response.status})`
        console.error('Failed to add section:', {
          status: response.status,
          error: responseData.error,
          message: responseData.message,
          data: responseData
        })
        throw new Error(errorMessage)
      }

      if (!responseData.success) {
        throw new Error(responseData.error || 'Section creation failed')
      }

      const { data } = responseData
      setPageData({
        ...pageData,
        sections: [...pageData.sections, data]
      })
      setHasChanges(true)
      setShowAddSection(false)
      setSuccess('Section added successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add section. Please check the console for details.'
      console.error('Error adding section:', err)
      setError(errorMessage)
    }
  }

  const handleEditSection = (section: PageSection) => {
    setSelectedSection(section)
    setShowEditSection(true)
  }

  const handleSaveSection = async (updatedSection: PageSection) => {
    try {
      const response = await fetch(`/api/admin/pages/${updatedSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_name: updatedSection.section_name,
          content: updatedSection.content,
          updated_at: updatedSection.updated_at
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(`Failed to update section: ${errorMessage}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(`Failed to save section: ${result.error || 'Unknown error'}`)
      }

      // Verify the save persisted
      if (!result.data || !result.data.id) {
        throw new Error('Save response missing data - save may not have persisted')
      }

      if (pageData) {
        setPageData({
          ...pageData,
          sections: pageData.sections.map(s => 
            s.id === updatedSection.id ? updatedSection : s
          )
        })
        setHasChanges(true)
        setSuccess('Section saved successfully')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save section'
      console.error('Error saving section:', err)
      setError(errorMessage)
    }
  }

  const handleCreateVersion = async (data: PageData, notes?: string) => {
    try {
      const response = await fetch('/api/admin/page-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug: pageSlug,
          content: data,
          notes: notes || undefined,
        })
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || `Failed to create version (${response.status})`)
      }
    } catch (err) {
      console.error('Failed to create version:', err)
    }
  }

  const handleRestoreVersion = async (version: any) => {
    try {
      // Restore the content
      setPageData(version.content)
      setHasChanges(true)
      setSuccess('Version restored successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to restore version')
    }
  }

  const handleAutoSave = async (data?: PageData) => {
    const dataToSave = data || pageData
    if (!dataToSave || !autoSaveEnabled) return

    try {
      setSaving(true)
      
      // Create version history entry
      await handleCreateVersion(dataToSave, 'Auto-save')
      
      // Update all sections
      const savePromises = dataToSave.sections.map(async (section) => {
        const response = await fetch(`/api/admin/pages/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_name: section.section_name,
            content: section.content,
            order_index: section.order_index,
            is_active: section.is_active,
            updated_at: new Date().toISOString()
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorJson.message || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
          throw new Error(`Failed to save section ${section.section_name || section.id}: ${errorMessage}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(`Failed to save section ${section.section_name || section.id}: ${result.error || 'Unknown error'}`)
        }

        // Verify the save persisted - API returns { success: true, data: {...} }
        if (!result.data || !result.data.id) {
          throw new Error(`Save response missing data for section ${section.section_name || section.id}`)
        }

        return result.data
      })

      await Promise.all(savePromises)
      setHasChanges(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Auto-save failed'
      console.error('Auto-save error:', err)
      setError(errorMessage)
      // Don't clear hasChanges on error so user can retry
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const response = await fetch(`/api/admin/pages/${sectionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete section')

      if (pageData) {
        setPageData({
          ...pageData,
          sections: pageData.sections.filter(s => s.id !== sectionId)
        })
        setHasChanges(true)
      }
    } catch (err) {
      setError('Failed to delete section')
    }
  }

  const handleDuplicateSection = async (section: PageSection) => {
    if (!pageData) return

    try {
      const duplicatedSection = {
        page_slug: pageSlug,
        section_type: section.section_type,
        section_name: `${section.section_name} (Copy)`,
        content: section.content,
        order_index: pageData.sections.length,
        is_active: true
      }

      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedSection),
      })

      if (!response.ok) throw new Error('Failed to duplicate section')

      const { data } = await response.json()
      setPageData({
        ...pageData,
        sections: [...pageData.sections, data]
      })
      setHasChanges(true)
    } catch (err) {
      setError('Failed to duplicate section')
    }
  }

  const handleToggleActive = async (sectionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/pages/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          updated_at: new Date().toISOString()
        }),
      })

      if (!response.ok) throw new Error('Failed to update section')

      if (pageData) {
        setPageData({
          ...pageData,
          sections: pageData.sections.map(s => 
            s.id === sectionId ? { ...s, is_active: isActive } : s
          )
        })
        setHasChanges(true)
      }
    } catch (err) {
      setError('Failed to update section status')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Page not found</h3>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageData.title}</h1>
            <p className="text-gray-600">/{pageData.slug} • {pageData.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
          )}
          <AdminButton variant="outline" onClick={() => setShowVersionHistory(true)}>
            <Clock className="w-4 h-4 mr-2" />
            Version History
          </AdminButton>
          <AdminButton variant="outline" onClick={() => setShowPageSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Page Settings
          </AdminButton>
          <AdminButton variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </AdminButton>
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </AdminButton>
        </div>
      </div>

      {/* Auto-Save Manager */}
      {autoSaveEnabled && (
        <AutoSaveManager
          data={pageData}
          onSave={handleAutoSave}
          debounceMs={3000}
          maxHistory={20}
        />
      )}

      {/* Collaboration Manager */}
      <CollaborationManager
        pageSlug={pageSlug}
        currentUser={{
          id: 'admin',
          name: 'Admin User',
          email: 'admin@heiwa-house.com'
        }}
        isLocked={isPageLocked}
        onLockToggle={setIsPageLocked}
      />

      {/* Alerts */}
      {error && (
        <div className="mb-6">
          <AdminAlert variant="error">
            {error}
          </AdminAlert>
        </div>
      )}
      {success && (
        <div className="mb-6">
          <AdminAlert variant="success">
            {success}
          </AdminAlert>
        </div>
      )}

      {/* Page Sections */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Content Sections</h2>
            <AdminButton variant="primary" size="sm" onClick={() => setShowAddSection(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </AdminButton>
          </div>
        </div>

        {pageData.sections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-500 mb-4">Start building your page by adding your first section</p>
            <AdminButton variant="primary" onClick={() => setShowAddSection(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Section
            </AdminButton>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {pageData.sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'bg-gray-50 shadow-lg' : ''}`}
                        >
                          <SectionCard
                            section={section}
                            index={index}
                            onEdit={() => handleEditSection(section)}
                            onDelete={() => handleDeleteSection(section.id)}
                            onDuplicate={() => handleDuplicateSection(section)}
                            onToggleActive={(isActive) => handleToggleActive(section.id, isActive)}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Add Section Modal */}
      <AdminModal
        isOpen={showAddSection}
        onClose={() => setShowAddSection(false)}
        title="Add Section"
      >
        <SectionTypeSelector
          onSelect={(type, name) => handleAddSection(type, name)}
          onCancel={() => setShowAddSection(false)}
        />
      </AdminModal>

      {/* Page Settings Modal */}
      <AdminModal
        isOpen={showPageSettings}
        onClose={() => setShowPageSettings(false)}
        title="Page Settings"
      >
        <PageMetadataEditor
          pageData={pageData}
          onSave={async (metadata: PageData['metadata']) => {
            try {
              // Save metadata to API
              const response = await fetch(`/api/cms/pages/${pageSlug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: metadata.seoTitle,
                  meta_description: metadata.seoDescription,
                  meta_keywords: '',
                  og_image: metadata.featuredImage || '',
                  is_published: true
                })
              })

              if (!response.ok) {
                const result = await response.json().catch(() => null)
                throw new Error(result?.error || `Failed to save SEO settings (${response.status})`)
              }

              const result = await response.json()
              if (!result.success) {
                throw new Error(result.error || 'Failed to save SEO settings')
              }

              // Update local state on success
              setPageData({ ...pageData, metadata })
              setSuccess('Page settings saved successfully')
              setTimeout(() => setSuccess(null), 3000)
              setShowPageSettings(false)
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to save page settings'
              console.error('Error saving page metadata:', err)
              setError(errorMessage)
            }
          }}
          onCancel={() => setShowPageSettings(false)}
        />
      </AdminModal>

      {/* Edit Section Modal */}
      <SectionEditModal
        isOpen={showEditSection}
        onClose={() => setShowEditSection(false)}
        section={selectedSection}
        onSave={handleSaveSection}
      />

      {/* Version History Modal */}
      <VersionHistory
        pageSlug={pageSlug}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        onRestore={handleRestoreVersion}
      />
    </div>
  )
}
