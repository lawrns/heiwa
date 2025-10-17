'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BedDouble, Bath } from 'lucide-react'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { PriceBadge } from '@/components/ui/price-badge'
import type { Room } from '@/lib/types'

interface RoomsGridProps {
  rooms: Room[]
}

export function RoomsGrid({ rooms }: RoomsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Room categories
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'dorm', name: 'Dorm room - Bed' },
    { id: 'double', name: 'Double Room' },
    { id: 'family', name: 'Family Suite' },
    { id: 'twin', name: 'Twin Room' },
  ]

  // Transform and enhance rooms with category
  const enhancedRooms = rooms.map((room) => {
    // Determine category from room data
    let category = 'double';
    if (room.bookingType === 'perBed' || (room.capacity && room.capacity >= 4)) {
      category = 'dorm';
    } else if (room.capacity === 2) {
      category = 'twin';
    } else if (room.name.toLowerCase().includes('family')) {
      category = 'family';
    }

    return {
      ...room,
      images: room.images && room.images.length > 0 ? room.images : [room.image],
      price: room.pricing?.standard || room.pricing?.offSeason || 80,
      beds: room.capacity || 1,
      bathrooms: 1, // Default to 1, could be added to database later
      category: category,
      description: room.description || `Comfortable accommodation with capacity for ${room.capacity || 1} guest${(room.capacity || 1) > 1 ? 's' : ''}.`,
    }
  })

  const filteredRooms = selectedCategory === 'all'
    ? enhancedRooms
    : enhancedRooms.filter(room => room.category === selectedCategory)

  return (
    <>
      {/* Category Filter */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto py-6 snap-x snap-mandatory scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                  selectedCategory === category.id
                    ? 'bg-accent text-white font-bold border-b-2 border-accent-dark'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No rooms available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="bg-white rounded-lg shadow-card overflow-hidden group hover-lift block transition-all duration-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {/* Image Carousel */}
                  <div className="relative">
                    <ImageCarousel
                      images={room.images}
                      alt={room.name}
                      aspectRatio="video"
                    />
                    <PriceBadge price={room.price} />
                  </div>

                  {/* Room Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-accent transition-colors">
                      {room.name}
                    </h3>

                    {/* Amenities */}
                    <div className="flex items-center gap-4 mb-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-accent" />
                        <span className="text-sm">{room.beds} {room.beds === 1 ? 'bed' : 'beds'}</span>
                      </div>
                      {room.bathrooms > 0 && (
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4 text-accent" />
                          <span className="text-sm">{room.bathrooms} {room.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">
                      {room.description}
                    </p>

                    {/* CTA */}
                    <div className="inline-flex items-center gap-1 text-accent group-hover:text-accent-hover font-medium text-sm group-hover:gap-2 transition-all">
                      Room Detail
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
