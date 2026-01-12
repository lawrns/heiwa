'use client'

import { useState } from 'react'
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Target,
  FileText,
  File,
  Star,
  Images,
  DollarSign,
  Image as ImageIcon,
  Video,
  Settings,
  type LucideIcon
} from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PageSection } from '@/lib/cms-types'
import { formatDateCompact } from '@/lib/utils'
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'

interface SectionCardProps {
  section: PageSection
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleActive: (isActive: boolean) => void
  dragHandleProps?: DraggableProvidedDragHandleProps | null
}

export default function SectionCard({
  section,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  dragHandleProps
}: SectionCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getSectionIcon = (sectionType: string | null | undefined): LucideIcon => {
    if (!sectionType) return File
    const icons: Record<string, LucideIcon> = {
      hero: Target,
      intro: FileText,
      text: File,
      features: Star,
      gallery: Images,
      pricing: DollarSign,
      image_text: ImageIcon,
      video: Video,
      custom: Settings
    }
    return icons[sectionType] || File
  }

  const getSectionPreview = (section: PageSection): string => {
    if (!section.section_type) {
      return section.section_name || 'Unknown Section'
    }
    switch (section.section_type) {
      case 'hero':
        return (typeof section.content?.title === 'string' ? section.content.title : null) || 'Hero Section'
      case 'text':
        return (typeof section.content?.title === 'string' ? section.content.title : null) || 'Text Section'
      case 'intro':
        return 'Introduction'
      default:
        return section.section_name || section.section_type || 'Unknown Section'
    }
  }

  const getSectionTypeLabel = (sectionType: string | null | undefined) => {
    if (!sectionType) return 'Unknown'
    const labels: Record<string, string> = {
      hero: 'Hero',
      intro: 'Introduction',
      text: 'Text',
      features: 'Features',
      gallery: 'Gallery',
      pricing: 'Pricing',
      image_text: 'Image + Text',
      video: 'Video',
      custom: 'Custom'
    }
    return labels[sectionType] || sectionType
  }

  const IconComponent = getSectionIcon(section.section_type || 'custom')

  return (
    <div className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors group shadow-sm bg-white rounded-lg mb-4">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start flex-1 w-full sm:w-auto">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="mr-2 sm:mr-4 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Section Icon */}
          <div className="mr-3 sm:mr-4 flex-shrink-0">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
              <IconComponent className="w-5 h-5" />
            </div>
          </div>

          {/* Section Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900 break-words">
                {getSectionPreview(section)}
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                {getSectionTypeLabel(section.section_type)}
              </span>
              {!section.is_active && (
                <span className="text-xs text-gray-500 bg-yellow-100 text-yellow-800 px-2 py-1 rounded whitespace-nowrap">
                  Inactive
                </span>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-2">
              Order: {section.order_index} • Last updated: {formatDateCompact(section.updated_at)}
            </p>

            {/* Section Preview */}
            <div className="text-xs sm:text-sm text-gray-600 mb-3">
              {typeof section.content?.title === 'string' && (
                <p className="font-medium mb-1 truncate">Title: {section.content.title}</p>
              )}
              {typeof section.content?.subtitle === 'string' && (
                <p className="text-gray-500 truncate">Subtitle: {section.content.subtitle}</p>
              )}
              {typeof section.content?.description === 'string' && (
                <p className="text-gray-500 line-clamp-2">
                  {section.content.description.substring(0, 100)}...
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  id={`active-${section.id}`}
                  checked={section.is_active}
                  onCheckedChange={onToggleActive}
                />
                <Label 
                  htmlFor={`active-${section.id}`}
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {section.is_active ? 'Active' : 'Inactive'}
                </Label>
              </div>
              
              <AdminButton variant="outline" size="sm" onClick={onEdit} className="text-xs sm:text-sm">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </AdminButton>

              <div className="relative">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="w-4 h-4" />
                </AdminButton>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onToggleActive(!section.is_active)
                          setShowMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {section.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          onDuplicate()
                          setShowMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          onDelete()
                          setShowMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="sm:ml-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-1 hover:bg-gray-200 rounded"
              title="Edit section"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-1 hover:bg-gray-200 rounded"
              title="Duplicate section"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleActive(!section.is_active)}
              className="p-1 hover:bg-gray-200 rounded"
              title={section.is_active ? 'Deactivate' : 'Activate'}
            >
              {section.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
