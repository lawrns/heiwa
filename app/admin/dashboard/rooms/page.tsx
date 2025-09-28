'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

interface Room {
  id: string
  name: string
  image_url: string | null
  description: string | null
  active: boolean
}

export default function RoomsManagement() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchRooms()
    }
  }, [authenticated])

  const checkAuth = () => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
    } else {
      setAuthenticated(true)
    }
    setLoading(false)
  }

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching rooms:', error)
        return
      }

      setRooms(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSave = async (room: Room) => {
    try {
      const { error } = await supabaseAdmin
        .from('rooms')
        .upsert(room)

      if (error) {
        console.error('Error saving room:', error)
        return
      }

      setEditingRoom(null)
      fetchRooms()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const { error } = await supabaseAdmin
        .from('rooms')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting room:', error)
        return
      }

      fetchRooms()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!editingRoom) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `rooms/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('cms-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return
      }

      const { data } = supabaseAdmin.storage
        .from('cms-images')
        .getPublicUrl(filePath)

      if (data) {
        setEditingRoom({ ...editingRoom, image_url: data.publicUrl })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom({ ...room })
  }

  const handleCancel = () => {
    setEditingRoom(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Rooms Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Rooms</h2>
                <button
                  onClick={() => setEditingRoom({
                    id: '',
                    name: '',
                    image_url: null,
                    description: null,
                    active: true
                  })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add New Room
                </button>
              </div>

              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="border rounded-lg p-4">
                    {editingRoom?.id === room.id ? (
                      <EditForm
                        room={editingRoom}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onImageUpload={handleImageUpload}
                        uploading={uploading}
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {room.image_url && (
                            <img
                              src={room.image_url}
                              alt={room.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{room.name}</h3>
                            {room.description && (
                              <p className="text-sm text-gray-500">{room.description}</p>
                            )}
                            <p className="text-xs text-gray-400">Active: {room.active ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function EditForm({
  room,
  onSave,
  onCancel,
  onImageUpload,
  uploading
}: {
  room: Room
  onSave: (room: Room) => void
  onCancel: () => void
  onImageUpload: (file: File) => void
  uploading: boolean
}) {
  const [formData, setFormData] = useState(room)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Active</label>
          <select
            value={formData.active ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        {formData.image_url && (
          <img
            src={formData.image_url}
            alt="Room preview"
            className="w-32 h-32 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  )
}