'use client'

import { Plus, X } from 'lucide-react'

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
}

const suggestedDefaults: FAQItem[] = [
  {
    question: 'What is included?',
    answer: 'Your stay includes accommodation and access to the shared facilities. What\'s included in packages depends on the specific offer and will be shown at checkout.',
  },
  {
    question: 'How do I book?',
    answer: 'Use the Book buttons on the site or contact us directly. We\'ll confirm availability and next steps.',
  },
  {
    question: 'What should I bring?',
    answer: 'Bring comfortable clothes, swimwear, and anything personal you like. If you\'re joining surf activities, we can help with equipment rentals if needed.',
  },
]

export function FAQEditor({ content, onChange }: FAQEditorProps) {
  const faqContent = content as FAQContent
  const items = Array.isArray(faqContent.items) ? faqContent.items : []

  const handleChange = (field: keyof FAQContent, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const addItem = () => {
    handleChange('items', [...items, { question: '', answer: '' }])
  }

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    handleChange('items', next)
  }

  const removeItem = (index: number) => {
    handleChange(
      'items',
      items.filter((_, i) => i !== index)
    )
  }

  const seedDefaults = () => {
    handleChange('title', faqContent.title || 'Frequently Asked Questions')
    handleChange('items', suggestedDefaults)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={faqContent.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
          placeholder="Frequently Asked Questions"
        />
      </div>

      {items.length === 0 && (
        <div className="p-3 rounded-lg border border-orange-200 bg-orange-50">
          <div className="text-sm font-medium text-orange-900">This FAQ section is empty</div>
          <div className="text-xs text-orange-800 mt-1">Load suggested starter questions so it\'s clear what to edit.</div>
          <button
            type="button"
            onClick={seedDefaults}
            className="mt-3 w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
          >
            Load Suggested Defaults
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">FAQ Items ({items.length})</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateItem(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                      placeholder="Enter question..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateItem(index, 'answer', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                      placeholder="Enter answer..."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
