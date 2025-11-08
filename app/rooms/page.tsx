import { getRooms } from '@/lib/content'
import { RoomsGrid } from './rooms-grid'

// Force dynamic rendering to prevent static caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RoomsPage() {
  // Fetch rooms server-side
  const rooms = await getRooms()

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Simple Page Title */}
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Room List</h1>
        </div>
      </div>

      {/* Rooms Grid with Client-Side Filtering */}
      <RoomsGrid rooms={rooms} />
    </div>
  )
}
