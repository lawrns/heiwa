'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BedDouble, Bath } from 'lucide-react'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { PriceBadge } from '@/components/ui/price-badge'
import { getRooms, getFallbackRooms } from '@/lib/content'
import ErrorBoundary from '@/components/error-boundary'
import type { Room } from '@/lib/types'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const loadRooms = async () => {
      try {
        console.log('🏨 RoomsPage: Loading rooms...')
        const fetchedRooms = await getRooms()
        console.log('🏨 RoomsPage: Loaded rooms:', fetchedRooms.length)
        setRooms(fetchedRooms)
      } catch (error) {
        console.error('🏨 RoomsPage: Failed to load rooms:', error)
        // Fallback to static data if everything fails
        const fallbackRooms = getFallbackRooms()
        console.log('🏨 RoomsPage: Using fallback rooms:', fallbackRooms.length)
        setRooms(fallbackRooms)
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [])

  // Room categories from heiwahouse.com
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'dorm', name: 'Dorm room - Bed' },
    { id: 'double', name: 'Double Room' },
    { id: 'family', name: 'Family Suite' },
    { id: 'twin', name: 'Twin Room' },
  ]

  // Enhance rooms with detailed data (in real app, this would come from Supabase)
  const enhancedRooms = rooms.map((room, index) => ({
    ...room,
    images: [
      room.image,
      room.image, // In real app, fetch multiple images
      room.image,
      room.image,
      room.image,
      room.image,
      room.image,
      room.image,
    ],
    price: index === 3 ? 30 : index === 0 ? 90 : 80,
    beds: index === 3 ? 6 : index === 0 || index === 2 ? 2 : 1,
    bathrooms: index === 3 ? 0 : 1,
    category: index === 3 ? 'dorm' : index === 0 || index === 2 ? 'twin' : 'double',
    description: room.description || `Beautiful room with ${index === 3 ? '6 beds' : index === 0 || index === 2 ? '2 beds' : '1 bed'}.`,
  }))

  const filteredRooms = selectedCategory === 'all' 
    ? enhancedRooms 
    : enhancedRooms.filter(room => room.category === selectedCategory)

  return (
    <ErrorBoundary>
      <div className="min-h-screen pt-20">
        {/* Page Title */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-text">Room List</h1>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <section className="py-section-y bg-surface-alt">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-text-muted">Loading rooms...</div>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted text-lg">No rooms available in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    {/* Image Carousel */}
                    <div className="relative">
                      <ImageCarousel
                        images={room.images}
                        alt={room.name}
                        aspectRatio="video"
                      />
                      <PriceBadge price={room.price} period="Per Night" />
                    </div>

                    {/* Room Details */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-text mb-4">
                        <Link
                          href={`/rooms/${room.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          {room.name}
                        </Link>
                      </h3>

                      {/* Amenities */}
                      <div className="flex items-center gap-6 mb-4 text-text-muted">
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-5 h-5" />
                          <span className="text-sm">{room.beds} {room.beds === 1 ? 'bed' : 'beds'}</span>
                        </div>
                        {room.bathrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <Bath className="w-5 h-5" />
                            <span className="text-sm">{room.bathrooms} {room.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-text-muted text-sm mb-6 line-clamp-3">
                        {room.description}
                      </p>

                      {/* CTA */}
                      <Link
                        href={`/rooms/${room.id}`}
                        className="inline-block w-full text-center px-6 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors rounded-button font-medium"
                      >
                        Room Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </ErrorBoundary>
  )
}