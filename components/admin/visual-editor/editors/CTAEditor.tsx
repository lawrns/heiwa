'use client'

import { Save, Loader2 } from 'lucide-react'

interface CTAContent {
  title?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
}

interface CTAEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
  onSave: () => Promise<boolean>
  saving: boolean
}

export function CTAEditor({ content, onChange, onSave, saving }: CTAEditorProps) {
  const ctaContent = content as CTAContent

  const handleChange = (field: keyof CTAContent, value: string) => {
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
          value={ctaContent.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g., Ready to Find Your Flow?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={ctaContent.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Add a compelling description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Button Text
        </label>
        <input
          type="text"
          value={ctaContent.buttonText || ''}
          onChange={(e) => handleChange('buttonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g., Book Now"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Button URL
        </label>
        <input
          type="text"
          value={ctaContent.buttonUrl || ''}
          onChange={(e) => handleChange('buttonUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g., mailto:info@heiwahouse.com or /contact"
        />
        <p className="mt-1 text-xs text-gray-500">
          Can be an email (mailto:), page path (/contact), or external URL (https://...)
        </p>
      </div>

      {/* Preview */}
      {(ctaContent.title || ctaContent.buttonText) && (
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            {ctaContent.title && (
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {ctaContent.title}
              </h3>
            )}
            {ctaContent.description && (
              <p className="text-gray-600 mb-4">
                {ctaContent.description}
              </p>
            )}
            {ctaContent.buttonText && (
              <span className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold">
                {ctaContent.buttonText}
              </span>
            )}
          </div>
        </div>
      )}

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
