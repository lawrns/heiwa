'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Loader2
} from 'lucide-react'
import { PageSection, SECTION_TYPE_LABELS, SECTION_TYPES, DEFAULT_SECTION_CONTENT, SectionType } from '@/lib/cms-schemas'

// Section editors
import { HeroEditor } from '@/components/admin/visual-editor/editors/HeroEditor'
import { IntroEditor } from '@/components/admin/visual-editor/editors/IntroEditor'
import { ActivityHighlightEditor } from '@/components/admin/visual-editor/editors/ActivityHighlightEditor'
import { ActivityGridEditor } from '@/components/admin/visual-editor/editors/ActivityGridEditor'
import { FAQEditor } from '@/components/admin/visual-editor/editors/FAQEditor'
import { CTAEditor } from '@/components/admin/visual-editor/editors/CTAEditor'
import { FeaturesEditor } from '@/components/admin/visual-editor/editors/FeaturesEditor'

interface VisualEditorClientProps {
  slug: string
}

export default function VisualEditorClient({ slug }: VisualEditorClientProps) {
  const router = useRouter()

  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null)
  const [showAddSection, setShowAddSection] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch sections for this page
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/cms/pages/${slug}/sections?include_inactive=true`)
        const result = await response.json()

        if (result.success) {
          setSections(result.data || [])
        } else {
          setError(result.error || 'Failed to load sections')
        }
      } catch (err) {
        setError('Failed to load sections')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [slug])

  // Save a section
  const saveSection = async (section: PageSection) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/cms/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: section.content })
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update local state
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, ...result.data } : s))
      setHasChanges(false)
      return true
    } catch (err) {
      console.error('Error saving section:', err)
      return false
    } finally {
      setSaving(false)
    }
  }

  // Add new section
  const addSection = async (sectionType: SectionType) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/cms/pages/${slug}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_type: sectionType,
          content: DEFAULT_SECTION_CONTENT[sectionType]
        })
      })

      const result = await response.json()
      if (result.success) {
        setSections(prev => [...prev, result.data])
        setSelectedSection(result.data)
        setShowAddSection(false)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error adding section:', err)
    } finally {
      setSaving(false)
    }
  }

  // Delete section
  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      setSaving(true)
      const response = await fetch(`/api/cms/sections/${sectionId}?hard=true`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        setSections(prev => prev.filter(s => s.id !== sectionId))
        if (selectedSection?.id === sectionId) {
          setSelectedSection(null)
        }
      }
    } catch (err) {
      console.error('Error deleting section:', err)
    } finally {
      setSaving(false)
    }
  }

  // Reorder sections
  const moveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === sectionId)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return

    const newSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // Swap
    const temp = newSections[index]
    newSections[index] = newSections[targetIndex]
    newSections[targetIndex] = temp

    // Update order_index values
    const reorderedSections = newSections.map((s, i) => ({
      ...s,
      order_index: i
    }))

    setSections(reorderedSections)

    // Save to server
    try {
      await fetch('/api/cms/sections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: reorderedSections.map(s => ({ id: s.id, order_index: s.order_index }))
        })
      })
    } catch (err) {
      console.error('Error reordering sections:', err)
    }
  }

  // Update section content locally
  const updateSectionContent = (sectionId: string, content: Record<string, unknown>) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, content } : s
    ))
    if (selectedSection?.id === sectionId) {
      setSelectedSection(prev => prev ? { ...prev, content } : null)
    }
    setHasChanges(true)
  }

  // Get editor component for section type
  const getEditor = (section: PageSection) => {
    const commonProps = {
      content: section.content,
      onChange: (content: Record<string, unknown>) => updateSectionContent(section.id, content),
      onSave: () => saveSection({ ...section, content: sections.find(s => s.id === section.id)?.content || section.content }),
      saving
    }

    switch (section.section_type) {
      case 'hero':
        return <HeroEditor {...commonProps} />
      case 'intro':
        return <IntroEditor {...commonProps} />
      case 'activity_highlight':
        return <ActivityHighlightEditor {...commonProps} />
      case 'activity_grid':
        return <ActivityGridEditor {...commonProps} />
      case 'faq':
        return <FAQEditor {...commonProps} />
      case 'cta':
        return <CTAEditor {...commonProps} />
      case 'features':
        return <FeaturesEditor {...commonProps} />
      default:
        return (
          <div className="p-4 text-gray-500">
            No editor available for section type: {section.section_type}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/cms/pages"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {slug.replace(/-/g, ' ')} Page
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>

            <Link
              href={`/${slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              <Eye className="w-4 h-4" />
              View Live
            </Link>

            {hasChanges && selectedSection && (
              <button
                onClick={() => saveSection(selectedSection)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex">
        {/* Section List */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)]">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Sections</h2>
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-orange-600 hover:text-orange-700"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="p-2 space-y-1">
            {sections.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No sections yet. Click "Add" to create one.
              </div>
            ) : (
              sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedSection?.id === section.id
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                    ${!section.is_active ? 'opacity-50' : ''}
                  `}
                  onClick={() => setSelectedSection(section)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {SECTION_TYPE_LABELS[section.section_type as SectionType] || section.section_type}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {(section.content as Record<string, unknown>).title as string || 'No title'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up') }}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down') }}
                        disabled={index === sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSection(section.id) }}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 p-6">
          {selectedSection ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Edit: {SECTION_TYPE_LABELS[selectedSection.section_type as SectionType] || selectedSection.section_type}
                </h3>
                <button
                  onClick={() => setSelectedSection(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {getEditor(selectedSection)}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select a section to edit
            </div>
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Add Section</h3>
              <button onClick={() => setShowAddSection(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {SECTION_TYPES.filter(t => !['seo', 'testimonials', 'custom'].includes(t)).map(type => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">
                    {SECTION_TYPE_LABELS[type]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
