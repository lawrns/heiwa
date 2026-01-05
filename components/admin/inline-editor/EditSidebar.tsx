'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronRight,
  ChevronDown,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  AlertTriangle,
  Settings,
} from 'lucide-react'
import { ImagePicker } from './ImagePicker'
import { HeroEditor } from './editors/HeroEditor'
import { CardsEditor } from './editors/CardsEditor'
import { TextEditor } from './editors/TextEditor'
import { FacilitiesEditor } from './editors/FacilitiesEditor'
import { SurfWeeksEditor } from './editors/SurfWeeksEditor'
import { RoomsPickerEditor } from './editors/RoomsPickerEditor'
import { HostsEditor } from './editors/HostsEditor'
import { FAQEditor } from './editors/FAQEditor'
import { SEOEditor } from './editors/SEOEditor'
import { ActivityHighlightEditor } from './editors/ActivityHighlightEditor'
import { ActivityGridEditor } from './editors/ActivityGridEditor'
import { GalleryEditor } from './editors/GalleryEditor'
import { IntroEditor } from './editors/IntroEditor'
import { CTAEditor } from './editors/CTAEditor'
import { StepsEditor } from './editors/StepsEditor'
import { AddonsEditor } from './editors/AddonsEditor'
import { LegalContentEditor } from './editors/LegalContentEditor'
import { cn } from '@/lib/utils'

interface Section {
  id: string
  page_slug: string
  section_type: string
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
}

interface PageMeta {
  slug: string
  title: string
  meta_description: string
  meta_keywords: string
  og_image: string
  is_published: boolean
}

interface EditSidebarProps {
  pageSlug: string
  onClose: () => void
}

// Available section types with display names and default content
const SECTION_TEMPLATES: Record<string, { name: string; defaultContent: Record<string, unknown> }> = {
  hero: {
    name: 'Hero',
    defaultContent: { title: 'New Hero Section', subtitle: '', description: '', video_url: '', image_url: '' },
  },
  about: {
    name: 'About / Cards',
    defaultContent: { title: 'About Us', subtitle: '', cards: [] },
  },
  'surf-weeks': {
    name: 'Surf Weeks',
    defaultContent: { title: 'Surf Weeks', subtitle: '', bullets: [] },
  },
  rooms: {
    name: 'Rooms',
    defaultContent: { title: 'Our Rooms', subtitle: '', roomIds: [] },
  },
  hosts: {
    name: 'Hosts',
    defaultContent: { title: 'Your Hosts', paragraphs: [], imageUrl: '', signature: '' },
  },
  facilities: {
    name: 'Facilities / Activities',
    defaultContent: { title: 'Activities', subtitle: '', items: [] },
  },
  faq: {
    name: 'FAQ',
    defaultContent: { title: 'Frequently Asked Questions', items: [] },
  },
  cta: {
    name: 'Call to Action',
    defaultContent: { title: 'Ready to Book?', subtitle: '', buttonText: 'Book Now', buttonUrl: '/booking' },
  },
  intro: {
    name: 'Intro Text',
    defaultContent: { title: '', subtitle: '', content: '' },
  },
  gallery: {
    name: 'Gallery',
    defaultContent: { title: 'Gallery', images: [] },
  },
  activity_highlight: {
    name: 'Activity Highlight',
    defaultContent: { title: '', description: '', image: '', link: '' },
  },
  activity_grid: {
    name: 'Activity Grid',
    defaultContent: { title: '', activities: [] },
  },
  text: {
    name: 'Text Block',
    defaultContent: { title: '', content: '' },
  },
  steps: {
    name: 'Steps',
    defaultContent: { title: 'How It Works', subtitle: '', steps: [] },
  },
  addons: {
    name: 'Add-ons',
    defaultContent: { title: 'Add-ons', subtitle: '', addons: [] },
  },
  legal_content: {
    name: 'Legal Content',
    defaultContent: { title: '', lastUpdated: '', content: '' },
  },
}

// Determine editor type based on section type
function getEditorType(sectionType: string): string {
  if (sectionType === 'hero') return 'hero'
  if (sectionType === 'surf-weeks') return 'surfWeeks'
  if (sectionType === 'rooms') return 'roomsPicker'
  if (sectionType === 'hosts') return 'hosts'
  if (sectionType === 'about') return 'cards'
  if (sectionType === 'faq') return 'faq'
  if (sectionType === 'seo') return 'seo'
  if (sectionType === 'activity_highlight') return 'activityHighlight'
  if (sectionType === 'activity_grid') return 'activityGrid'
  if (sectionType === 'gallery') return 'gallery'
  if (sectionType === 'intro') return 'intro'
  if (sectionType === 'cta') return 'cta'
  if (sectionType === 'facilities') return 'facilities'
  if (sectionType === 'steps') return 'steps'
  if (sectionType === 'addons') return 'addons'
  if (sectionType === 'legal_content') return 'legalContent'
  return 'text'
}

