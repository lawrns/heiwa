'use client'

import { useState } from 'react'
import { 
  Target, 
  FileText, 
  HelpCircle,
  Star,
  Search,
  Info,
  Bed,
  Zap,
  MousePointerClick,
  Image as ImageIcon,
  Grid,
  Sparkles,
  List,
  Package,
  ShieldCheck,
  Users,
  Calendar,
  Waves,
  MapPin,
  Globe,
  BookOpen,
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
  },
  {
    type: 'features',
    name: 'Features Grid',
    description: 'Highlight key features or benefits with icons',
    icon: Star,
    category: 'Content'
  },
  {
    type: 'seo',
    name: 'SEO Settings',
    description: 'Page-specific SEO metadata and social sharing settings',
    icon: Search,
    category: 'Pages'
  },
  {
    type: 'about',
    name: 'About Section',
    description: 'About us content with cards and descriptions',
    icon: Info,
    category: 'Content'
  },
  {
    type: 'rooms',
    name: 'Featured Rooms',
    description: 'Display selected rooms with pricing and links',
    icon: Bed,
    category: 'Booking'
  },
  {
    type: 'facilities',
    name: 'Facilities List',
    description: 'List of house facilities and amenities',
    icon: Zap,
    category: 'Content'
  },
  {
    type: 'cta',
    name: 'Call to Action',
    description: 'Compelling section to drive bookings or contact',
    icon: MousePointerClick,
    category: 'Layout'
  },
  {
    type: 'gallery',
    name: 'Media Gallery',
    description: 'Grid of images or videos with lightbox',
    icon: ImageIcon,
    category: 'Media'
  },
  {
    type: 'activity_grid',
    name: 'Experience Grid',
    description: 'Grid of experiences filtered by category',
    icon: Grid,
    category: 'Content'
  },
  {
    type: 'activity_highlight',
    name: 'Experience Highlight',
    description: 'Featured experience with video and carousel',
    icon: Sparkles,
    category: 'Content'
  },
  {
    type: 'steps',
    name: 'Process Steps',
    description: 'Numbered steps explaining a process (e.g., How to book)',
    icon: List,
    category: 'Content'
  },
  {
    type: 'addons',
    name: 'Add-ons List',
    description: 'List of available add-ons and services',
    icon: Package,
    category: 'Booking'
  },
  {
    type: 'legal_content',
    name: 'Legal Content',
    description: 'Rich text section for legal terms or privacy policies',
    icon: ShieldCheck,
    category: 'Pages'
  },
  {
    type: 'hosts',
    name: 'Hosts Profile',
    description: 'Information about the house hosts with image and signature',
    icon: Users,
    category: 'Content'
  },
  {
    type: 'surf-weeks',
    name: 'Surf Weeks',
    description: 'Upcoming surf camp sessions and schedule',
    icon: Calendar,
    category: 'Booking'
  },
  {
    type: 'surf_conditions',
    name: 'Surf Conditions',
    description: 'Detailed information about local surf conditions',
    icon: Waves,
    category: 'Content'
  },
  {
    type: 'local_break',
    name: 'Local Break Map',
    description: 'Map and details of the nearest surf breaks',
    icon: MapPin,
    category: 'Content'
  },
  {
    type: 'world_class_surfing',
    name: 'Regional Surf Guide',
    description: 'Overview of world-class breaks in the region',
    icon: Globe,
    category: 'Content'
  },
  {
    type: 'facility_gallery',
    name: 'Facility Gallery',
    description: 'Gallery specifically for house facilities',
    icon: ImageIcon,
    category: 'Media'
  },
  {
    type: 'surf_lessons',
    name: 'Surf Lessons',
    description: 'Detailed information about surf coaching and lessons',
    icon: BookOpen,
    category: 'Content'
  },
  {
    type: 'team',
    name: 'Team Members',
    description: 'Grid of team member profiles',
    icon: Users,
    category: 'Content'
  }
]

const categories = ['All', 'Layout', 'Content', 'Booking', 'Media', 'Pages']

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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-[background-color,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 ${
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
                className={`p-5 border-2 rounded-lg text-left transition-[border-color,box-shadow,background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 hover:shadow-md ${
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
