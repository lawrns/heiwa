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
            src="/images/hero/DSF8619-1.jpg"
            alt="Heiwa House - Surf and Stay"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-sm md:text-base uppercase tracking-wider mb-4 opacity-90">
            A Wave Away
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 max-w-4xl mx-auto leading-tight">
            Nestled on Portugal's coast, Heiwa House is your sanctuary for rest and adventure.
          </h1>
          <button className="btn-primary text-lg px-8 py-4">
            Explore
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-section-y bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div>
              <p className="text-sm uppercase tracking-wider text-text-muted mb-4">
                About Heiwa House
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">
                Where Adventure Meets Tranquility
              </h2>
              
              <div className="space-y-4 text-text-muted">
                <p>
                  Surf the waves, flow through yoga, and skate with freedom. Heiwa House is your sanctuary for connection, play, and self-discovery. Here, every experience is designed to help you embrace balance, fun, and the beauty of living in the moment.
                </p>
                <p>
                  You can book a room and enjoy everything the space has to offer.
                </p>
                <p>
                  To join a group of like-minded people and have an all-inclusive experience, sign up for any of our dedicated surf weeks.
                </p>
                <p>
                  We also offer the option to rent the space for your event.
                </p>
              </div>
            </div>

            {/* Right: Video Thumbnail */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-card group cursor-pointer">
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
        </div>
      </section>

      {/* Room Showcase Section */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-text-muted mb-4">
              Rustic charm meets Portuguese style.
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-8">
              We would be honored to host you in one of our rooms.
            </h2>
          </div>

          {/* Room Images Carousel/Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="relative aspect-[4/3] rounded-image overflow-hidden">
              <Image
                src="/images/Freedomroutes-rooms-1.jpg"
                alt="Room at Heiwa House"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-image overflow-hidden">
              <Image
                src="/images/Freedomroutes-rooms-50.jpg"
                alt="Room at Heiwa House"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-image overflow-hidden">
              <Image
                src="/images/DSC02102-scaled.jpg"
                alt="Room at Heiwa House"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="text-center">
            <Link href="/rooms" className="btn-primary inline-block">
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-section-y bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 text-center">
            Facilities
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Skatepark */}
            <div className="relative aspect-square rounded-image overflow-hidden group">
              <Image
                src="/images/skatepark-1.jpg"
                alt="Skatepark"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Skatepark</p>
              </div>
            </div>

            {/* Yoga Dome */}
            <div className="relative aspect-square rounded-image overflow-hidden group">
              <Image
                src="/images/yoga_dome1.jpg"
                alt="Yoga Dome"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Yoga Dome</p>
              </div>
            </div>

            {/* Pool */}
            <div className="relative aspect-square rounded-image overflow-hidden group">
              <Image
                src="/images/pool333.jpg"
                alt="Pool"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Pool</p>
              </div>
            </div>

            {/* Games Area */}
            <div className="relative aspect-square rounded-image overflow-hidden group">
              <Image
                src="/images/games.jpg"
                alt="Games Area"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Games</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-text-muted mb-4">
              Experiences
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text">
              What to do in and around
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Surfing */}
            <div className="relative aspect-[4/3] rounded-image overflow-hidden group">
              <Image
                src="/images/surf3.jpg"
                alt="Surfing"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Surfing</p>
              </div>
            </div>

            {/* Skateboarding */}
            <div className="relative aspect-[4/3] rounded-image overflow-hidden group">
              <Image
                src="/images/ramp3.jpg"
                alt="Skateboarding"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Skateboarding</p>
              </div>
            </div>

            {/* Yoga */}
            <div className="relative aspect-[4/3] rounded-image overflow-hidden group">
              <Image
                src="/images/yoga_dome3.jpg"
                alt="Yoga"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold">Yoga</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}