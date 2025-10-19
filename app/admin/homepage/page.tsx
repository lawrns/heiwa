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
}

export default function HomepageCMSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<HomepageContent[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    // TODO: Fetch homepage content from API
    // For now, simulate loading with mock data
    setTimeout(() => {
      setContent([
        {
          id: 'hero',
          section: 'hero',
          title: 'Welcome to Heiwa House',
          subtitle: 'Your surf and lifestyle destination in Santa Cruz, Portugal',
          description: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure.',
          content: '',
          videoUrl: '/images/videos/Timeline-1.mp4',
          linkUrl: '/surf-weeks',
          linkText: 'Explore surf weeks',
          isActive: true,
          order: 1
        },
        {
          id: 'features',
          section: 'features',
          title: 'What Makes Us Special',
          subtitle: 'Experience the perfect blend of surf, yoga, and coastal living',
          description: 'Discover our unique offerings that make Heiwa House the ultimate destination.',
          content: '',
          imageUrl: '/images/features/coastal-living.jpg',
          isActive: true,
          order: 2
        },
        {
          id: 'activities',
          section: 'activities',
          title: 'Activities & Experiences',
          subtitle: 'From sunrise yoga to sunset surf sessions',
          description: 'Immerse yourself in our diverse range of activities designed to rejuvenate your mind, body, and soul.',
          content: '',
          imageUrl: '/images/activities/yoga-deck.jpg',
          isActive: true,
          order: 3
        },
        {
          id: 'testimonials',
          section: 'testimonials',
          title: 'What Our Guests Say',
          subtitle: 'Real experiences from real people',
          description: 'Read about the transformative experiences our guests have had at Heiwa House.',
          content: '',
          isActive: true,
          order: 4
        },
        {
          id: 'cta',
          section: 'cta',
          title: 'Ready for Your Adventure?',
          subtitle: 'Book your stay and start your journey',
          description: 'Don\'t wait - limited spots available for the upcoming season.',
          content: '',
          linkUrl: '/booking',
          linkText: 'Book Now',
          isActive: true,
          order: 5
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement actual API call to save homepage content
      console.log('Saving homepage content:', content)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert('Homepage content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content. Please try again.')
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
        {content.map((section) => (
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
        ))}
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

