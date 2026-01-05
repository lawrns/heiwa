'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Info, Settings } from 'lucide-react'

interface Activity {
  id: string
  name: string
  category: string
  tier: string
  image_url?: string
  is_active: boolean
}

interface ActivityGridContent {
  title?: string
  description?: string
  category?: 'flow' | 'play' | 'surf'
  tier?: 'always' | 'on-request'
  showTierBadge?: boolean
}

interface ActivityGridEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function ActivityGridEditor({ content, onChange }: ActivityGridEditorProps) {
  const data = content as ActivityGridContent
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof ActivityGridContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  // Fetch activities when category or tier changes
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      setError(null)
      try {
        const category = data.category || 'play'
        const tier = data.tier || 'always'

        const response = await fetch(`/api/activities?category=${category}&tier=${tier}`)
        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }

        const result = await response.json()
        if (result.success && result.data) {
          setActivities(result.data)
        } else {
          setActivities([])
        }
      } catch (err) {
        console.error('Error fetching activities:', err)
        setError('Could not load activities preview')
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [data.category, data.tier])

  return (
    <div className="space-y-4">
      {/* Info Box - Activities are managed separately */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Activities are managed separately
            </p>
            <p className="text-xs text-blue-700 mb-3">
              This section displays activities from the database. Use the filters below to choose which category and tier to show. To add, edit, or remove activities, go to the Activities admin.
            </p>
            <a
              href="/admin/activities"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage Activities
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Activities"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Optional description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={data.category || 'play'}
          onChange={(e) => updateField('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="play">Play</option>
          <option value="flow">Flow</option>
          <option value="surf">Surf</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Filter: Only show activities with this category.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
        <select
          value={data.tier || 'always'}
          onChange={(e) => updateField('tier', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="always">Always Available</option>
          <option value="on-request">On Request</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showTierBadge"
          checked={data.showTierBadge || false}
          onChange={(e) => updateField('showTierBadge', e.target.checked)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="showTierBadge" className="text-sm text-gray-700">Show tier badge on cards</label>
      </div>

      {/* Current Activities Preview */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Activities Preview ({activities.length} items)
          </label>
          <a
            href="/admin/activities"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            Manage Activities <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading activities...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 py-2">{error}</div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-gray-500 py-3 bg-gray-50 rounded-lg px-3">
            <p className="mb-2">No activities found for this category and tier combination.</p>
            <a
              href="/admin/activities"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Add activities in the Activities admin
            </a>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center gap-3 p-2 rounded-lg border ${
                  activity.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                {activity.image_url ? (
                  <img
                    src={activity.image_url}
                    alt={activity.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
                  <p className="text-xs text-gray-500">
                    {activity.category} • {activity.tier}
                    {!activity.is_active && ' • Inactive'}
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
