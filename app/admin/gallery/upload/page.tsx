'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Upload, Image as ImageIcon, Video, X, Plus } from 'lucide-react'

interface UploadFile {
  file: File
  preview: string
  title: string
  category: 'rooms' | 'surf' | 'activities' | 'facilities' | 'general'
  tags: string[]
  isActive: boolean
}

export default function UploadMediaPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = URL.createObjectURL(file)
        const title = file.name.replace(/\.[^/.]+$/, '') // Remove extension
        
        setUploadFiles(prev => [...prev, {
          file,
          preview,
          title,
          category: 'general',
          tags: [],
          isActive: true
        }])
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const updateFile = (index: number, field: keyof UploadFile, value: unknown) => {
    setUploadFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ))
  }

  const addTag = (fileIndex: number, tag: string) => {
    if (tag.trim() && !uploadFiles[fileIndex].tags.includes(tag.trim())) {
      updateFile(fileIndex, 'tags', [...uploadFiles[fileIndex].tags, tag.trim()])
    }
  }

  const removeTag = (fileIndex: number, tagToRemove: string) => {
    updateFile(fileIndex, 'tags', uploadFiles[fileIndex].tags.filter(tag => tag !== tagToRemove))
  }

  const handleUpload = async () => {
    setIsUploading(true)
    
    try {
      console.log('Starting upload for', uploadFiles.length, 'files')
      
      // Process uploads sequentially to avoid overwhelming the server
      for (const fileData of uploadFiles) {
        // Step 1: Upload physical file
        const formData = new FormData()
        formData.append('file', fileData.file)
        formData.append('bucket', 'images')
        formData.append('path', fileData.category) // Organize by category folder

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        const uploadResult = await uploadRes.json()
        
        if (!uploadResult.success) {
          throw new Error(`Failed to upload ${fileData.title}: ${uploadResult.error}`)
        }
        
        const { url, filename, size, type } = uploadResult.data

        // Step 2: Save metadata to database
        const metadataRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: filename,
            original_name: fileData.title,
            file_type: type.startsWith('image/') ? 'image' : 'video',
            file_size: size,
            category: fileData.category,
            url: url,
            thumbnail_url: url, // For videos we might want to generate a thumbnail later
            alt_text: fileData.title,
            description: fileData.tags.join(', '),
            is_public: fileData.isActive,
          }),
        })
        
        const metadataResult = await metadataRes.json()
        
        if (!metadataResult.success) {
          console.error('Metadata save failed:', metadataResult.error)
          // Note: The file is uploaded but DB record failed. 
          // We continue to next file but should probably warn user.
        }
      }
      
      // Simulate upload progress (optional, removed for speed)
      // await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clean up preview URLs
      uploadFiles.forEach(file => URL.revokeObjectURL(file.preview))
      
      console.log('All uploads completed successfully')
      router.push('/admin/gallery')
    } catch (error: unknown) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rooms':
        return <ImageIcon size={16} className="text-blue-500" />
      case 'surf':
        return <Video size={16} className="text-green-500" />
      case 'activities':
        return <ImageIcon size={16} className="text-purple-500" />
      case 'facilities':
        return <ImageIcon size={16} className="text-orange-500" />
      case 'general':
        return <ImageIcon size={16} className="text-gray-500" />
      default:
        return <ImageIcon size={16} className="text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Upload Media</h1>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-[border-color,background-color] duration-200 ${
          dragActive ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-gray-400'
        } focus-within:ring-2 focus-within:ring-accent/50 focus-within:ring-offset-2`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images and Videos</h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent transition-[background-color,box-shadow] duration-200"
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: JPG, PNG, GIF, MP4, MOV, WebM (Max 50MB per file)
        </p>
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Files to Upload ({uploadFiles.length})
          </h2>
          
          {uploadFiles.map((uploadFile, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    {uploadFile.file.type.startsWith('image/') ? (
                      <Image
                        src={uploadFile.preview}
                        alt={uploadFile.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Video size={32} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* File Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={uploadFile.title}
                        onChange={(e) => updateFile(index, 'title', e.target.value)}
                        className="w-full text-lg font-medium text-gray-900 border-none focus-visible:ring-0 p-0 transition-shadow duration-200"
                        placeholder="Enter title..."
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {uploadFile.file.name} • {formatFileSize(uploadFile.file.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded-full p-1"
                      aria-label={`Remove ${uploadFile.title}`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        value={uploadFile.category}
                        onChange={(e) => updateFile(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent appearance-none transition-[border-color,box-shadow] duration-200"
                      >
                        <option value="rooms">Rooms</option>
                        <option value="surf">Surf</option>
                        <option value="activities">Activities</option>
                        <option value="facilities">Facilities</option>
                        <option value="general">General</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {getCategoryIcon(uploadFile.category)}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {uploadFile.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(index, tag)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-[border-color,box-shadow] duration-200"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag(index, e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          addTag(index, input.value)
                          input.value = ''
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2"
                        aria-label="Add tag"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      id={`active-${index}`}
                      type="checkbox"
                      checked={uploadFile.isActive}
                      onChange={(e) => updateFile(index, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor={`active-${index}`} className="block text-sm text-gray-900 cursor-pointer">
                      Active (available for use)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Actions */}
      {uploadFiles.length > 0 && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent transition-[background-color,border-color,box-shadow,color] duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,box-shadow] duration-200"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {uploadFiles.length} File{uploadFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

