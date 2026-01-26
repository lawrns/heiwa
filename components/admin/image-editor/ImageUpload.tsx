'use client'

import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validateImageFile, optimizeImage } from '@/lib/image-validation'

interface ImageUploadProps {
  onUpload: (image: {
    url: string
    alt_text: string
    width?: number
    height?: number
    file_size?: number
    format?: string
  }) => void
  disabled?: boolean
  maxSizeMB?: number
  accept?: string
  className?: string
}

export function ImageUpload({
  onUpload,
  disabled = false,
  maxSizeMB = 5,
  accept = 'image/*',
  className
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    setSuccess(false)
    setUploading(true)

    try {
      // Validate file
      const validation = await validateImageFile(file)

      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        setUploading(false)
        return
      }

      // Optimize image
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'image/webp'
      })

      // Convert to base64 for preview (in production, upload to Supabase)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        onUpload({
          url: base64,
          alt_text: generateAltText(file.name),
          width: validation.metadata?.width,
          height: validation.metadata?.height,
          file_size: optimized.size,
          format: optimized.type
        })

        setPreview(base64)
        setSuccess(true)
        setUploading(false)
      }

      reader.onerror = () => {
        setError('Failed to read file')
        setUploading(false)
      }

      reader.readAsDataURL(optimized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
            uploading && 'border-orange-400 bg-orange-50',
            error && 'border-red-400 bg-red-50',
            !uploading && !error && 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {success && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs">
              <CheckCircle className="w-3 h-3" />
              Uploaded
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

// Helper function to generate alt text from filename
function generateAltText(filename: string): string {
  if (!filename) return ''
  const name = filename.replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim()
  return name
}
