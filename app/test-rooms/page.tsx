'use client'

import { useEffect, useState } from 'react'

interface RoomData {
  id: string
  name: string
  capacity: number
  price_per_night: number
  featured_image: string
}

export default function TestRoomsPage() {
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 Starting to fetch rooms...')

    fetch('/api/rooms')
      .then(res => {
        console.log('📥 Got response:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('✅ Got data:', data)
        if (data.success && data.data?.rooms) {
          console.log('🏠 Setting rooms:', data.data.rooms.length)
          setRooms(data.data.rooms)
        } else {
          throw new Error('No rooms in response')
        }
      })
      .catch(err => {
        console.error('❌ Error:', err)
        setError(err.message)
      })
      .finally(() => {
        console.log('🏁 Setting loading to false')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-20"><h1 className="text-4xl">Loading rooms...</h1></div>
  }

  if (error) {
    return <div className="p-20"><h1 className="text-4xl text-red-500">Error: {error}</h1></div>
  }

  return (
    <div className="p-20">
      <h1 className="text-4xl mb-8">Rooms ({rooms.length})</h1>
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="border p-4 rounded">
            <h2 className="text-2xl font-bold">{room.name}</h2>
            <p>Capacity: {room.capacity}</p>
            <p>Price: ${room.price_per_night}</p>
            <p>Image: {room.featured_image}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
