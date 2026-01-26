'use client'

interface SurfWeeksEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function SurfWeeksEditor({ content, onChange }: SurfWeeksEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const bullets = Array.isArray(content.bullets)
    ? (content.bullets as unknown[]).filter(b => typeof b === 'string') as string[]
    : []

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={e => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={(content.subtitle as string) || ''}
          onChange={e => updateField('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition duration-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
        <input
          type="text"
          value={((content.video_id as string) || (content.videoId as string) || '')}
          onChange={e => updateField('video_id', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition duration-200"
          placeholder="9nhQiKGsgHg"
        />
        <p className="text-xs text-gray-500 mt-1">This is the part after v= in a YouTube URL.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bullet Points (one per line)</label>
        <textarea
          value={bullets.join('\n')}
          onChange={e => {
            // Split by newlines but preserve text as-is during editing
            // Only filter out completely empty lines, not lines with spaces
            const next = e.target.value.split('\n')
            updateField('bullets', next)
          }}
          onBlur={e => {
            // Trim whitespace and filter empty lines only on blur (when user finishes editing)
            const cleaned = e.target.value
              .split('\n')
              .map(s => s.trim())
              .filter(Boolean)
            updateField('bullets', cleaned)
          }}
          rows={7}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Professional surf instruction for all levels\nDaily yoga and meditation sessions"
        />
      </div>
    </div>
  )
}