// Get display name for section
function getSectionDisplayName(sectionType: string): string {
  return (
    SECTION_TEMPLATES[sectionType]?.name ||
    sectionType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}

export function EditSidebar({ pageSlug, onClose }: EditSidebarProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<Record<string, unknown>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Page SEO settings
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null)
  const [showSeoPanel, setShowSeoPanel] = useState(false)
  const [isSavingSeo, setIsSavingSeo] = useState(false)

  // Fetch sections for this page
  useEffect(() => {
    async function fetchSections() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/cms/sections?page=${pageSlug}`)
        if (!res.ok) throw new Error('Failed to load sections')
        const data = await res.json()
        const sortedSections = (data.sections || []).sort(
          (a: Section, b: Section) => a.order_index - b.order_index
        )
        setSections(sortedSections)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sections')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSections()
  }, [pageSlug])

  // Fetch page metadata
  useEffect(() => {
    async function fetchPageMeta() {
      try {
        const res = await fetch(`/api/cms/pages/${pageSlug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setPageMeta(data.data)
          }
        }
      } catch (err) {
        console.error('Failed to load page meta:', err)
      }
    }
    fetchPageMeta()
  }, [pageSlug])

  // Save page SEO settings
  const handleSaveSeo = async () => {
    if (!pageMeta) return

    try {
      setIsSavingSeo(true)
      setError(null)
      
      // Send only the fields the API expects (excluding slug which is in the URL)
      const res = await fetch(`/api/cms/pages/${pageSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include credentials for admin auth
        body: JSON.stringify({
          title: pageMeta.title || '',
          meta_description: pageMeta.meta_description || '',
          meta_keywords: pageMeta.meta_keywords || '',
          og_image: pageMeta.og_image || '',
          is_published: pageMeta.is_published ?? false,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to save SEO settings' }))
        throw new Error(errorData.error || `Failed to save SEO settings (${res.status})`)
      }

      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to save SEO settings')
      }

      // Update local state with the response data
      if (result.data) {
        setPageMeta(result.data)
      }

      // Close panel after save
      setShowSeoPanel(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save SEO settings'
      setError(errorMessage)
      console.error('Error saving SEO settings:', err)
    } finally {
      setIsSavingSeo(false)
    }
  }

  // Select a section and scroll to it
  const handleSelectSection = (section: Section) => {
    setSelectedSection(section)
    setEditedContent(section.content)

    // Scroll to section on page
    const element = document.getElementById(`section-${section.section_type}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('ring-2', 'ring-orange-500', 'ring-offset-2')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-2')
      }, 2000)
    }
  }

  // Save changes
  const handleSave = async () => {
    if (!selectedSection) return

    try {
      setIsSaving(true)
      const res = await fetch(`/api/cms/sections/${selectedSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      })

      if (!res.ok) throw new Error('Failed to save changes')

      // Update local state
      setSections((prev) =>
        prev.map((s) => (s.id === selectedSection.id ? { ...s, content: editedContent } : s))
      )
      setSelectedSection({ ...selectedSection, content: editedContent })

      // Trigger page refresh to show changes
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Add new section
  const handleAddSection = async (sectionType: string) => {
    try {
      setError(null)
      const template = SECTION_TEMPLATES[sectionType]
      const maxOrderIndex = Math.max(...sections.map((s) => s.order_index), -1)

      const res = await fetch('/api/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug: pageSlug,
          section_type: sectionType,
          content: template?.defaultContent || {},
          order_index: maxOrderIndex + 1,
          is_active: true,
        }),
      })

      if (!res.ok) throw new Error('Failed to create section')
      const data = await res.json()
      if (!data?.section) throw new Error('Invalid response creating section')

      setSections((prev) =>
        [...prev, data.section].sort((a, b) => a.order_index - b.order_index)
      )
      setShowAddModal(false)

      // Auto-select the new section for editing
      handleSelectSection(data.section)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create section')
    }
  }

  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/cms/sections/${sectionId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete section')

      setSections((prev) => prev.filter((s) => s.id !== sectionId))
      setDeleteConfirm(null)

      if (selectedSection?.id === sectionId) {
        setSelectedSection(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete section')
    }
  }

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      const dragIndex = draggedIndex

      if (dragIndex === null || dragIndex === dropIndex) {
        setDraggedIndex(null)
        setDragOverIndex(null)
        return
      }

      // Reorder locally first for immediate feedback
      const newSections = [...sections]
      const [draggedSection] = newSections.splice(dragIndex, 1)
      newSections.splice(dropIndex, 0, draggedSection)

      // Update order_index values
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order_index: index,
      }))

      setSections(reorderedSections)
      setDraggedIndex(null)
      setDragOverIndex(null)

      // Save to API
      try {
        const res = await fetch('/api/cms/sections/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sections: reorderedSections.map((s) => ({ id: s.id, order_index: s.order_index })),
          }),
        })

        if (!res.ok) throw new Error('Failed to save order')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save order')
        // Refetch to restore correct order
        const refetchRes = await fetch(`/api/cms/sections?page=${pageSlug}`)
        const data = await refetchRes.json()
        setSections(
          (data.sections || []).sort((a: Section, b: Section) => a.order_index - b.order_index)
        )
      }
    },
    [draggedIndex, sections, pageSlug]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  // Render the appropriate editor
  const renderEditor = () => {
    if (!selectedSection) return null

    const editorType = getEditorType(selectedSection.section_type)
    const props = {
      content: editedContent,
      onChange: setEditedContent,
    }

    switch (editorType) {
      case 'hero':
        return <HeroEditor {...props} />
      case 'cards':
        return <CardsEditor {...props} />
      case 'surfWeeks':
        return <SurfWeeksEditor {...props} />
      case 'roomsPicker':
        return <RoomsPickerEditor {...props} />
      case 'hosts':
        return <HostsEditor {...props} />
      case 'facilities':
        return <FacilitiesEditor {...props} />
      case 'faq':
        return <FAQEditor {...props} />
      case 'seo':
        return <SEOEditor {...props} />
      case 'activityHighlight':
        return <ActivityHighlightEditor {...props} />
      case 'activityGrid':
        return <ActivityGridEditor {...props} />
      case 'gallery':
        return <GalleryEditor {...props} />
      case 'intro':
        return <IntroEditor {...props} />
      case 'cta':
        return <CTAEditor {...props} />
      case 'steps':
        return <StepsEditor {...props} />
      case 'addons':
        return <AddonsEditor {...props} />
      case 'legalContent':
        return <LegalContentEditor {...props} />
      default:
        return <TextEditor {...props} />
    }
  }

  return (
    <>
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">
            Edit {pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1)} Page
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 text-sm">{error}</div>
          ) : selectedSection ? (
            <div className="p-4">
              {/* Back button */}
              <button
                onClick={() => setSelectedSection(null)}
                className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                &larr; Back to sections
              </button>

              <h3 className="font-medium text-gray-900 mb-4">
                {getSectionDisplayName(selectedSection.section_type)}
              </h3>

              {renderEditor()}
            </div>
          ) : (
            <div className="p-4">
              {/* SEO Settings Panel */}
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowSeoPanel(!showSeoPanel)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Page Settings & SEO</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-500 transition-transform',
                      showSeoPanel && 'rotate-180'
                    )}
                  />
                </button>

                {showSeoPanel && pageMeta && (
                  <div className="p-4 space-y-4 border-t border-gray-200">
                    {/* Page Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={pageMeta.title || ''}
                        onChange={(e) => setPageMeta({ ...pageMeta, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Page title"
                      />
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={pageMeta.meta_description || ''}
                        onChange={(e) =>
                          setPageMeta({ ...pageMeta, meta_description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Brief description for search engines (160 chars recommended)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {(pageMeta.meta_description || '').length}/160 characters
                      </p>
                    </div>

                    {/* Meta Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={pageMeta.meta_keywords || ''}
                        onChange={(e) =>
                          setPageMeta({ ...pageMeta, meta_keywords: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    {/* OG Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Share Image (OG Image)
                      </label>
                      <ImagePicker
                        value={pageMeta.og_image || ''}
                        onChange={(url) => setPageMeta({ ...pageMeta, og_image: url })}
                        placeholder="Select an image for social sharing"
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveSeo}
                      disabled={isSavingSeo}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {isSavingSeo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save SEO Settings
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Drag to reorder sections:</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'flex items-center gap-2 p-3 bg-gray-50 rounded-lg transition-all',
                      draggedIndex === index && 'opacity-50',
                      dragOverIndex === index && 'ring-2 ring-orange-500 ring-offset-2',
                      !section.is_active && 'opacity-60'
                    )}
                  >
                    {/* Drag handle */}
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Section name - clickable to edit */}
                    <button
                      onClick={() => handleSelectSection(section)}
                      className="flex-1 text-left font-medium text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      {getSectionDisplayName(section.section_type)}
                      {!section.is_active && (
                        <span className="ml-2 text-xs text-gray-400">(hidden)</span>
                      )}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSelectSection(section)}
                        className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                        title="Edit section"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(section.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No sections yet.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Section
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        {selectedSection && (
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Add New Section</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SECTION_TEMPLATES).map(([type, template]) => (
                  <button
                    key={type}
                    onClick={() => handleAddSection(type)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{type}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm m-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Section?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSection(deleteConfirm)}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
