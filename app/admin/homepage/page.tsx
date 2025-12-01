'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Image as ImageIcon, Video, Type, Link as LinkIcon } from 'lucide-react'

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
  blogConfig?: {
    title?: string
    description?: string
    readMoreText?: string
    limit?: number
    showCategory?: boolean
    showDate?: boolean
    showReadingTime?: boolean
  }
}

interface HomepageContentApiResponse {
  id: string
  section_type?: string
  section?: string
  title: string
  subtitle?: string
  description?: string
  content?: string
  image_url?: string
  background_image?: string
  video_url?: string
  link_url?: string
  link_text?: string
  is_active?: boolean
  order?: number
  order_index?: number
  blog_config?: {
    title?: string
    description?: string
    readMoreText?: string
    limit?: number
    showCategory?: boolean
    showDate?: boolean
    showReadingTime?: boolean
  }
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
        
        // Try the new API endpoint first (homepage_sections table)
        let response = await fetch('/api/cms/homepage?t=' + Date.now(), {
          cache: 'no-store'
        })
        let result = await response.json()
        
        // If empty, fallback to old endpoint (homepage_content table)
        if (!result.data || result.data.length === 0) {
          console.warn('⚠️ No sections in homepage_sections table, trying homepage_content...')
          response = await fetch('/api/admin/homepage?t=' + Date.now(), {
            cache: 'no-store'
          })
          result = await response.json()
        }
        
