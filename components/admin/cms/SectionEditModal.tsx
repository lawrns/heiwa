'use client'

import { useState, useEffect } from 'react'
import { Save, X, Image, Video, Settings } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminModal from '@/components/admin/ui/AdminModal'
import AdminInput from '@/components/admin/ui/AdminInput'
import AdminTextarea from '@/components/admin/ui/AdminTextarea'
import AdminSelect from '@/components/admin/ui/AdminSelect'
import RichTextEditor from './RichTextEditor'
import { PageSection } from '@/lib/cms-types'

interface SectionEditModalProps {
  isOpen: boolean
  onClose: () => void
  section: PageSection | null
  onSave: (section: PageSection) => void
}

export default function SectionEditModal({
  isOpen,
  onClose,
  section,
  onSave
}: SectionEditModalProps) {
  const [formData, setFormData] = useState({
    section_name: '',
    title: '',
    subtitle: '',
    description: '',
    content: '',
    image_url: '',
    video_url: '',
    button_text: '',
    button_link: '',
    background_color: '',
    text_color: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (section) {
      setFormData({
        section_name: section.section_name || '',
        title: section.content?.title || '',
        subtitle: section.content?.subtitle || '',
        description: section.content?.description || '',
        content: section.content?.content || '',
        image_url: section.content?.image_url || '',
        video_url: section.content?.video_url || '',
        button_text: section.content?.button_text || '',
        button_link: section.content?.button_link || '',
        background_color: section.content?.background_color || '',
        text_color: section.content?.text_color || ''
      })
    }
  }, [section])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!section) return

    try {
      setSaving(true)

      const updatedSection: PageSection = {
        ...section,
        section_name: formData.section_name,
        content: {
          ...section.content,
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          content: formData.content,
          image_url: formData.image_url,
          video_url: formData.video_url,
          button_text: formData.button_text,
          button_link: formData.button_link,
          background_color: formData.background_color,
          text_color: formData.text_color
        },
        updated_at: new Date().toISOString()
      }

      onSave(updatedSection)
      onClose()
    } catch (err) {
      console.error('Failed to save section:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderSectionFields = () => {
    if (!section) return null

    switch (section.section_type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Hero Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter hero title"
              maxLength={100}
              required
            />
            <AdminInput
              label="Hero Subtitle"
              value={formData.subtitle}
              onChange={(value) => handleInputChange('subtitle', value)}
              placeholder="Enter hero subtitle"
              maxLength={200}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Description
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Enter hero description"
                maxLength={500}
                height={150}
              />
            </div>
            <AdminInput
              label="Button Text"
              value={formData.button_text}
              onChange={(value) => handleInputChange('button_text', value)}
              placeholder="e.g., Get Started"
              maxLength={50}
            />
            <AdminInput
              label="Button Link"
              value={formData.button_link}
              onChange={(value) => handleInputChange('button_link', value)}
              placeholder="/contact"
              maxLength={200}
            />
            <AdminInput
              label="Background Image URL"
              value={formData.image_url}
              onChange={(value) => handleInputChange('image_url', value)}
              placeholder="/images/hero-bg.jpg"
              maxLength={200}
            />
          </div>
        )

      case 'intro':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Section Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter section title"
              maxLength={100}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="Enter section content"
                maxLength={1000}
                height={200}
              />
            </div>
            <AdminInput
              label="Image URL"
              value={formData.image_url}
              onChange={(value) => handleInputChange('image_url', value)}
              placeholder="/images/intro-image.jpg"
              maxLength={200}
            />
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Text Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter text title"
              maxLength={100}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="Enter text content"
                maxLength={2000}
                height={300}
              />
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Features Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="e.g., Our Features"
              maxLength={100}
              required
            />
            <AdminTextarea
              label="Features Description"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Describe the features"
              maxLength={300}
              rows={3}
            />
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Feature items are managed through the content editor. 
                This section shows the main title and description.
              </p>
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Gallery Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="e.g., Photo Gallery"
              maxLength={100}
              required
            />
            <AdminTextarea
              label="Gallery Description"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Describe the gallery"
              maxLength={300}
              rows={3}
            />
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Images are managed through the media library. 
                This section controls the title and description.
              </p>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Pricing Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="e.g., Our Pricing"
              maxLength={100}
              required
            />
            <AdminTextarea
              label="Pricing Description"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Describe pricing options"
              maxLength={300}
              rows={3}
            />
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Pricing plans are managed through the pricing editor. 
                This section controls the title and description.
              </p>
            </div>
          </div>
        )

      case 'image_text':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Section Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter section title"
              maxLength={100}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="Enter section content"
                maxLength={1000}
                height={200}
              />
            </div>
            <AdminInput
              label="Image URL"
              value={formData.image_url}
              onChange={(value) => handleInputChange('image_url', value)}
              placeholder="/images/content-image.jpg"
              maxLength={200}
            />
            <AdminSelect
              label="Image Position"
              value={(section.content?.image_position as string) || 'left'}
              onChange={(value) => handleInputChange('image_position', value)}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' }
              ]}
            />
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Video Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter video title"
              maxLength={100}
              required
            />
            <AdminInput
              label="Video URL"
              value={formData.video_url}
              onChange={(value) => handleInputChange('video_url', value)}
              placeholder="https://youtube.com/watch?v=..."
              maxLength={200}
            />
            <AdminTextarea
              label="Video Description"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Describe the video"
              maxLength={300}
              rows={3}
            />
          </div>
        )

      case 'custom':
        return (
          <div className="space-y-4">
            <AdminInput
              label="Section Name"
              value={formData.section_name}
              onChange={(value) => handleInputChange('section_name', value)}
              placeholder="Enter section name"
              maxLength={100}
              required
            />
            <AdminInput
              label="Custom Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter title"
              maxLength={100}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="Enter custom content"
                maxLength={2000}
                height={300}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <AdminInput
              label="Section Name"
              value={formData.section_name}
              onChange={(value) => handleInputChange('section_name', value)}
              placeholder="Enter section name"
              maxLength={100}
              required
            />
            <AdminInput
              label="Title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter title"
              maxLength={100}
            />
            <AdminTextarea
              label="Description"
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Enter description"
              maxLength={500}
              rows={3}
            />
          </div>
        )
    }
  }

  if (!section) return null

  // Safely handle section_type that might be undefined or null
  const sectionTypeDisplay = section.section_type 
    ? section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)
    : 'Section'

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${sectionTypeDisplay}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Type Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Type:</span>
            <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {section.section_type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Order: {section.order_index}
            </span>
          </div>
        </div>

        {/* Section Fields */}
        {renderSectionFields()}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <AdminButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton variant="primary" type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  )
}
