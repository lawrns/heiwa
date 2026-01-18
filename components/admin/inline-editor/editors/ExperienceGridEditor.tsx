'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Info, Settings } from 'lucide-react'

interface Experience {
  id: string
  name: string
  category: string
  tier: string
  image_url?: string
  is_active: boolean
}

interface ExperienceGridContent {
  title?: string
  description?: string
  category?: 'flow' | 'play' | 'surf'
  tier?: 'always' | 'on-request'
  showTierBadge?: boolean
}

interface ExperienceGridEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function ExperienceGridEditor({ content, onChange }: ExperienceGridEditorProps) {
  const data = content as ExperienceGridContent
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof ExperienceGridContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  // Fetch experiences when category or tier changes
  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true)
      setError(null)
      try {
        const category = data.category || 'play'
        const tier = data.tier || 'always'

        const response = await fetch(`/api/activities?category=${category}&tier=${tier}`)
        if (!response.ok) {
          throw new Error('Failed to fetch experiences')
        }

        const result = await response.json()
        if (result.success && result.data) {
          setExperiences(result.data)
        } else {
          setExperiences([])
        }
      } catch (err) {
        console.error('Error fetching experiences:', err)
        setError('Could not load experiences preview')
        setExperiences([])
      } finally {
        setLoading(false)
      }
    }

    fetchExperiences()
  }, [data.category, data.tier])

  return (
    <div className="space-y-4" role="region" aria-label="Experiences Grid Editor">
      {/* Info Box - Experiences are managed separately */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="alert">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Experiences are managed separately
            </p>
            <p className="text-xs text-blue-700 mb-3">
              This section displays experiences from the database. Use the filters below to choose which category and tier to show. To add, edit, or remove experiences, go to the Experiences admin.
            </p>
            <a
              href="/admin/activities"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2"
            >
              <Settings className="w-4 h-4" />
              Manage Experiences
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Experiences"
          aria-label="Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Describe these experiences..."
          aria-label="Description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={data.category || 'play'}
          onChange={(e) => updateField('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          aria-label="Category"
        >
          <option value="flow">Flow (Wellness)</option>
          <option value="play">Play (Experiences)</option>
          <option value="surf">Surf</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Filter: Only show experiences with this category.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
        <select
          value={data.tier || 'always'}
          onChange={(e) => updateField('tier', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          aria-label="Tier"
        >
          <option value="always">Always Included</option>
          <option value="on-request">On Request</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showTierBadge"
          checked={data.showTierBadge || false}
          onChange={(e) => updateField('showTierBadge', e.target.checked)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 cursor-pointer"
          aria-label="Show tier badge on cards"
        />
        <label htmlFor="showTierBadge" className="text-sm text-gray-700 cursor-pointer">Show tier badge on cards</label>
      </div>

      {/* Current Experiences Preview */}
      <div className="border-t border-gray-200 pt-4 mt-4" role="region" aria-label="Experiences Preview">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Experiences Preview ({experiences.length} items)
          </label>
          <a
            href="/admin/activities"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-[color] duration-200 focus-visible:outline-none focus-visible:underline"
          >
            Manage Experiences <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading experiences...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 py-2">{error}</div>
        ) : experiences.length === 0 ? (
          <div className="text-sm text-gray-500 py-3 bg-gray-50 rounded-lg px-3">
            <p className="mb-2">No experiences found for this category and tier combination.</p>
            <a
              href="/admin/activities"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline transition-[color] duration-200 focus-visible:outline-none"
            >
              Add experiences in the Experiences admin
            </a>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-[background-color,border-color] duration-200 ${
                  experience.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                {experience.image_url ? (
                  <img
                    src={experience.image_url}
                    alt={experience.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{experience.name}</p>
                  <p className="text-xs text-gray-500">
                    {experience.category} • {experience.tier}
                    {!experience.is_active && ' • Inactive'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