        if (result.success && result.data && result.data.length > 0) {
          // Map API response to component state - use REAL data from database
          setContent(result.data.map((item: HomepageContentApiResponse) => ({
            id: item.id,
            section: item.section_type || item.section,
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            content: item.content,
            imageUrl: item.image_url || item.background_image,
            videoUrl: item.video_url,
            linkUrl: item.link_url,
            linkText: item.link_text,
            isActive: item.is_active ?? true,
            order: item.order || item.order_index || 0,
            blogConfig: item.blog_config ? (typeof item.blog_config === 'string' ? JSON.parse(item.blog_config) : item.blog_config) : undefined
          })))
          console.log(`✅ Loaded ${result.data.length} homepage sections`)
        } else {
          // If no data exists, show empty state instead of template
          console.warn('⚠️ No homepage content found in database')
          setContent([])
        }
      } catch (error) {
        console.error('❌ Error fetching homepage content:', error)
        // On error, show empty state instead of fallback template
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
      // Save each section to the API
      for (const section of content) {
        const payload = {
          id: section.id,
          section: section.section,
          title: section.title,
          subtitle: section.subtitle,
          description: section.description,
          content: section.content,
          imageUrl: section.imageUrl,
          videoUrl: section.videoUrl,
          linkUrl: section.linkUrl,
          linkText: section.linkText,
          isActive: section.isActive,
          order: section.order,
          blogConfig: section.blogConfig
        }

        try {
          // Check if section exists (has a real UUID from database)
          if (section.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(section.id)) {
            // Update existing section
            const response = await fetch('/api/admin/homepage', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })

            // Check HTTP status code
            if (!response.ok) {
              const errorText = await response.text()
              let errorMessage = `HTTP ${response.status}: ${response.statusText}`
              try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error || errorJson.message || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
              throw new Error(`Failed to update ${section.section}: ${errorMessage}`)
            }

            const result = await response.json()
            if (!result.success) {
              throw new Error(`Failed to update ${section.section}: ${result.error || 'Unknown error'}`)
            }

            // Verify the save persisted by checking the returned data
            if (!result.data || !result.data.id) {
              throw new Error(`Update response missing data for ${section.section}`)
            }

            savedSections.push(section.section)
          } else {
            // Create new section
            const response = await fetch('/api/admin/homepage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })

            // Check HTTP status code
            if (!response.ok) {
              const errorText = await response.text()
              let errorMessage = `HTTP ${response.status}: ${response.statusText}`
              try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error || errorJson.message || errorMessage
              } catch {
                errorMessage = errorText || errorMessage
              }
              throw new Error(`Failed to create ${section.section}: ${errorMessage}`)
            }

            const result = await response.json()
            if (!result.success) {
              throw new Error(`Failed to create ${section.section}: ${result.error || 'Unknown error'}`)
            }

            // Verify the save persisted by checking the returned data
            if (!result.data || !result.data.id) {
              throw new Error(`Create response missing data for ${section.section}`)
            }

            savedSections.push(section.section)
          }
        } catch (sectionError) {
          const errorMessage = sectionError instanceof Error ? sectionError.message : 'Unknown error'
          console.error(`Error saving section ${section.section}:`, sectionError)
          failedSections.push({ section: section.section, error: errorMessage })
        }
      }

      // Report results
      if (failedSections.length === 0) {
        alert(`✅ Successfully saved ${savedSections.length} section(s)!`)
        // Refresh content to show updated data
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

  const updateContent = (id: string, field: keyof HomepageContent, value: any) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'hero':
        return <Video size={20} className="text-blue-500" />
      case 'features':
        return <ImageIcon size={20} className="text-green-500" />
      case 'activities':
        return <ImageIcon size={20} className="text-purple-500" />
      case 'testimonials':
        return <Type size={20} className="text-orange-500" />
      case 'cta':
        return <LinkIcon size={20} className="text-red-500" />
      default:
        return <Type size={20} className="text-gray-500" />
    }
  }

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'hero':
        return 'bg-blue-100 text-blue-800'
      case 'features':
        return 'bg-green-100 text-green-800'
      case 'activities':
        return 'bg-purple-100 text-purple-800'
      case 'testimonials':
        return 'bg-orange-100 text-orange-800'
      case 'cta':
        return 'bg-red-100 text-red-800'
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

      {/* Content Sections */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : content.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Homepage Content Found</h3>
              <p className="text-gray-600 mb-6">
                The homepage_content table is empty. Create sections to manage your homepage content.
              </p>
              <button
                onClick={() => {
                  // Add a new empty section
                  const newSection: HomepageContent = {
                    id: `section-${Date.now()}`,
                    section: 'hero',
                    title: 'New Section',
                    subtitle: '',
                    description: '',
                    content: '',
                    imageUrl: '',
                    videoUrl: '',
                    linkUrl: '',
                    linkText: '',
                    isActive: true,
                    order: 1
                  }
                  setContent([newSection])
                }}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Section
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
                      {section.section} Section
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
                        <span className="ml-2 text-gray-500">Image: {section.imageUrl}</span>
                      </div>
                    )}
                    {section.videoUrl && (
                      <div className="w-full h-48 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                        <Video size={48} className="text-white" />
                        <span className="ml-2 text-white">Video: {section.videoUrl}</span>
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

                  {/* Blog Configuration - Only show for blog section */}
                  {section.section === 'blog' && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Blog Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Posts to Display
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={section.blogConfig?.limit || 6}
                            onChange={(e) => {
                              const newConfig = {
                                ...(section.blogConfig || {}),
                                limit: parseInt(e.target.value) || 6
                              }
                              updateContent(section.id, 'blogConfig', newConfig)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={section.blogConfig?.showCategory !== false}
                              onChange={(e) => {
                                const newConfig = {
                                  ...(section.blogConfig || {}),
                                  showCategory: e.target.checked
                                }
                                updateContent(section.id, 'blogConfig', newConfig)
                              }}
                              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Show Category</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={section.blogConfig?.showDate !== false}
                              onChange={(e) => {
                                const newConfig = {
                                  ...(section.blogConfig || {}),
                                  showDate: e.target.checked
                                }
                                updateContent(section.id, 'blogConfig', newConfig)
                              }}
                              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Show Date</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={section.blogConfig?.showReadingTime !== false}
                              onChange={(e) => {
                                const newConfig = {
                                  ...(section.blogConfig || {}),
                                  showReadingTime: e.target.checked
                                }
                                updateContent(section.id, 'blogConfig', newConfig)
                              }}
                              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Show Reading Time</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

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
                        type="url"
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
                      onChange={(e) => updateContent(section.id, 'order', parseInt(e.target.value) || 1)}
                      min="1"
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
              const sectionsWithImages = content.filter(s => s.imageUrl || s.videoUrl).length
              alert(`Sections with media: ${sectionsWithImages}/${content.length}`)
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

