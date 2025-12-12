'use client'

interface SEOContent {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
}

interface SEOEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function SEOEditor({ content, onChange }: SEOEditorProps) {
  const seo = content as SEOContent

  const updateField = (field: keyof SEOContent, value: string) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
        <input
          type="text"
          value={seo.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g. Play - Heiwa House"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
        <textarea
          value={seo.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Short description shown in search results..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
        <input
          type="text"
          value={seo.keywords || ''}
          onChange={(e) => updateField('keywords', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="comma, separated, keywords"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Image URL</label>
        <input
          type="text"
          value={seo.ogImage || ''}
          onChange={(e) => updateField('ogImage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="/images/og/some-image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL (optional)</label>
        <input
          type="text"
          value={seo.canonical || ''}
          onChange={(e) => updateField('canonical', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="https://heiwahouse.com/play"
        />
      </div>

      <div className="text-xs text-gray-500">
        SEO metadata is applied best on server-rendered pages. If a page is currently client-rendered, this section is still stored but may require a refactor to apply to {'<head>'}.
      </div>
    </div>
  )
}
