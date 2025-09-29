import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Bed } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Heiwa House - Surf Camp & Rooms in Santa Cruz, Portugal',
  description: 'Experience the ultimate surf and lifestyle destination in Santa Cruz, Portugal. Private rooms, surf camps, yoga, skateboarding, and unforgettable adventures.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Video Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/videos/location3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome to Heiwa House
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              Your surf and lifestyle destination in Santa Cruz, Portugal
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
            >
              <Bed className="w-5 h-5" />
              Explore Rooms
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            More Than Just a Surf House
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Heiwa House is the ultimate adult playground in Santa Cruz, Portugal. Whether you're here 
            to surf, relax, connect, or simply enjoy life, we've created a space where unforgettable 
            moments happen naturally. From comfortable rooms to surf camps, yoga sessions, skateboarding, 
            and amazing food—everything you need is right here.
          </p>
          <Link
            href="/the-spot"
            className="inline-block text-accent hover:text-accent-dark font-semibold transition-colors"
          >
            Learn More About The Spot →
          </Link>
        </div>
      </section>

      {/* Room Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comfortable Accommodations
            </h2>
            <p className="text-lg text-gray-600">
              From private rooms to shared dorms, find your perfect space
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Private Rooms */}
            <div className="group hover-lift bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64">
                <Image
                  src="/images/DSC03479.jpg"
                  alt="Private Rooms"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Private Rooms</h3>
                <p className="text-gray-600 mb-4">
                  Cozy private rooms with comfortable beds and traditional Portuguese charm.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-accent">80€</span>
                  <span className="text-gray-500">/ night</span>
                </div>
                <Link
                  href="/rooms"
                  className="text-accent hover:text-accent-dark font-semibold transition-colors"
                >
                  View Rooms →
                </Link>
              </div>
            </div>

            {/* Twin Rooms */}
            <div className="group hover-lift bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64">
                <Image
                  src="/images/DSC03534.jpg"
                  alt="Twin Rooms"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Twin Rooms</h3>
                <p className="text-gray-600 mb-4">
                  Perfect for friends or couples, featuring two comfortable beds.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-accent">90€</span>
                  <span className="text-gray-500">/ night</span>
                </div>
                <Link
                  href="/rooms"
                  className="text-accent hover:text-accent-dark font-semibold transition-colors"
                >
                  View Rooms →
                </Link>
              </div>
            </div>

            {/* Dorm */}
            <div className="group hover-lift bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64">
                <Image
                  src="/images/DSF8567.jpg"
                  alt="Dorm Room"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dorm Room</h3>
                <p className="text-gray-600 mb-4">
                  Budget-friendly option with a friendly, social atmosphere.
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-accent">30€</span>
                  <span className="text-gray-500">/ night</span>
                </div>
                <Link
                  href="/rooms"
                  className="text-accent hover:text-accent-dark font-semibold transition-colors"
                >
                  View Rooms →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Highlight */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Amazing Facilities
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for an unforgettable stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skatepark Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg group">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/images/videos/sk81.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Skatepark</h3>
                  <p className="text-white/90">Professional ramps and obstacles for all levels</p>
                </div>
              </div>
            </div>

            {/* Pool/Facilities */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg group">
              <Image
                src="/images/yoga_dome1.jpg"
                alt="Yoga Dome"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Yoga Dome</h3>
                  <p className="text-white/90">Perfect space for yoga and meditation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surf Camp CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join Our Surf Camp
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Experience the ultimate surf week with professional instructors, yoga, amazing food, 
            day trips, and unforgettable memories. Prices starting at 450€.
          </p>
          <Link
            href="/surf-weeks"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
          >
            Learn More About Surf Camp
          </Link>
        </div>
      </section>
    </div>
  )
}