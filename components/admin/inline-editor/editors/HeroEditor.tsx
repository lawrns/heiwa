'use client'

interface HeroEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function HeroEditor({ content, onChange }: HeroEditorProps) {
  const updateField = (field: string, value: string) => {
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
          value={(content.title as string) || ''}
          onChange={e => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtitle
        </label>
        <input
          type="text"
          value={(content.subtitle as string) || ''}
          onChange={e => updateField('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={(content.description as string) || ''}
          onChange={e => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <input
          type="url"
          value={(content.video_url as string) || ''}
          onChange={e => updateField('video_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL (fallback)
        </label>
        <input
          type="url"
          value={(content.image_url as string) || ''}
          onChange={e => updateField('image_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="/images/..."
        />
      </div>

      <hr className="my-4" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Button Text
        </label>
        <input
          type="text"
          value={(content.primary_link_text as string) || ''}
          onChange={e => updateField('primary_link_text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Button URL
        </label>
        <input
          type="text"
          value={(content.primary_link_url as string) || ''}
          onChange={e => updateField('primary_link_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="/surf-weeks"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secondary Button Text
        </label>
        <input
          type="text"
          value={(content.secondary_link_text as string) || ''}
          onChange={e => updateField('secondary_link_text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secondary Button URL
        </label>
        <input
          type="text"
          value={(content.secondary_link_url as string) || ''}
          onChange={e => updateField('secondary_link_url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="/rooms"
        />
      </div>
    </div>
  )
}
