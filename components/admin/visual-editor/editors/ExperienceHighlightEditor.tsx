'use client'

import { Save, Loader2 } from 'lucide-react'
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
  onSave: () => Promise<boolean>
  saving: boolean
}

export function ExperienceHighlightEditor({ content, onChange, onSave, saving }: ExperienceHighlightEditorProps) {
  const highlightContent = content as ExperienceHighlightContent
  
  // Convert string[] to CarouselImage[] for backward compatibility
  const carouselImages: CarouselImage[] = (() => {
    const images = highlightContent.carouselImages || []
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

  const handleChange = (field: keyof ExperienceHighlightContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const updateCarouselImages = (images: CarouselImage[]) => {
    handleChange('carouselImages', images)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={highlightContent.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="e.g., Yoga Dome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={highlightContent.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Describe this experience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <input
          type="text"
          value={highlightContent.videoUrl || ''}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="/optimized/videos/experience.mp4"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Poster Image
        </label>
        <input
          type="text"
          value={highlightContent.videoPoster || ''}
          onChange={(e) => handleChange('videoPoster', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="/images/experience-poster.jpg"
        />
        {highlightContent.videoPoster && (
          <div className="mt-2 relative w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={highlightContent.videoPoster}
              alt="Poster preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      <CarouselImageEditor
        images={carouselImages}
        onChange={updateCarouselImages}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="reversed"
          checked={highlightContent.reversed || false}
          onChange={(e) => handleChange('reversed', e.target.checked)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 cursor-pointer"
        />
        <label htmlFor="reversed" className="text-sm text-gray-700">
          Reversed layout (image on left, text on right)
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-[background-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  )
}
