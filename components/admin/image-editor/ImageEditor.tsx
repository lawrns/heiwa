'use client'

import { useState } from 'react'
import { X, Check, Loader2, AlertCircle, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ImageEditorProps {
  imageUrl: string
  altText: string
  caption?: string
  onSave: (data: { alt_text: string; caption?: string; optimization?: ImageOptimization }) => void
  onClose: () => void
  disabled?: boolean
}

export interface ImageOptimization {
  brightness: number
  contrast: number
  saturation: number
  quality: number
  format: 'webp' | 'jpeg' | 'png'
}

export function ImageEditor({ imageUrl, altText, caption, onSave, onClose, disabled = false }: ImageEditorProps) {
  const [localAltText, setLocalAltText] = useState(altText)
  const [localCaption, setLocalCaption] = useState(caption || '')
  const [optimization, setOptimization] = useState<ImageOptimization>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    quality: 85,
    format: 'webp'
  })
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/images/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          options: optimization
        })
      })

      const data = await response.json()
      if (data.success) {
        setPreviewUrl(data.url)
      }
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    onSave({
      alt_text: localAltText,
      caption: localCaption || undefined,
      optimization
    })
  }

  const resetOptimization = () => {
    setOptimization({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      quality: 85,
      format: 'webp'
    })
    setPreviewUrl(null)
    setZoom(1)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Image Editor</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={previewUrl || imageUrl}
                    alt={localAltText}
                    className="max-w-full max-h-full object-contain transition-transform"
                    style={{
                      transform: `scale(${zoom})`,
                      filter: `brightness(${optimization.brightness}%) contrast(${optimization.contrast}%) saturate(${optimization.saturation}%)`
                    }}
                  />
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 rounded-lg p-1 shadow">
                  <button
                    type="button"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    disabled={disabled}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    disabled={disabled}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Filename:</strong> {imageUrl.split('/').pop()}</p>
                <p><strong>Format:</strong> {optimization.format.toUpperCase()}</p>
                <p><strong>Quality:</strong> {optimization.quality}%</p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Metadata */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Image Metadata</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={localAltText}
                      onChange={(e) => setLocalAltText(e.target.value)}
                      rows={3}
                      disabled={disabled || loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 disabled:opacity-50"
                      placeholder="Describe this image for screen readers..."
                    />
                    {!localAltText && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Alt text is required for accessibility
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption (optional)
                    </label>
                    <textarea
                      value={localCaption}
                      onChange={(e) => setLocalCaption(e.target.value)}
                      rows={2}
                      disabled={disabled || loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 disabled:opacity-50"
                      placeholder="Add a caption for this image..."
                    />
                  </div>
                </div>
              </div>

              {/* Optimization Controls */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Image Optimization</h4>
                  <button
                    type="button"
                    onClick={resetOptimization}
                    disabled={disabled || loading}
                    className="text-xs text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Format */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Output Format</label>
                    <div className="flex gap-2">
                      {(['webp', 'jpeg', 'png'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setOptimization(prev => ({ ...prev, format: fmt }))}
                          disabled={disabled || loading}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded border transition-colors",
                            optimization.format === fmt
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brightness */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Brightness: {optimization.brightness}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={optimization.brightness}
                      onChange={(e) => setOptimization(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                      disabled={disabled || loading}
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Contrast: {optimization.contrast}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={optimization.contrast}
                      onChange={(e) => setOptimization(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                      disabled={disabled || loading}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Saturation: {optimization.saturation}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={optimization.saturation}
                      onChange={(e) => setOptimization(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                      disabled={disabled || loading}
                      className="w-full"
                    />
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Compression Quality: {optimization.quality}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={optimization.quality}
                      onChange={(e) => setOptimization(prev => ({ ...prev, quality: Number(e.target.value) }))}
                      disabled={disabled || loading}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={handleOptimize}
                  disabled={disabled || loading}
                  className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                  Preview Optimization
                </button>
                <button
                  onClick={handleSave}
                  disabled={disabled || loading || !localAltText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
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
