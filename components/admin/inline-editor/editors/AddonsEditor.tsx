'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ImagePicker } from '../ImagePicker'

interface Addon {
  title: string
  description: string
  price?: string
  image?: string
}

interface AddonsEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function AddonsEditor({ content, onChange }: AddonsEditorProps) {
  const addons = Array.isArray(content.addons) ? (content.addons as Addon[]) : []

  const updateField = (field: string, value: string) => {
    onChange({ ...content, [field]: value })
  }

  const updateAddon = (index: number, updates: Partial<Addon>) => {
    const newAddons = [...addons]
    newAddons[index] = { ...newAddons[index], ...updates }
    onChange({ ...content, addons: newAddons })
  }

  const addAddon = () => {
    const newAddons = [...addons, { title: '', description: '', price: '', image: '' }]
    onChange({ ...content, addons: newAddons })
  }

  const removeAddon = (index: number) => {
    const newAddons = addons.filter((_, i) => i !== index)
    onChange({ ...content, addons: newAddons })
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
          Add-ons
        </label>
        <button
          type="button"
          onClick={addAddon}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-4">
        {addons.map((addon, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-4 h-4" />
                <span className="text-sm font-medium">Add-on {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeAddon(index)}
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
                  value={addon.title || ''}
                  onChange={e => updateAddon(index, { title: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={addon.description || ''}
                  onChange={e => updateAddon(index, { description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Price (optional)
                </label>
                <input
                  type="text"
                  value={addon.price || ''}
                  onChange={e => updateAddon(index, { price: e.target.value })}
                  placeholder="e.g., $50 or included"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <ImagePicker
                label="Image (optional)"
                value={addon.image || ''}
                onChange={url => updateAddon(index, { image: url })}
                placeholder="Select add-on image..."
              />
            </div>
          </div>
        ))}

        {addons.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No add-ons yet. Click &quot;Add Item&quot; to create one.
          </p>
        )}
      </div>
    </div>
  )
}
