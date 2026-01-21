'use client'

import { useState } from 'react'
import { Plus, X, GripVertical, Edit, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { CarouselImage } from '@/types/image'
import { cn } from '@/lib/utils'
import { isValidImageUrl } from '@/lib/image-validation'

// Helper function to generate alt text from filename
function generateAltText(filename: string): string {
  if (!filename) return ''
  // Remove file extension and convert to readable text
  const name = filename.replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
  return name
}

// Helper function to validate image URL
async function validateImage(url: string): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    width: number
    height: number
    format: string
    fileSize: number
  }
}> {
  const errors: string[] = []
  const warnings: string[] = []

  if (!url || url.trim() === '') {
    return {
      valid: false,
      errors: ['Image URL is required'],
      warnings
    }
  }

  try {
    // Check if URL is valid
    if (!isValidImageUrl(url)) {
      errors.push('Invalid image URL')
      return { valid: false, errors, warnings }
    }

    // Try to fetch image to get metadata
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) {
        warnings.push('Could not verify image accessibility')
      }

      const contentLength = response.headers.get('content-length')
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0

      // Validate file size (max 5MB)
      if (fileSize > 5 * 1024 * 1024) {
        warnings.push('Image is larger than 5MB. Consider compressing for better performance.')
      }

      return {
        valid: true,
        errors,
        warnings,
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          fileSize
        }
      }
    } catch (error) {
      warnings.push('Could not verify image accessibility')
      return {
        valid: true,
        errors,
        warnings,
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          fileSize: 0
        }
      }
    }
  } catch (error) {
    errors.push('Failed to validate image')
    return {
      valid: false,
      errors,
      warnings
    }
  }
}

interface CarouselImageEditorProps {
  images: CarouselImage[]
  onChange: (images: CarouselImage[]) => void
  disabled?: boolean
}

export function CarouselImageEditor({ images, onChange, disabled = false }: CarouselImageEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [validating, setValidating] = useState<Record<number, boolean>>({})

  const addImage = async () => {
    const newImage: CarouselImage = {
      id: crypto.randomUUID(),
      url: '',
      alt_text: '',
      order: images.length,
      created_at: new Date().toISOString()
    }
    onChange([...images, newImage])
  }

  const updateImage = async (index: number, updates: Partial<CarouselImage>) => {
    const newImages = [...images]
    const currentImage = newImages[index]
    
    // Auto-generate alt text if URL changes and alt text is empty
    if (updates.url && !currentImage.alt_text && updates.url) {
      updates.alt_text = generateAltText(updates.url.split('/').pop() || '')
    }

    newImages[index] = { ...currentImage, ...updates }
    onChange(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // Update order for remaining images
    newImages.forEach((img, i) => { img.order = i })
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    // Update order for all images
    newImages.forEach((img, i) => { img.order = i })
    onChange(newImages)
  }

  const handleImageUrlChange = async (index: number, url: string) => {
    setValidating(prev => ({ ...prev, [index]: true }))
    
    try {
      const validation = await validateImage(url)
      
      if (!validation.valid) {
        alert(validation.errors.join('\n'))
        setValidating(prev => ({ ...prev, [index]: false }))
        return
      }

      // Update image with metadata
      updateImage(index, {
        url,
        width: validation.metadata?.width,
        height: validation.metadata?.height,
        file_size: validation.metadata?.fileSize,
        format: validation.metadata?.format
      })
    } catch (error) {
      console.error('Failed to validate image:', error)
      // Still allow the URL but show warning
      updateImage(index, { url })
    } finally {
      setValidating(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    moveImage(draggedIndex, index)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Carousel Images ({images.length})
        </label>
        <button
          type="button"
          onClick={addImage}
          disabled={disabled}
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      <div className="space-y-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 transition-all",
              draggedIndex === index && "opacity-50 border-orange-400",
              disabled && "opacity-50"
            )}
          >
            {/* Drag Handle */}
            <div
              className="flex-shrink-0 pt-2 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>

            {/* Image Preview */}
            <div className="flex-shrink-0">
              {image.url ? (
                <div
                  className="w-20 h-20 rounded overflow-hidden bg-gray-200 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                  onClick={() => setEditingIndex(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt_text || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={image.url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="Image URL..."
                  disabled={disabled || validating[index]}
                  className={cn(
                    "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    validating[index] && "opacity-50"
                  )}
                />
                {validating[index] && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {image.width && (
                <p className="text-xs text-gray-500">
                  {image.width} × {image.height}px • {((image.file_size || 0) / 1024).toFixed(1)} KB
                </p>
              )}

              <input
                type="text"
                value={image.alt_text}
                onChange={(e) => updateImage(index, { alt_text: e.target.value })}
                placeholder="Alt text (required for accessibility)"
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  !image.alt_text && "border-red-300 focus-visible:ring-red-500"
                )}
              />
              {!image.alt_text && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Alt text required for accessibility
                </p>
              )}
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => updateImage(index, { caption: e.target.value })}
                placeholder="Caption (optional)"
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setEditingIndex(index)}
                disabled={disabled || !image.url}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit image"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">
            No carousel images added yet. Click "Add Image" to get started.
          </p>
        )}
      </div>

      {/* Image Edit Modal */}
      {editingIndex !== null && (
        <ImageEditModal
          image={images[editingIndex]}
          onSave={(updatedImage) => {
            updateImage(editingIndex, updatedImage)
            setEditingIndex(null)
          }}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  )
}

// Image Edit Modal Component
interface ImageEditModalProps {
  image: CarouselImage
  onSave: (image: CarouselImage) => void
  onClose: () => void
}

function ImageEditModal({ image, onSave, onClose }: ImageEditModalProps) {
  const [altText, setAltText] = useState(image.alt_text)
  const [caption, setCaption] = useState(image.caption || '')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [quality, setQuality] = useState(85)

  const handleSave = () => {
    onSave({
      ...image,
      alt_text: altText,
      caption,
      updated_at: new Date().toISOString()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Image</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={altText}
                  className="w-full h-full object-contain"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`
                  }}
                />
              </div>

              {/* Image Info */}
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Filename:</strong> {image.url.split('/').pop()}</p>
                {image.width && <p><strong>Dimensions:</strong> {image.width} × {image.height}px</p>}
                {image.file_size && <p><strong>Size:</strong> {(image.file_size / 1024).toFixed(2)} KB</p>}
                <p><strong>Format:</strong> {image.format || 'Unknown'}</p>
              </div>
            </div>

            {/* Edit Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                  placeholder="Describe this image for screen readers..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                  placeholder="Add a caption for this image..."
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Image Optimization</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Brightness: {brightness}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Contrast: {contrast}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Compression Quality: {quality}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={!altText.trim()}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2"
                >
                  Save Changes
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
