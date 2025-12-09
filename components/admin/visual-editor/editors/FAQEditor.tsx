'use client'

import { Save, Loader2, Plus, X, GripVertical } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQContent {
  title?: string
  items?: FAQItem[]
}

interface FAQEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
  onSave: () => Promise<boolean>
  saving: boolean
}

export function FAQEditor({ content, onChange, onSave, saving }: FAQEditorProps) {
  const faqContent = content as FAQContent
  const items = faqContent.items || []

  const handleChange = (field: keyof FAQContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const addItem = () => {
    handleChange('items', [...items, { question: '', answer: '' }])
  }

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    handleChange('items', newItems)
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    handleChange('items', newItems)
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === items.length - 1) return

    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp
    handleChange('items', newItems)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title (optional)
        </label>
        <input
          type="text"
          value={faqContent.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="e.g., Frequently Asked Questions"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            FAQ Items ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-2 mb-3">
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Question {index + 1}
                    </label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateItem(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter question..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateItem(index, 'answer', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter answer..."
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Remove question"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No FAQ items added yet. Click &quot;Add Question&quot; to create one.
            </p>
          )}
        </div>
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
