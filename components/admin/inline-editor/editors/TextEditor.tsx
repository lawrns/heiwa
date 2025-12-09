'use client'

interface TextEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function TextEditor({ content, onChange }: TextEditorProps) {
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
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Handle features array if present */}
      {Array.isArray(content.features) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          <div className="space-y-2">
            {(content.features as string[]).map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={e => {
                    const newFeatures = [...(content.features as string[])]
                    newFeatures[index] = e.target.value
                    onChange({ ...content, features: newFeatures })
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = (content.features as string[]).filter(
                      (_, i) => i !== index
                    )
                    onChange({ ...content, features: newFeatures })
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newFeatures = [...(content.features as string[]), '']
                onChange({ ...content, features: newFeatures })
              }}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              + Add feature
            </button>
          </div>
        </div>
      )}

      {/* Handle items array if present */}
      {Array.isArray(content.items) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items
          </label>
          <div className="space-y-2">
            {(content.items as string[]).map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={typeof item === 'string' ? item : ''}
                  onChange={e => {
                    const newItems = [...(content.items as string[])]
                    newItems[index] = e.target.value
                    onChange({ ...content, items: newItems })
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = (content.items as string[]).filter(
                      (_, i) => i !== index
                    )
                    onChange({ ...content, items: newItems })
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = [...(content.items as string[]), '']
                onChange({ ...content, items: newItems })
              }}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              + Add item
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
