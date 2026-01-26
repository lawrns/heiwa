'use client'

import { useState } from 'react'
import { Plus, X, Edit, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { CarouselImage } from '@/types/image'
import { cn } from '@/lib/utils'
import { isValidImageUrl } from '@/lib/image-validation'

// Helper function to generate alt text from filename
function generateAltText(filename: string): string {
  if (!filename) return ''
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
    if (!isValidImageUrl(url)) {
      errors.push('Invalid image URL')
      return { valid: false, errors, warnings }
    }

    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) {
        warnings.push('Could not verify image accessibility')
      }

      const contentLength = response.headers.get('content-length')
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0

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

interface GridItemImageEditorProps {
  images: CarouselImage[]
  onChange: (images: CarouselImage[]) => void
  disabled?: boolean
  maxImages?: number
}

export function GridItemImageEditor({ images, onChange, disabled = false, maxImages = 4 }: GridItemImageEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [validating, setValidating] = useState<Record<number, boolean>>({})

  const addImage = async () => {
    if (maxImages && images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

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
    
    if (updates.url && !currentImage.alt_text && updates.url) {
      updates.alt_text = generateAltText(updates.url.split('/').pop() || '')
    }

    newImages[index] = { ...currentImage, ...updates }
    onChange(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
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

      updateImage(index, {
        url,
        width: validation.metadata?.width,
        height: validation.metadata?.height,
        file_size: validation.metadata?.fileSize,
        format: validation.metadata?.format
      })
    } catch (error) {
      console.error('Failed to validate image:', error)
      updateImage(index, { url })
    } finally {
      setValidating(prev => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Grid Images ({images.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={addImage}
          disabled={disabled || (maxImages && images.length >= maxImages) ? true : false}
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Image Preview */}
            {image.url ? (
              <div
                className="aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setEditingIndex(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt_text || `Grid image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gray-100">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Actions Overlay */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setEditingIndex(index)}
                disabled={disabled || !image.url}
                className="p-1.5 bg-white rounded shadow hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit image"
              >
                <Edit className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="p-1.5 bg-white rounded shadow hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <input
                type="text"
                value={image.url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="Image URL..."
                disabled={disabled || validating[index]}
                className="w-full px-2 py-1 text-xs text-white bg-black/30 border border-white/20 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:opacity-50 placeholder-white/50"
              />
              {validating[index] && (
                <div className="absolute right-2 bottom-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Alt text warning */}
            {!image.alt_text && (
              <div className="absolute top-2 left-2">
                <div className="p-1 bg-red-500 rounded-full" title="Alt text required">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500">
            No grid images added yet. Click "Add Image" to get started.
          </div>
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
            <h3 className="text-xl font-semibold text-gray-900">Edit Grid Image</h3>
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
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
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
