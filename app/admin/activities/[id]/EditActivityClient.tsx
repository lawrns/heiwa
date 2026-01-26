'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Gamepad2, 
  Heart, 
  Waves, 
  Bike, 
  Dumbbell, 
  Thermometer, 
  Wind, 
  Droplets, 
  Users, 
  MapPin,
  type LucideIcon
} from 'lucide-react'

// Activity interface - used for API response typing
type Activity = {
  id: string
  title: string
  description?: string
  image_url: string
  category: string
  icon?: string
  availability_tier: 'always' | 'on-request'
  display_order: number
  active: boolean
  hero_video_url?: string
  hero_image_url?: string
  features?: string[]
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ActivityType: Activity | null = null

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

const iconOptions: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'play', label: 'Play', icon: Gamepad2 },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'waves', label: 'Waves', icon: Waves },
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'dumbbell', label: 'Dumbbell', icon: Dumbbell },
  { value: 'thermometer', label: 'Thermometer', icon: Thermometer },
  { value: 'wind', label: 'Wind', icon: Wind },
  { value: 'droplets', label: 'Droplets', icon: Droplets },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'map-pin', label: 'Map Pin', icon: MapPin },
]

const categoryOptions = [
  { value: 'play', label: 'Play - Fun activities and recreation' },
  { value: 'flow', label: 'Flow - Wellness and mindful practices' },
  { value: 'surf', label: 'Surf - Ocean adventures and lessons' },
]

interface EditActivityClientProps {
  id: string
}

export default function EditActivityClient({ id }: EditActivityClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
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

  const fetchActivity = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities/${id}`)
      const result = await response.json()
      
      if (result.success) {
        const activity = result.data
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          image_url: activity.image_url || '',
          category: activity.category || 'play',
          icon: activity.icon || 'play',
          availability_tier: activity.availability_tier || 'always',
          display_order: activity.display_order || 0,
          active: activity.active !== false,
          hero_video_url: activity.hero_video_url || '',
          hero_image_url: activity.hero_image_url || '',
          features: activity.features || []
        })
      } else {
        setError(result.error || 'Failed to fetch activity')
      }
    } catch {
      setError('Failed to fetch activity')
    } finally {
      setFetchLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const handleInputChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
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
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin/activities')
      } else {
        setError(result.error || 'Failed to update activity')
      }
    } catch {
      setError('Failed to update activity')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && fetchLoading) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-gray-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    )
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
          Back to Experiences
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Experience</h1>
        <p className="text-gray-600 mt-2">Update experience details for Heiwa House</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
                placeholder="e.g., Surfing Lessons"
              />
            </div>

            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow]"
              style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
              placeholder="Describe what this activity involves..."
            />
          </div>

          {/* Category and Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                id="icon"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability Tier */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Availability Tier *
            </span>
            <div className="flex items-center gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="availability_tier"
                  value="always"
                  checked={formData.availability_tier === 'always'}
                  onChange={(e) => handleInputChange('availability_tier', e.target.value)}
                  className="mr-2 h-4 w-4 text-accent focus:ring-accent border-gray-300"
                />
                <span className="text-sm">
                  <strong>Always Available</strong> - Included in standard packages
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="availability_tier"
                  value="on-request"
                  checked={formData.availability_tier === 'on-request'}
                  onChange={(e) => handleInputChange('availability_tier', e.target.value)}
                  className="mr-2 h-4 w-4 text-accent focus:ring-accent border-gray-300"
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
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Image URL
              </label>
              <input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
                placeholder="https://heiwahouse.com/image.jpg"
              />
            </div>

            <div>
              <label htmlFor="hero_video_url" className="block text-sm font-medium text-gray-700 mb-2">
                Hero Video URL (optional)
              </label>
              <input
                id="hero_video_url"
                type="url"
                value={formData.hero_video_url}
                onChange={(e) => handleInputChange('hero_video_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
                placeholder="https://heiwahouse.com/video.mp4"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label htmlFor="feature_input" className="block text-sm font-medium text-gray-700 mb-2">
              Features (optional)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                id="feature_input"
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent transition-[border-color,box-shadow] duration-200"
                style={{ '--tw-ring-color': '#ec681c' } as React.CSSProperties}
                placeholder="Add a feature..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2"
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
                      className="text-gray-500 hover:text-red-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded-full px-1"
                      aria-label={`Remove ${feature}`}
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
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="mr-2 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Experience is active and visible to customers
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/admin/activities"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 shadow-sm"
            style={{ backgroundColor: '#ec681c' }}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Experience'}
          </button>
        </div>
      </form>
    </div>
  )
}
