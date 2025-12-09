'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'

interface Card {
  title: string
  description: string
  image?: string
  images?: string[]
  link?: string
}

interface CardsEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function CardsEditor({ content, onChange }: CardsEditorProps) {
  const cards = (content.cards as Card[]) || []

  const updateField = (field: string, value: string) => {
    onChange({ ...content, [field]: value })
  }

  const updateCard = (index: number, updates: Partial<Card>) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], ...updates }
    onChange({ ...content, cards: newCards })
  }

  const addCard = () => {
    const newCards = [...cards, { title: '', description: '', image: '', link: '' }]
    onChange({ ...content, cards: newCards })
  }

  const removeCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index)
    onChange({ ...content, cards: newCards })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
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

      <hr className="my-4" />

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Cards</label>
        <button
          type="button"
          onClick={addCard}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-4 h-4" />
                <span className="text-sm font-medium">Card {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeCard(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={card.title || ''}
                  onChange={e => updateCard(index, { title: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={card.description || ''}
                  onChange={e => updateCard(index, { description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={card.image || (card.images?.[0] || '')}
                  onChange={e => updateCard(index, { image: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="/images/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={card.link || ''}
                  onChange={e => updateCard(index, { link: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="/play"
                />
              </div>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No cards yet. Click &quot;Add Card&quot; to create one.
          </p>
        )}
      </div>
    </div>
  )
}
