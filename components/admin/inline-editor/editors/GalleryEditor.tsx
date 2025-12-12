'use client'

import { Plus, X, GripVertical } from 'lucide-react'

interface GalleryContent {
  title?: string
  description?: string
  images?: string[]
}

interface GalleryEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function GalleryEditor({ content, onChange }: GalleryEditorProps) {
  const data = content as GalleryContent
  const images = Array.isArray(data.images) ? data.images : []

  const updateField = (field: keyof GalleryContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const addImage = () => {
    updateField('images', [...images, ''])
  }

  const updateImage = (index: number, value: string) => {
    const next = [...images]
    next[index] = value
    updateField('images', next)
  }

  const removeImage = (index: number) => {
    updateField('images', images.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [removed] = next.splice(from, 1)
    next.splice(to, 0, removed)
    updateField('images', next)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Gallery title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Optional description..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Images ({images.length})</label>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>

        {images.length === 0 && (
          <div className="p-3 rounded-lg border border-orange-200 bg-orange-50 text-sm text-orange-800">
            No images added yet. Click "Add Image" to start building your gallery.
          </div>
        )}

        <div className="space-y-2">
          {images.map((img, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
              <input
                type="text"
                value={img}
                onChange={(e) => updateImage(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="/images/example.jpg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
