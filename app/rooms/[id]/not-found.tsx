import Link from 'next/link'
import { Home } from 'lucide-react'

export default function RoomNotFound() {
  return (
    <div className="min-h-screen pt-20 bg-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Room Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the room you&apos;re looking for. It may have been removed or the link might be incorrect.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Room List
        </Link>
      </div>
    </div>
  )
}
