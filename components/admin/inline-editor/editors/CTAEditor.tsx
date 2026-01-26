'use client'

interface CTAContent {
  title?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
}

interface CTAEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function CTAEditor({ content, onChange }: CTAEditorProps) {
  const data = content as CTAContent

  const updateField = (field: keyof CTAContent, value: string) => {
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Ready to Start?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Compelling call to action text..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
        <input
          type="text"
          value={data.buttonText || ''}
          onChange={(e) => updateField('buttonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Book Now"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
        <input
          type="text"
          value={data.buttonUrl || ''}
          onChange={(e) => updateField('buttonUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="/rooms or mailto:info@heiwahouse.com"
        />
      </div>
    </div>
  )
}
