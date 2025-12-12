'use client'

import { Plus, Trash2 } from 'lucide-react'

interface HostsEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

/**
 * HostsEditor - Edits the "Your Hosts" section on the homepage
 * 
 * This section has:
 * - Title (e.g., "Your Hosts")
 * - Image URL (polaroid-style photo)
 * - Multiple paragraphs of text
 * - Signature (host names)
 */
export function HostsEditor({ content, onChange }: HostsEditorProps) {
  // Get paragraphs as array, or convert legacy content
  const paragraphs: string[] = Array.isArray(content.paragraphs)
    ? (content.paragraphs as string[])
    : []

  const updateField = (field: string, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const updateParagraph = (index: number, value: string) => {
    const next = [...paragraphs]
    next[index] = value
    updateField('paragraphs', next)
  }

  const addParagraph = () => {
    updateField('paragraphs', [...paragraphs, ''])
  }

  const removeParagraph = (index: number) => {
    updateField('paragraphs', paragraphs.filter((_, i) => i !== index))
  }

  // Seed with default content from the hardcoded component
  const seedDefaults = () => {
    onChange({
      ...content,
      title: 'Your Hosts',
      imageUrl: '/images/DSC03534.jpg',
      paragraphs: [
        'Surf the waves, flow through yoga, and find your rhythm in the heartbeat of Heiwa House. We believe in the power of connection, the joy of play, and the magic of living in the moment.',
        'You can book a room and enjoy our amazing facilities, or join one of our all-inclusive surf weeks for the ultimate experience. Our space is designed to bring people together, create lasting memories, and help you discover your best self.',
        'To join a group of like-minded people who share your passion for surfing, adventure, and authentic experiences, check out our surf weeks. We create an environment where friendships are born and adventures begin.',
        'We also offer the option to rent the space for your own events, retreats, or special occasions. Whether it\'s a yoga retreat, team building, or a private celebration, Heiwa House provides the perfect backdrop for your gathering.',
      ],
      signature: 'Janis, Buka & Edijs',
    })
  }

  const isEmpty = !content.title && paragraphs.length === 0 && !content.signature

  return (
    <div className="space-y-4">
      {/* Seed defaults button if empty */}
      {isEmpty && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 mb-2">
            This section is empty. Load the default content?
          </p>
          <button
            type="button"
            onClick={seedDefaults}
            className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
          >
            Load Default Content
          </button>
        </div>
      )}

      {/* Section Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={e => updateField('title', e.target.value)}
          placeholder="Your Hosts"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="text"
          value={(content.imageUrl as string) || ''}
          onChange={e => updateField('imageUrl', e.target.value)}
          placeholder="/images/hosts-photo.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        {typeof content.imageUrl === 'string' && content.imageUrl && (
          <div className="mt-2 w-32 h-32 bg-gray-100 rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <hr className="my-4" />

      {/* Paragraphs */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Content Paragraphs</label>
        <button
          type="button"
          onClick={addParagraph}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Paragraph
        </button>
      </div>

      <div className="space-y-3">
        {paragraphs.map((para, index) => (
          <div key={index} className="relative">
            <textarea
              value={para}
              onChange={e => updateParagraph(index, e.target.value)}
              rows={3}
              placeholder={`Paragraph ${index + 1}...`}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
            <button
              type="button"
              onClick={() => removeParagraph(index)}
              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
              title="Remove paragraph"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {paragraphs.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No paragraphs yet. Click &quot;Add Paragraph&quot; to add content.
          </p>
        )}
      </div>

      <hr className="my-4" />

      {/* Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Host Names)</label>
        <input
          type="text"
          value={(content.signature as string) || ''}
          onChange={e => updateField('signature', e.target.value)}
          placeholder="Janis, Buka & Edijs"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 italic"
        />
      </div>
    </div>
  )
}
