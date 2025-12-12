'use client'

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

  const updateField = (field: keyof ActivityGridContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
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
        <p className="text-xs text-gray-500 mt-1">Activities are pulled from the database filtered by this category.</p>
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
    </div>
  )
}
