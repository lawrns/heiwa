'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, Save, Loader2 } from 'lucide-react'
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

interface Section {
  id: string
  page_slug: string
  section_type: string
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
}

interface EditSidebarProps {
  pageSlug: string
  onClose: () => void
}

// Determine editor type based on section type
function getEditorType(sectionType: string): 'hero' | 'cards' | 'text' | 'facilities' | 'surfWeeks' | 'roomsPicker' | 'hosts' | 'faq' | 'seo' | 'activityHighlight' | 'activityGrid' | 'gallery' | 'intro' | 'cta' {
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
  return 'text'
}

// Get display name for section
function getSectionDisplayName(sectionType: string): string {
  return sectionType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function EditSidebar({ pageSlug, onClose }: EditSidebarProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<Record<string, unknown>>({})

  const hasHostsSection = sections.some(s => s.section_type === 'hosts')

  const handleAddHostsSection = async () => {
    try {
      setError(null)
      const res = await fetch('/api/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug: pageSlug,
          section_type: 'hosts',
          content: {
            title: 'Your Hosts',
            hosts: [],
          },
          order_index: sections.length,
        }),
      })

      if (!res.ok) throw new Error('Failed to create hosts section')
      const data = await res.json()
      if (!data?.section) throw new Error('Invalid response creating hosts section')

      setSections(prev => [...prev, data.section])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create hosts section')
    }
  }

  // Fetch sections for this page
  useEffect(() => {
    async function fetchSections() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/cms/sections?page=${pageSlug}`)
        if (!res.ok) throw new Error('Failed to load sections')
        const data = await res.json()
        setSections(data.sections || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sections')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSections()
  }, [pageSlug])

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
      setSections(prev =>
        prev.map(s =>
          s.id === selectedSection.id ? { ...s, content: editedContent } : s
        )
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
      default:
        return <TextEditor {...props} />
    }
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col">
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
            <p className="text-sm text-gray-500 mb-4">
              Select a section to edit:
            </p>

            {/* Common missing section helpers */}
            {pageSlug === 'home' && !hasHostsSection && (
              <div className="mb-4 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-900 font-medium">Hosts section is missing</div>
                <div className="text-xs text-orange-800 mt-1">
                  Add it so you can edit it from the inline editor.
                </div>
                <button
                  onClick={handleAddHostsSection}
                  className="mt-3 w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
                  type="button"
                >
                  Add Hosts Section
                </button>
              </div>
            )}

            <div className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {getSectionDisplayName(section.section_type)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
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
  )
}
