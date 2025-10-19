'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

interface SurfCampFormData {
  name: string
  description: string
  start_date: string
  end_date: string
  max_participants: number
  price: number
  level: string
  includes: string[]
  images: string[]
  is_active: boolean
}

const surfLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const commonIncludes = [
  'Accommodation',
  'Surf Lessons',
  'Equipment Rental',
  'Meals',
  'Transportation',
  'Yoga Classes',
  'Skateboard Sessions',
  'Photography',
  'Video Analysis',
  'Beach Cleanup',
  'Cultural Activities',
  'Airport Transfer',
]

export default function NewSurfCampPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SurfCampFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    max_participants: 12,
    price: 0,
    level: 'All Levels',
    includes: [],
    images: [],
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newInclude, setNewInclude] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would be a POST request to /api/admin/surf-camps
      console.log('Creating surf camp:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to surf camps list
      router.push('/admin/surf-camps')
    } catch (err) {
      setError('Failed to create surf camp. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleIncludeChange = (include: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, include]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        includes: prev.includes.filter(i => i !== include)
      }))
    }
  }

  const addCustomInclude = () => {
    if (newInclude.trim() && !formData.includes.includes(newInclude.trim())) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, newInclude.trim()]
      }))
      setNewInclude('')
    }
  }

  const removeInclude = (include: string) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter(i => i !== include)
    }))
  }

  const addImage = () => {
    const url = prompt('Enter image URL:')
    if (url && !formData.images.includes(url)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/surf-camps"
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Surf Camps
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Surf Camp</h1>
        <p className="text-gray-600 mt-2">Create a new surf camp program</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Surf Camp Information</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Spring Surf Adventure"
                />
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level *
                </label>
                <select
                  id="level"
                  required
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {surfLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the surf camp, what participants will learn, and the overall experience..."
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Capacity and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  id="max_participants"
                  required
                  min="1"
                  max="50"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Person (€) *
                </label>
                <input
                  type="number"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="450.00"
                />
              </div>
            </div>

            {/* Includes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              
              {/* Selected Includes */}
              {formData.includes.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.includes.map((include) => (
                      <span
                        key={include}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {include}
                        <button
                          type="button"
                          onClick={() => removeInclude(include)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Common Includes */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {commonIncludes.map((include) => (
                  <label key={include} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.includes.includes(include)}
                      onChange={(e) => handleIncludeChange(include, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{include}</span>
                  </label>
                ))}
              </div>
              
              {/* Custom Include */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  placeholder="Add custom include..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addCustomInclude}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Surf camp ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Image
              </button>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active (camp is available for booking)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <Link
            href="/admin/surf-camps"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Creating...' : 'Create Surf Camp'}
          </button>
        </div>
      </form>
    </div>
  )
}
