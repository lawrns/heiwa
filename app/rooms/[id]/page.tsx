import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BedDouble, Bath, Maximize2, Users } from 'lucide-react'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { BookingButton } from '@/components/booking-button'
import { getRooms } from '@/lib/content'
import type { Room } from '@/lib/types'

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { id } = await params
  const rooms = await getRooms()
  const room = rooms.find(r => r.id === id)
  
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
  const { id } = await params
  const rooms = await getRooms()
  const room = rooms.find(r => r.id === id)

  if (!room) {
    notFound()
  }

  // Enhanced room data
  const roomIndex = rooms.findIndex(r => r.id === id)
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
    .filter(r => r.id !== id)
    .slice(0, 2)
    .map((r, idx) => ({
      ...r,
      price: idx === 0 ? 80 : 90,
      beds: idx === 0 ? 1 : 2,
    }))

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm">
            <Link href="/rooms" className="text-gray-600 hover:text-accent transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 rounded">
              ← Back to Room List
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Room Title */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{room.name}</h1>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{enhancedRoom.beds} {enhancedRoom.beds === 1 ? 'bed' : 'beds'}</span>
                </div>
                {enhancedRoom.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{enhancedRoom.bathrooms} bathroom</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{enhancedRoom.size}m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Up to {enhancedRoom.maxGuests} guests</span>
                </div>
              </div>
            </div>

            {/* Image Gallery with Functional Carousel */}
            <div className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
              <ImageCarousel
                images={enhancedRoom.images}
                alt={room.name}
                aspectRatio="video"
              />
            </div>

            {/* Description */}
            <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this room</h2>
              <p className="text-gray-600 leading-relaxed">
                {enhancedRoom.description}
              </p>
            </div>

            {/* Room Facilities */}
            <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Facilities</h2>
              <div className="grid grid-cols-2 gap-3">
                {['Towels', 'Wifi Access'].map((facility, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enhancedRoom.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-1 flex-shrink-0 font-bold">✓</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Book Your Room</h3>
              
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{enhancedRoom.price}€</span>
                  <span className="text-gray-500">/ night</span>
                </div>
                <p className="text-sm text-gray-500">Best price guarantee</p>
              </div>

              <BookingButton
                roomId={room.id}
                className="w-full bg-accent hover:bg-accent-hover text-white py-4 px-6 rounded-lg font-semibold transition-colors mb-4 shadow-md min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
              >
                Check Availability
              </BookingButton>

              <div className="text-center text-sm text-gray-500 mb-6">
                <p>You won&apos;t be charged yet</p>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Good to know</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">✓</span>
                    <span>Free cancellation up to 48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">✓</span>
                    <span>Check-in from 15:00</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">✓</span>
                    <span>Check-out by 10:00</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">✓</span>
                    <span>Common kitchen access</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Questions? <a href="tel:+351912193785" className="text-accent hover:text-accent-dark font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 rounded">Call us</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-16 pt-12 border-t-2 border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {similarRooms.map((similarRoom) => (
                <Link
                  key={similarRoom.id}
                  href={`/rooms/${similarRoom.id}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                >
                  <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <Image
                      src={similarRoom.image}
                      alt={similarRoom.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg">
                      <span className="text-xl font-bold">{similarRoom.price}€</span>
                      <span className="text-xs block opacity-90">per night</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-accent transition-colors mb-3">
                      {similarRoom.name}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        {similarRoom.beds} {similarRoom.beds === 1 ? 'bed' : 'beds'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        1 bathroom
                      </span>
                    </div>
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