'use client'

import { useEffect, useMemo, useState } from 'react'

interface RoomOption {
  id: string
  name: string
}

interface RoomsPickerEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function RoomsPickerEditor({ content, onChange }: RoomsPickerEditorProps) {
  const [rooms, setRooms] = useState<RoomOption[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const selectedRoomIds: string[] = Array.isArray(content.roomIds)
    ? (content.roomIds as unknown[]).filter(id => typeof id === 'string') as string[]
    : []

  const updateField = (field: string, value: unknown) => {
    onChange({ ...content, [field]: value })
  }

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/rooms', { cache: 'no-store' })
        const data = await res.json()
        const roomsArray = data?.data?.rooms

        if (data?.success && Array.isArray(roomsArray)) {
          setRooms(
            roomsArray
              .filter((r) => r?.id && r?.name)
              .map((r) => ({ id: (r as { id: string }).id, name: (r as { name: string }).name }))
          )
        } else {
          setRooms([])
        }
      } catch (e) {
        console.error('Failed to load rooms for picker:', e)
        setRooms([])
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter(r => r.name.toLowerCase().includes(q))
  }, [rooms, query])

  const toggleRoom = (roomId: string) => {
    if (selectedRoomIds.includes(roomId)) {
      updateField('roomIds', selectedRoomIds.filter(id => id !== roomId))
    } else {
      updateField('roomIds', [...selectedRoomIds, roomId])
    }
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
        <input
          type="text"
          value={(content.subtitle as string) || ''}
          onChange={e => updateField('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <hr className="my-4" />

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Featured Rooms</label>
        <span className="text-xs text-gray-500">Selected: {selectedRoomIds.length}</span>
      </div>

      <div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Search rooms..."
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading rooms…</div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-sm text-gray-500">No rooms found.</div>
      ) : (
        <div className="space-y-2">
          {filteredRooms.map(r => {
            const checked = selectedRoomIds.includes(r.id)
            return (
              <label
                key={r.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRoom(r.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-900">{r.name}</span>
              </label>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Ordering: rooms display in the order you select them. Uncheck to remove.
      </p>
    </div>
  )
}
