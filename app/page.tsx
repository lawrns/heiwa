import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Heiwa House – Surf, Stay, and Play by the Ocean',
  description: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure. Experience world-class surfing, yoga, and coastal living.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/DSC08600-scaled.jpg"
            alt="Heiwa House - Surf and Stay"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.2em] mb-6 opacity-90">
            A Wave Away
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 leading-tight">
            Nestled on Portugal's coast, Heiwa House is your sanctuary for rest and adventure.
          </h1>
          <button className="btn-primary">
            Explore
          </button>
        </div>
      </section>

      {/* About Section - Simple and Clean */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6">
              ABOUT HEIWA HOUSE
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Where Adventure Meets Tranquility
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-center mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Surf the waves, flow through yoga, and skate with freedom. Heiwa House is your sanctuary for connection, play, and self-discovery. Here, every experience is designed to help you embrace balance, fun, and the beauty of living in the moment.
            </p>
            
            <div className="space-y-4 text-base text-gray-600">
              <p>You can book a room and enjoy everything the space has to offer.</p>
              <p>To join a group of like-minded people and have an all-inclusive experience, sign up for any of our dedicated surf weeks.</p>
              <p>We also offer the option to rent the space for your event.</p>
            </div>
          </div>

          {/* Video */}
          <div className="mt-16 relative aspect-video rounded-lg overflow-hidden shadow-lg group cursor-pointer">
            <Image
              src="/images/surf-weeks-front-page.jpg"
              alt="Heiwa House Video"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <a
                href="https://youtu.be/9nhQiKGsgHg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 text-accent ml-1" fill="currentColor" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Room Showcase Section - Minimal */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6">
              RUSTIC CHARM MEETS PORTUGUESE STYLE
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              We would be honored to host you in one of our rooms.
            </h2>
          </div>

          {/* Simple Image Grid */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/images/Freedomroutes-rooms-1.jpg"
                alt="Room"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/images/Freedomroutes-rooms-50.jpg"
                alt="Room"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/images/DSC02102-scaled.jpg"
                alt="Room"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Facilities - Minimal */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              FACILITIES
            </p>
          </div>

          {/* Simple Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="relative aspect-square overflow-hidden rounded-lg group">
              <Image
                src="/images/skatepark-1.jpg"
                alt="Skatepark"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group">
              <Image
                src="/images/yoga_dome1.jpg"
                alt="Yoga Dome"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group">
              <Image
                src="/images/pool333.jpg"
                alt="Pool"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg group">
              <Image
                src="/images/games.jpg"
                alt="Games"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Experiences - Minimal */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6">
              EXPERIENCES
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What to do in and around
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg group">
              <Image
                src="/images/surf3.jpg"
                alt="Surfing"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg group">
              <Image
                src="/images/ramp3.jpg"
                alt="Skateboarding"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg group">
              <Image
                src="/images/yoga_dome3.jpg"
                alt="Yoga"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}