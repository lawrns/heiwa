'use client'

import { Save, Loader2 } from 'lucide-react'

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
  onSave: () => Promise<boolean>
  saving: boolean
}

export function ActivityGridEditor({ content, onChange, onSave, saving }: ActivityGridEditorProps) {
  const gridContent = content as ActivityGridContent

  const handleChange = (field: keyof ActivityGridContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={gridContent.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g., Core Flow Services"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={gridContent.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Brief description of this section..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={gridContent.category || 'flow'}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="flow">Flow (Wellness)</option>
          <option value="play">Play (Activities)</option>
          <option value="surf">Surf</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Filters which activities are shown from the database
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tier
        </label>
        <select
          value={gridContent.tier || 'always'}
          onChange={(e) => handleChange('tier', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="always">Always Included</option>
          <option value="on-request">On Request</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          &quot;Always&quot; = included in stay, &quot;On Request&quot; = available upon request
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showTierBadge"
          checked={gridContent.showTierBadge || false}
          onChange={(e) => handleChange('showTierBadge', e.target.checked)}
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <label htmlFor="showTierBadge" className="text-sm text-gray-700">
          Show tier badge on activity cards
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  )
}
