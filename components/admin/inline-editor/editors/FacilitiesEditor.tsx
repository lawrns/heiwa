'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ImagePicker } from '../ImagePicker'

interface Facility {
  title: string
  description: string
  image: string
}

interface FacilitiesEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function FacilitiesEditor({ content, onChange }: FacilitiesEditorProps) {
  // Prefer 'facilities' field (matches database seed), fall back to 'items' for legacy data
  const facilities = (Array.isArray(content.facilities) && content.facilities.length > 0)
    ? (content.facilities as Facility[])
    : (Array.isArray(content.items) && content.items.length > 0)
      ? (content.items as Facility[])
      : []
  const fieldName = 'facilities' // Use 'facilities' to match database seed data

  const updateField = (field: string, value: string) => {
    onChange({ ...content, [field]: value })
  }

  const updateFacility = (index: number, updates: Partial<Facility>) => {
    const newFacilities = [...facilities]
    newFacilities[index] = { ...newFacilities[index], ...updates }
    onChange({ ...content, [fieldName]: newFacilities })
  }

  const addFacility = () => {
    const newFacilities = [...facilities, { title: '', description: '', image: '' }]
    onChange({ ...content, [fieldName]: newFacilities })
  }

  const removeFacility = (index: number) => {
    const newFacilities = facilities.filter((_, i) => i !== index)
    onChange({ ...content, [fieldName]: newFacilities })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={e => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtitle
        </label>
        <input
          type="text"
          value={(content.subtitle as string) || ''}
          onChange={e => updateField('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
        />
      </div>

      <hr className="my-4" />

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {fieldName === 'facilities' ? 'Facilities' : 'Items'}
        </label>
        <button
          type="button"
          onClick={addFacility}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-4">
        {facilities.map((facility, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-4 h-4" />
                <span className="text-sm font-medium">Item {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFacility(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={facility.title || ''}
                  onChange={e => updateFacility(index, { title: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={facility.description || ''}
                  onChange={e => updateFacility(index, { description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <ImagePicker
                label="Image"
                value={facility.image || ''}
                onChange={url => updateFacility(index, { image: url })}
                placeholder="Select item image..."
              />
            </div>
          </div>
        ))}

        {facilities.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No items yet. Click &quot;Add Item&quot; to create one.
          </p>
        )}
      </div>
    </div>
  )
}
