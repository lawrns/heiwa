'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { ImagePicker } from '../ImagePicker'

interface Step {
  title: string
  description: string
  image?: string
}

interface StepsEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function StepsEditor({ content, onChange }: StepsEditorProps) {
  const steps = Array.isArray(content.steps) ? (content.steps as Step[]) : []

  const updateField = (field: string, value: string) => {
    onChange({ ...content, [field]: value })
  }

  const updateStep = (index: number, updates: Partial<Step>) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], ...updates }
    onChange({ ...content, steps: newSteps })
  }

  const addStep = () => {
    const newSteps = [...steps, { title: '', description: '', image: '' }]
    onChange({ ...content, steps: newSteps })
  }

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index)
    onChange({ ...content, steps: newSteps })
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
        />
      </div>

      <hr className="my-4" />

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Steps
        </label>
        <button
          type="button"
          onClick={addStep}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-[color] duration-200 focus-visible:outline-none focus-visible:underline"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-4 h-4" />
                <span className="text-sm font-medium">Step {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-[background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
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
                  value={step.title || ''}
                  onChange={e => updateStep(index, { title: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={step.description || ''}
                  onChange={e => updateStep(index, { description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <ImagePicker
                label="Image (optional)"
                value={step.image || ''}
                onChange={url => updateStep(index, { image: url })}
                placeholder="Select step image..."
              />
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No steps yet. Click &quot;Add Step&quot; to create one.
          </p>
        )}
      </div>
    </div>
  )
}
