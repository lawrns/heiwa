'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface LegalContent {
  title?: string
  lastUpdated?: string
  content?: string
}

interface LegalContentEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function LegalContentEditor({ content, onChange }: LegalContentEditorProps) {
  const data = content as LegalContent
  const [showPreview, setShowPreview] = useState(false)

  const updateField = (field: keyof LegalContent, value: string) => {
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
          placeholder="Privacy Policy"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
        <input
          type="date"
          value={data.lastUpdated || ''}
          onChange={(e) => updateField('lastUpdated', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
        />
        <p className="text-xs text-gray-500 mt-1">
          This date will be displayed on the page to show when the content was last updated.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-[color] duration-200 focus-visible:outline-none focus-visible:underline"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Preview
              </>
            )}
          </button>
        </div>
        <textarea
          value={data.content || ''}
          onChange={(e) => updateField('content', e.target.value)}
          rows={20}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200 font-mono text-sm"
          placeholder="<h2>Section Title</h2>
<p>Your legal content here...</p>"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use HTML tags for formatting: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a href=&quot;...&quot;&gt;
        </p>
      </div>

      {showPreview && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="mb-2 text-sm font-medium text-gray-500">Preview:</div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            {data.title && (
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h1>
            )}
            {data.lastUpdated && (
              <p className="text-sm text-gray-500 mb-4">
                Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: data.content || '' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
