'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface FormData {
  title: string
  description: string
  image_url: string
  category: string
  icon: string
  availability_tier: 'always' | 'on-request'
  display_order: number
  active: boolean
  hero_video_url: string
  hero_image_url: string
  features: string[]
}

const iconOptions = [
  { value: 'play', label: 'Play', icon: '🎮' },
  { value: 'heart', label: 'Heart', icon: '❤️' },
  { value: 'waves', label: 'Waves', icon: '🌊' },
  { value: 'bike', label: 'Bike', icon: '🚴' },
  { value: 'dumbbell', label: 'Dumbbell', icon: '💪' },
  { value: 'thermometer', label: 'Thermometer', icon: '🌡️' },
  { value: 'wind', label: 'Wind', icon: '💨' },
  { value: 'droplets', label: 'Droplets', icon: '💧' },
  { value: 'users', label: 'Users', icon: '👥' },
  { value: 'map-pin', label: 'Map Pin', icon: '📍' },
]

const categoryOptions = [
  { value: 'play', label: 'Play - Fun activities and recreation' },
  { value: 'flow', label: 'Flow - Wellness and mindful practices' },
  { value: 'surf', label: 'Surf - Ocean adventures and lessons' },
]

export default function NewActivityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featureInput, setFeatureInput] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_url: '',
    category: 'play',
    icon: 'play',
    availability_tier: 'always',
    display_order: 0,
    active: true,
    hero_video_url: '',
    hero_image_url: '',
    features: []
  })

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }))
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin/activities')
      } else {
        setError(result.error || 'Failed to create activity')
      }
    } catch (err) {
      setError('Failed to create activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/activities"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Activities
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Activity</h1>
        <p className="text-gray-600 mt-2">Create a new activity for Heiwa House experiences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
                placeholder="e.g., Surfing Lessons"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first. Leave as 0 to add to the end.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              style={{ '--tw-ring-color': '#ec681c' } as any}
              placeholder="Describe what this activity involves..."
            />
          </div>

          {/* Category and Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Tier *
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability_tier"
                  value="always"
                  checked={formData.availability_tier === 'always'}
                  onChange={(e) => handleInputChange('availability_tier', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Always Available</strong> - Included in standard packages
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability_tier"
                  value="on-request"
                  checked={formData.availability_tier === 'on-request'}
                  onChange={(e) => handleInputChange('availability_tier', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>On Request</strong> - Requires confirmation/booking
                </span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
                placeholder="https://heiwahouse.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Video URL (optional)
              </label>
              <input
                type="url"
                value={formData.hero_video_url}
                onChange={(e) => handleInputChange('hero_video_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
                placeholder="https://heiwahouse.com/video.mp4"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (optional)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                style={{ '--tw-ring-color': '#ec681c' } as any}
                placeholder="Add a feature..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Activity is active and visible to customers
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/admin/activities"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#ec681c' }}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Activity'}
          </button>
        </div>
      </form>
    </div>
  )
}
