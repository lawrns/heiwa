'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Image as ImageIcon, Video, Type, Wand2 } from 'lucide-react'

interface PageSection {
  id: string
  page_slug: string
  section_type: string
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface HomepageContent {
  id: string
  section: string
  title: string
  subtitle?: string
  description?: string
  content: string
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  linkText?: string
  isActive: boolean
  order: number
}

export default function HomepageCMSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<HomepageContent[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)

        // Fetch from the unified page_sections table
        const response = await fetch('/api/cms/sections?page=home&t=' + Date.now(), {
          cache: 'no-store'
        })
        const result = await response.json()

        if (result.sections && result.sections.length > 0) {
          // Map page_sections data to component state
          setContent(result.sections.map((item: PageSection) => ({
            id: item.id,
            section: item.section_type,
            title: item.content?.title || '',
            subtitle: item.content?.subtitle || '',
            description: item.content?.description || '',
            content: JSON.stringify(item.content),
            imageUrl: item.content?.image_url || item.content?.background_image || '',
            videoUrl: item.content?.video_url || '',
            linkUrl: item.content?.primary_link_url || item.content?.link_url || '',
            linkText: item.content?.primary_link_text || item.content?.link_text || '',
            isActive: item.is_active ?? true,
            order: item.order_index || 0
          })))
          console.log(`✅ Loaded ${result.sections.length} homepage sections from page_sections`)
        } else {
          console.warn('⚠️ No homepage content found in page_sections table')
          setContent([])
        }
      } catch (error) {
        console.error('❌ Error fetching homepage content:', error)
        setContent([])
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const savedSections: string[] = []
    const failedSections: Array<{ section: string; error: string }> = []

    try {
      // Save each section to the unified page_sections API
      for (const section of content) {
        const payload = {
          content: {
            title: section.title,
            subtitle: section.subtitle,
            description: section.description,
            image_url: section.imageUrl,
            video_url: section.videoUrl,
            primary_link_url: section.linkUrl,
            primary_link_text: section.linkText
          },
          is_active: section.isActive,
          order_index: section.order
        }

        try {
          // Update existing section via the unified API
          const response = await fetch(`/api/cms/sections/${section.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error || 'Unknown error')
          }

          savedSections.push(section.section)
        } catch (sectionError) {
          const errorMessage = sectionError instanceof Error ? sectionError.message : 'Unknown error'
          console.error(`Error saving section ${section.section}:`, sectionError)
          failedSections.push({ section: section.section, error: errorMessage })
        }
      }

      // Report results
      if (failedSections.length === 0) {
        alert(`✅ Successfully saved ${savedSections.length} section(s)!`)
        window.location.reload()
      } else if (savedSections.length > 0) {
        const failedList = failedSections.map(f => `\n- ${f.section}: ${f.error}`).join('')
        alert(`⚠️ Partially saved:\n\nSaved: ${savedSections.length} section(s)\nFailed: ${failedSections.length} section(s)${failedList}`)
      } else {
        const failedList = failedSections.map(f => `\n- ${f.section}: ${f.error}`).join('')
        throw new Error(`Failed to save all sections:${failedList}`)
      }
    } catch (error) {
      console.error('Error saving content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`❌ Error saving content: ${errorMessage}\n\nPlease check the browser console for details.`)
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (id: string, field: keyof HomepageContent, value: unknown) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'hero':
        return <Video size={20} className="text-blue-500" />
      case 'surf-weeks':
        return <Type size={20} className="text-cyan-500" />
      case 'about':
        return <ImageIcon size={20} className="text-green-500" />
      case 'rooms':
        return <ImageIcon size={20} className="text-purple-500" />
      case 'facilities':
        return <ImageIcon size={20} className="text-orange-500" />
      default:
        return <Type size={20} className="text-gray-500" />
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'hero':
        return 'bg-blue-100 text-blue-800'
      case 'surf-weeks':
        return 'bg-cyan-100 text-cyan-800'
      case 'about':
        return 'bg-green-100 text-green-800'
      case 'rooms':
        return 'bg-purple-100 text-purple-800'
      case 'facilities':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Content Management</h1>
        </div>
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Content Management</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/', '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Use Visual Editor
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wand2 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Visual Editor Available</h3>
            <p className="text-sm text-blue-700 mt-1">
              For a better editing experience, visit the{' '}
              <a href="/" target="_blank" className="underline font-medium">homepage</a>{' '}
              and click &quot;Edit Page&quot; in the admin toolbar to use the inline visual editor.
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {content.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Type className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Homepage Content Found</h3>
              <p className="text-gray-600 mb-6">
                The page_sections table has no homepage entries. Use the visual editor to create sections.
              </p>
              <button
                onClick={() => window.open('/', '_blank')}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Open Visual Editor
              </button>
            </div>
          </div>
        ) : (
          content.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSectionIcon(section.section)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {section.section.replace('-', ' ')} Section
                    </h3>
                    <p className="text-sm text-gray-600">Order: {section.order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSectionColor(section.section)}`}>
                    {section.section}
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={section.isActive}
                      onChange={(e) => updateContent(section.id, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-6 space-y-4">
              {previewMode ? (
                /* Preview Mode */
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h4>
                    {section.subtitle && (
                      <p className="text-lg text-gray-700 mb-2">{section.subtitle}</p>
                    )}
                    {section.description && (
                      <p className="text-gray-600 mb-4">{section.description}</p>
                    )}
                    {section.imageUrl && (
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <ImageIcon size={48} className="text-gray-400" />
                        <span className="ml-2 text-gray-500 text-sm truncate max-w-xs">{section.imageUrl}</span>
                      </div>
                    )}
                    {section.videoUrl && (
                      <div className="w-full h-48 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                        <Video size={48} className="text-white" />
                        <span className="ml-2 text-white text-sm truncate max-w-xs">{section.videoUrl}</span>
                      </div>
                    )}
                    {section.linkUrl && section.linkText && (
                      <div className="inline-block px-4 py-2 bg-accent text-white rounded-lg">
                        {section.linkText}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateContent(section.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={section.subtitle || ''}
                        onChange={(e) => updateContent(section.id, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={section.description || ''}
                      onChange={(e) => updateContent(section.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={section.imageUrl || ''}
                        onChange={(e) => updateContent(section.id, 'imageUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={section.videoUrl || ''}
                        onChange={(e) => updateContent(section.id, 'videoUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link URL
                      </label>
                      <input
                        type="text"
                        value={section.linkUrl || ''}
                        onChange={(e) => updateContent(section.id, 'linkUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="/surf-weeks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Text
                      </label>
                      <input
                        type="text"
                        value={section.linkText || ''}
                        onChange={(e) => updateContent(section.id, 'linkText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                        placeholder="Explore surf weeks"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order (Display Order)
                    </label>
                    <input
                      type="number"
                      value={section.order}
                      onChange={(e) => updateContent(section.id, 'order', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="mr-2 h-5 w-5" />
            View Live Homepage
          </button>
          <button
            onClick={() => {
              const activeSections = content.filter(s => s.isActive).length
              alert(`Active sections: ${activeSections}/${content.length}`)
            }}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Type className="mr-2 h-5 w-5" />
            Check Active Sections
          </button>
          <button
            onClick={() => {
              const sectionsWithMedia = content.filter(s => s.imageUrl || s.videoUrl).length
              alert(`Sections with media: ${sectionsWithMedia}/${content.length}`)
            }}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="mr-2 h-5 w-5" />
            Check Media Coverage
          </button>
        </div>
      </div>
    </div>
  )
}
