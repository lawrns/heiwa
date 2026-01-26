'use client'

import { Plus, X } from 'lucide-react'
import { ImagePicker } from '../ImagePicker'
import { CarouselImageEditor } from '../../image-editor/CarouselImageEditor'
import { CarouselImage } from '@/types/image'

interface ExperienceHighlightContent {
  title?: string
  description?: string
  videoUrl?: string
  videoPoster?: string
  carouselImages?: string[] | CarouselImage[]
  reversed?: boolean
}

interface ExperienceHighlightEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function ExperienceHighlightEditor({ content, onChange }: ExperienceHighlightEditorProps) {
  const data = content as ExperienceHighlightContent
  
  // Convert string[] to CarouselImage[] for backward compatibility
  const carouselImages: CarouselImage[] = (() => {
    const images = data.carouselImages || []
    if (images.length === 0) return []
    
    // If already CarouselImage[], return as-is
    if (typeof images[0] === 'object') {
      return images as CarouselImage[]
    }
    
    // Convert string[] to CarouselImage[]
    return (images as string[]).map((url, index) => ({
      id: crypto.randomUUID(),
      url,
      alt_text: '',
      order: index,
      created_at: new Date().toISOString()
    }))
  })()

  const updateField = (field: keyof ExperienceHighlightContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const updateCarouselImages = (images: CarouselImage[]) => {
    updateField('carouselImages', images)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Experience title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Describe this experience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
        <input
          type="text"
          value={data.videoUrl || ''}
          onChange={(e) => updateField('videoUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
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

      <CarouselImageEditor
        images={carouselImages}
        onChange={updateCarouselImages}
      />
    </div>
  )
}
