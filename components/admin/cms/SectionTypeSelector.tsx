'use client'

import { useState } from 'react'
import { 
  Target, 
  FileText, 
  HelpCircle,
  type LucideIcon
} from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminInput from '@/components/admin/ui/AdminInput'

interface SectionType {
  type: string
  name: string
  description: string
  icon: LucideIcon
  category: string
}

const sectionTypes: SectionType[] = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Main hero section with title, subtitle, and call-to-action',
    icon: Target,
    category: 'Layout'
  },
  {
    type: 'intro',
    name: 'Introduction',
    description: 'Introduction section with text and optional image',
    icon: FileText,
    category: 'Content'
  },
  {
    type: 'faq',
    name: 'FAQ Section',
    description: 'Frequently asked questions list',
    icon: HelpCircle,
    category: 'Content'
  }
]

const categories = ['All', 'Layout', 'Content']

interface SectionTypeSelectorProps {
  onSelect: (type: string, name: string) => void
  onCancel: () => void
}

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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSections.map(section => {
            const IconComponent = section.icon
            return (
              <button
                key={section.type}
                type="button"
                onClick={() => handleSectionTypeClick(section.type, section.name)}
                className={`p-5 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedType === section.type
                    ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={section.description}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${
                    selectedType === section.type
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2 text-base break-words">
                      {section.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                      {section.description}
                    </p>
                    <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {section.category}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
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
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <AdminButton 
          variant="outline" 
          type="button" 
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </AdminButton>
        <AdminButton 
          variant="primary" 
          type="submit"
          disabled={!selectedType || !sectionName.trim()}
          className="w-full sm:w-auto"
        >
          Add Section
        </AdminButton>
      </div>
    </form>
  )
}
