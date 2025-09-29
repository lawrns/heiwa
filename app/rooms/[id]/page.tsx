import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BedDouble, Bath, Maximize2, Users, Wifi, Coffee, Tv, Wind } from 'lucide-react'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { BookingButton } from '@/components/booking-button'
import { getRooms } from '@/lib/content'
import type { Room } from '@/lib/types'

interface RoomPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const rooms = await getRooms()
  const room = rooms.find(r => r.id === params.id)
  
  if (!room) {
    return {
      title: 'Room Not Found - Heiwa House',
    }
  }

  return {
    title: `${room.name} - Room Details | Heiwa House`,
    description: room.description || `Book ${room.name} at Heiwa House, Santa Cruz, Portugal`,
  }
}

export default async function RoomDetailPage({ params }: RoomPageProps) {
  const rooms = await getRooms()
  const room = rooms.find(r => r.id === params.id)

  if (!room) {
    notFound()
  }

  // Enhanced room data
  const roomIndex = rooms.findIndex(r => r.id === params.id)
  const isDorm = roomIndex === 3 || room.name.toLowerCase().includes('dorm')
  const isTwin = roomIndex === 0 || roomIndex === 2 || room.name.toLowerCase().includes('twin') || room.name.includes('Nr 1') || room.name.includes('Nr 3')
  
  const enhancedRoom = {
    ...room,
    images: [
      room.image,
      room.image,
      room.image,
      room.image,
      room.image,
      room.image,
    ],
    price: isDorm ? 30 : room.name.includes('Nr 1') ? 90 : 80,
    beds: isDorm ? 6 : isTwin ? 2 : 1,
    bathrooms: isDorm ? 0 : 1,
    size: isDorm ? 45 : 25,
    maxGuests: isDorm ? 6 : 2,
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Coffee, label: 'Common Kitchen' },
      { icon: Tv, label: 'Common Area' },
      { icon: Wind, label: 'Shared Spaces' },
    ],
    description: room.description || `Step into this beautifully designed ${isDorm ? 'shared dormitory' : 'room'}, blending modern comforts with rustic charm. ${isDorm ? 'Features sturdy, handcrafted wooden bunk beds perfect for solo travelers and groups.' : 'The cozy space features comfortable furniture complemented by traditional Portuguese tiles.'} Perfect for your surf adventure in Santa Cruz.`,
    features: isDorm 
      ? [
          'Handcrafted wooden bunk beds',
          'Shared bathroom facilities',
          'Locker for each guest',
          'Large windows with natural light',
          'Reading lights',
          'Power outlets at each bed'
        ]
      : [
          'Comfortable bed(s)',
          'Private bathroom with shower',
          'Traditional Portuguese tiles',
          'Natural light',
          'Comfortable seating area',
          'Storage space'
        ]
  }

  // Similar rooms
  const similarRooms = rooms
    .filter(r => r.id !== params.id)
    .slice(0, 2)
    .map((r, idx) => ({
      ...r,
      price: idx === 0 ? 80 : 90,
      beds: idx === 0 ? 1 : 2,
    }))

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm">
            <Link href="/rooms" className="text-gray-500 hover:text-accent transition-colors">
              Room List
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{room.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Price Badge & Title Above Images */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent text-white px-6 py-3 rounded-lg inline-flex items-center gap-2">
              <span className="text-2xl font-bold">{enhancedRoom.price}€</span>
              <span className="text-sm opacity-90">PER NIGHT</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <ImageCarousel
                images={enhancedRoom.images}
                alt={room.name}
                aspectRatio="video"
              />
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <BedDouble className="w-5 h-5 text-accent" />
                <span className="font-medium">{enhancedRoom.beds} {enhancedRoom.beds === 1 ? 'bed' : 'beds'}</span>
              </div>
              {enhancedRoom.bathrooms > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Bath className="w-5 h-5 text-accent" />
                  <span className="font-medium">{enhancedRoom.bathrooms} bathroom</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <Maximize2 className="w-5 h-5 text-accent" />
                <span className="font-medium">{enhancedRoom.size}m²</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-medium">Up to {enhancedRoom.maxGuests} guests</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this room</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {enhancedRoom.description}
              </p>
            </div>

            {/* Room Facilities */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Facilities</h2>
              <div className="grid grid-cols-2 gap-3">
                {['Towels', 'Wifi Access'].map((facility, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enhancedRoom.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-1 flex-shrink-0">✓</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability Calendar Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">Check room availability and book your dates</p>
                <BookingButton 
                  roomId={room.id}
                  className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2 hover:scale-105"
                >
                  Check Availability & Book
                </BookingButton>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Your Room</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{enhancedRoom.price}€</span>
                  <span className="text-gray-500">/ night</span>
                </div>
                <p className="text-sm text-gray-500">Best price guarantee</p>
              </div>

              <BookingButton 
                roomId={room.id}
                className="w-full bg-accent hover:bg-accent-hover text-white py-4 px-6 rounded-lg font-semibold transition-all hover:scale-105 mb-4"
              >
                Check Availability
              </BookingButton>

              <div className="text-center text-sm text-gray-500 mb-6">
                <p>You won't be charged yet</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Good to know</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Free cancellation up to 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Check-in from 15:00</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Check-out by 10:00</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Common kitchen access</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Questions? <a href="tel:+351912193785" className="text-accent hover:text-accent-dark font-medium">Call +351 912 193 785</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {similarRooms.map((similarRoom) => (
                <Link
                  key={similarRoom.id}
                  href={`/rooms/${similarRoom.id}`}
                  className="group hover-lift"
                >
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={similarRoom.image}
                      alt={similarRoom.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg">
                      <span className="text-lg font-bold">{similarRoom.price}€</span>
                      <span className="text-xs block">per night</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-accent transition-colors mb-2">
                    {similarRoom.name}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <span>{similarRoom.beds} {similarRoom.beds === 1 ? 'bed' : 'beds'}</span>
                    <span>•</span>
                    <span>1 bathroom</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}