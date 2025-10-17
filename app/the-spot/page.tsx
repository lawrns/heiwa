import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ImageCarousel } from '@/components/ui/image-carousel'

export const metadata: Metadata = {
  title: 'The Spot - Heiwa House Facilities & Activities',
  description: 'Discover Heiwa House - a premium surf destination with yoga dome, skatepark, beach access, and world-class facilities in Santa Cruz, Portugal.',
}

export default function TheSpotPage() {
  // Venue images (property overview)
  const venueImages = [
    '/images/dji_fly_20240111_135624_97_1704981432374_photo_optimized-1.jpg',
    '/images/DSC03491.jpg',
    '/images/Freedomroutes-rooms-50.jpg',
    '/images/Freedomroutes-rooms-1.jpg',
    '/images/DSF8619-1.jpg',
    '/images/DSC03534.jpg',
    '/images/DSC03479.jpg',
    '/images/DSF8567.jpg',
    '/images/DSF7352.jpg',
    '/images/DSC04163.jpg',
  ]

  // Yoga dome images
  const yogaImages = [
    '/images/DSC02767-scaled.jpg',
    '/images/DSC03081-scaled.jpg',
    '/images/DSC03521-scaled.jpg',
    '/images/DSC03530-scaled.jpg',
  ]

  // Skatepark & activities images
  const skateparkImages = [
    '/images/DSC04325.jpg',
    '/images/DSF7498.jpg',
    '/images/DSC01794.jpg',
    '/images/DSC01829-Enhanced-NR-2.jpg',
    '/images/DSF8322-scaled.jpg',
  ]

  // Pool images
  const poolImages = [
    '/images/DSC08054-scaled.jpg',
    '/images/DSC08600-scaled.jpg',
  ]

  // Games & recreation images
  const gamesImages = [
    '/images/DSC08736-scaled.jpg',
    '/images/DSF8298-scaled.jpg',
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Featured Image */}
      <section className="relative h-96 w-full overflow-hidden bg-gray-900">
        <Image
          src="/images/dji_fly_20240111_135624_97_1704981432374_photo_optimized-1.jpg"
          alt="Heiwa House Property Overview"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">The Spot</h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">Your ultimate adult playground on Portugal&apos;s coast</p>
          </div>
        </div>
      </section>

      {/* Page Title Section */}
      <div className="py-12 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Heiwa House</h2>
          <p className="text-lg text-gray-600">A surf, yoga, and lifestyle destination like no other</p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Story</h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              Heiwa House started as a dream to create more than just a surf house—a place that feels like home. After years of running surf camps and renting spaces, it was time to build something permanent. Months of searching and a shared vision led us to the perfect location on Portugal&apos;s stunning coast.
            </p>
            <p>
              A love for surfing, yoga, design, and good vibes helped shape the space into something truly special. We wanted to create a sanctuary where guests could disconnect from the everyday, reconnect with nature, and discover their true passion.
            </p>
            <p>
              Now, Heiwa House is the ultimate adult playground—a place to catch waves, find your flow, connect with like-minded adventurers, and just enjoy life to the fullest.
            </p>
          </div>
        </div>
      </section>

      {/* Property Overview Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Explore the Property</h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">Discover every corner of Heiwa House, from our beachfront location to our state-of-the-art facilities</p>
          <div className="max-w-5xl mx-auto">
            <ImageCarousel
              images={venueImages}
              alt="Heiwa House Property Overview"
              aspectRatio="aspect-video"
            />
          </div>
        </div>
      </section>

      {/* Yoga Dome Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Heiwa Flow - Yoga Dome</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Our stunning yoga dome overlooks the Portuguese countryside with ocean breezes and natural light. A sacred space designed for yoga, meditation, and spiritual practice.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Daily guided yoga sessions for all levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Meditation and breathwork classes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Private sessions available</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Perfect sunset views</span>
                </li>
              </ul>
            </div>
            <div>
              <ImageCarousel
                images={yogaImages}
                alt="Yoga Dome"
                aspectRatio="aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skatepark Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <ImageCarousel
                images={skateparkImages}
                alt="Skatepark and Ramps"
                aspectRatio="aspect-video"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Heiwa Play - Skatepark</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Our professional-grade skatepark features custom-built ramps, bowls, and obstacles for all skill levels. Whether you&apos;re a beginner or pro, there&apos;s something for everyone.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Multiple difficulty levels and features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Professional coaching available</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Community events and competitions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Equipment rental available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Swimming Pool Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Swimming Pool</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Relax by our crystal-clear swimming pool, perfect for cooling off after an intense surf session or yoga class. Sunbathing, swimming, and socializing in a beautiful setting.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Open year-round</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Lounge seating and umbrellas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Refreshment bar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Perfect for all ages</span>
                </li>
              </ul>
            </div>
            <div>
              <ImageCarousel
                images={poolImages}
                alt="Swimming Pool"
                aspectRatio="aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Games & Recreation Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <ImageCarousel
                images={gamesImages}
                alt="Games and Recreation"
                aspectRatio="aspect-video"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Games & Recreation</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Beyond the water and slopes, we offer plenty of entertainment options. Board games, volleyball, ping pong, and more to keep the fun going.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Indoor and outdoor games</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Beach volleyball court</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Table tennis and board games</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">✓</span>
                  <span>Evening entertainment and events</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-accent-hover text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience The Spot?</h2>
          <p className="text-xl mb-8 text-white/90">Book your stay and discover your paradise at Heiwa House</p>
          <Link
            href="/rooms"
            className="inline-block px-8 py-4 bg-white text-accent font-bold rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            Explore Rooms
          </Link>
        </div>
      </section>
    </div>
  )
}