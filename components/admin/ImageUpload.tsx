'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  accept?: string
  disabled?: boolean
  className?: string
  bucketName: 'room-images' | 'surf-camp-images' | 'add-on-images' | 'page-images'
  storagePath?: string
}

interface UploadedImage {
  url: string
  path?: string
  name?: string
  size?: number
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  accept = 'image/*',
  disabled = false,
  className = '',
  bucketName,
  storagePath = ''
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize images from value prop
  useEffect(() => {
    if (value && value.length > 0) {
      setImages(value.map(url => ({ url })))
    } else {
      setImages([])
    }
  }, [value])

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' }
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' }
    }

    return { valid: true }
  }

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucketName)
    if (storagePath) {
      formData.append('path', storagePath)
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload file')
    }

    return {
      url: data.data.url,
      path: data.data.path,
      name: file.name,
      size: file.size
    }
  }

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    // Check if adding these files would exceed maxFiles
    if (images.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    // Validate all files
    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90))
        }, 100)

        try {
          const uploadedImage = await uploadFile(file)
          clearInterval(progressInterval)
          setUploadProgress(100)
          return uploadedImage
        } catch (error) {
          clearInterval(progressInterval)
          throw error
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      
      // Add new images to state
      const newImages = [...images, ...uploadedImages]
      setImages(newImages)
      
      // Update parent component
      onChange(newImages.map(img => img.url))

      toast.success(`${uploadedImages.length} image(s) uploaded successfully`)
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [images, maxFiles, bucketName, storagePath, onChange])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileSelect(files)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageToRemove = images[index]
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onChange(newImages.map(img => img.url))

    // Optionally delete from storage
    if (imageToRemove.path) {
      try {
        await fetch(`/api/upload?path=${encodeURIComponent(imageToRemove.path)}&bucket=${bucketName}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Error deleting file from storage:', error)
        // Don't show error to user - file is already removed from UI
      }
    }
  }, [images, onChange, bucketName])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={!disabled && !uploading ? handleUploadClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Uploading images...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                {dragActive ? 'Drop images here' : 'Upload Images'}
              </h3>
              <p className="text-xs text-gray-500">
                Drag and drop or click to select images
              </p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} files, 5MB each
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleUploadClick()
              }}
              disabled={disabled || images.length >= maxFiles}
              className="mt-2"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose Images
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={image.url}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy=".3em" x="50%" y="50%" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                disabled={uploading}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image info overlay */}
              {image.name && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate">{image.name}</p>
                  {image.size && (
                    <p className="text-xs opacity-75">
                      {(image.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-sm text-gray-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload

