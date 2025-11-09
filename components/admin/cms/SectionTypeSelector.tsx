'use client'

import { useState } from 'react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminInput from '@/components/admin/ui/AdminInput'

interface SectionTypeSelectorProps {
  onSelect: (sectionType: string, sectionName: string) => void
  onCancel: () => void
}

const sectionTypes = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Main hero section with title, subtitle, and call-to-action',
    icon: '🎯',
    category: 'Layout'
  },
  {
    type: 'intro',
    name: 'Introduction',
    description: 'Introduction section with text and optional image',
    icon: '📝',
    category: 'Content'
  },
  {
    type: 'text',
    name: 'Text Section',
    description: 'Rich text content with heading and body text',
    icon: '📄',
    category: 'Content'
  },
  {
    type: 'features',
    name: 'Features Grid',
    description: 'Grid of feature cards with icons and descriptions',
    icon: '⭐',
    category: 'Layout'
  },
  {
    type: 'gallery',
    name: 'Image Gallery',
    description: 'Gallery of images with optional captions',
    icon: '🖼️',
    category: 'Media'
  },
  {
    type: 'pricing',
    name: 'Pricing Table',
    description: 'Pricing plans with features and call-to-action',
    icon: '💰',
    category: 'Layout'
  },
  {
    type: 'image_text',
    name: 'Image + Text',
    description: 'Side-by-side image and text layout',
    icon: '🖼️',
    category: 'Media'
  },
  {
    type: 'video',
    name: 'Video Section',
    description: 'Video player with optional title and description',
    icon: '🎥',
    category: 'Media'
  },
  {
    type: 'custom',
    name: 'Custom Section',
    description: 'Create a custom section with your own content',
    icon: '⚙️',
    category: 'Advanced'
  }
]

const categories = ['All', 'Layout', 'Content', 'Media', 'Advanced']

export default function SectionTypeSelector({
  onSelect,
  onCancel
}: SectionTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [sectionName, setSectionName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredSections = selectedCategory === 'All' 
    ? sectionTypes 
    : sectionTypes.filter(section => section.category === selectedCategory)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType || !sectionName.trim()) {
      return
    }

    onSelect(selectedType, sectionName.trim())
  }

  const handleSectionTypeClick = (type: string, defaultName: string) => {
    setSelectedType(type)
    setSectionName(defaultName)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Section Types Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Section Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSections.map(section => (
            <button
              key={section.type}
              type="button"
              onClick={() => handleSectionTypeClick(section.type, section.name)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedType === section.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{section.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {section.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {section.description}
                  </p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {section.category}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Name */}
      {selectedType && (
        <div>
          <AdminInput
            label="Section Name"
            value={sectionName}
            onChange={(value) => setSectionName(value)}
            placeholder="Enter a name for this section"
            maxLength={100}
            required
            description="This name will help you identify the section in the editor"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <AdminButton variant="outline" type="button" onClick={onCancel}>
          Cancel
        </AdminButton>
        <AdminButton 
          variant="primary" 
          type="submit"
          disabled={!selectedType || !sectionName.trim()}
        >
          Add Section
        </AdminButton>
      </div>
    </form>
  )
}
