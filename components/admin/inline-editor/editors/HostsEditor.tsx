'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'

interface Host {
  name: string
  role?: string
  bio?: string
  imageUrl?: string
}

interface HostsEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function HostsEditor({ content, onChange }: HostsEditorProps) {
  const hosts: Host[] = Array.isArray(content.hosts)
    ? (content.hosts as unknown[]).filter(h => typeof h === 'object' && h !== null) as Host[]
    : []

  const updateField = (field: string, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  const updateHost = (index: number, updates: Partial<Host>) => {
    const next = [...hosts]
    next[index] = { ...next[index], ...updates }
    updateField('hosts', next)
  }

  const addHost = () => {
    updateField('hosts', [...hosts, { name: '', role: '', bio: '', imageUrl: '' }])
  }

  const removeHost = (index: number) => {
    updateField('hosts', hosts.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ''}
          onChange={e => updateField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <hr className="my-4" />

      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Hosts</label>
        <button
          type="button"
          onClick={addHost}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          <Plus className="w-4 h-4" />
          Add Host
        </button>
      </div>

      <div className="space-y-4">
        {hosts.map((host, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="w-4 h-4" />
                <span className="text-sm font-medium">Host {index + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => removeHost(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={host.name || ''}
                  onChange={e => updateHost(index, { name: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <input
                  type="text"
                  value={host.role || ''}
                  onChange={e => updateHost(index, { role: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                <textarea
                  value={host.bio || ''}
                  onChange={e => updateHost(index, { bio: e.target.value })}
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <input
                  type="text"
                  value={host.imageUrl || ''}
                  onChange={e => updateHost(index, { imageUrl: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="/images/..."
                />
              </div>
            </div>
          </div>
        ))}

        {hosts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No hosts yet. Click &quot;Add Host&quot; to create one.
          </p>
        )}
      </div>
    </div>
  )
}
