'use client'

import { Save, Loader2 } from 'lucide-react'

interface IntroContent {
  title?: string
  content?: string
}

interface IntroEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
  onSave: () => Promise<boolean>
  saving: boolean
}

export function IntroEditor({ content, onChange, onSave, saving }: IntroEditorProps) {
  const introContent = content as IntroContent

  const handleChange = (field: keyof IntroContent, value: string) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          value={introContent.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter section title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={introContent.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter introduction text..."
        />
        <p className="mt-1 text-xs text-gray-500">
          You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;)
        </p>
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
