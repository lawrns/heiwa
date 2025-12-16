'use client'

import { Plus, X } from 'lucide-react'
import { ImagePicker } from '../ImagePicker'

interface ActivityHighlightContent {
  title?: string
  description?: string
  videoUrl?: string
  videoPoster?: string
  carouselImages?: string[]
  reversed?: boolean
}

interface ActivityHighlightEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function ActivityHighlightEditor({ content, onChange }: ActivityHighlightEditorProps) {
  const data = content as ActivityHighlightContent
  const images = Array.isArray(data.carouselImages) ? data.carouselImages : []

  const updateField = (field: keyof ActivityHighlightContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const addImage = () => {
    updateField('carouselImages', [...images, ''])
  }

  const updateImage = (index: number, value: string) => {
    const next = [...images]
    next[index] = value
    updateField('carouselImages', next)
  }

  const removeImage = (index: number) => {
    updateField('carouselImages', images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Activity title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Describe this activity..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
        <input
          type="text"
          value={data.videoUrl || ''}
          onChange={(e) => updateField('videoUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="/images/videos/example.mp4"
        />
      </div>

      <ImagePicker
        label="Video Poster (optional)"
        value={data.videoPoster || ''}
        onChange={url => updateField('videoPoster', url)}
        placeholder="Select video poster image..."
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="reversed"
          checked={data.reversed || false}
          onChange={(e) => updateField('reversed', e.target.checked)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="reversed" className="text-sm text-gray-700">Reverse layout (image on left)</label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Carousel Images ({images.length})</label>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {images.map((img, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <div className="flex-1">
                <ImagePicker
                  value={img}
                  onChange={url => updateImage(index, url)}
                  placeholder="Select carousel image..."
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 text-gray-400 hover:text-red-600"
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
