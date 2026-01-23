"use client"

import Image from 'next/image'
import { MapPin, Waves } from 'lucide-react'

interface SurfMapProps {
  className?: string
}

export function SurfMap({ className = "" }: SurfMapProps) {
  // Surf spots in Ericeira and Peniche region
  const surfSpots = [
    { name: "Ericeira", description: "World Surfing Reserve with 7 quality breaks", lat: 38.96, lng: -9.42 },
    { name: "Peniche", description: "Consistent waves, home to Supertubos", lat: 39.36, lng: -9.38 },
    { name: "Santa Cruz", description: "Beautiful beach break for all levels", lat: 39.47, lng: -9.43 },
  ]

  return (
    <section className={`py-16 bg-gradient-to-b from-blue-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-orange-500" />
            <h2 className="text-4xl font-bold text-gray-900">Our Surfing Location</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Based in the heart of Portugal's best surfing region. We have access to multiple world-class
            surf breaks within a short drive, ensuring optimal conditions regardless of swell direction.
          </p>
        </div>

        {/* Map Visual */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-orange-100">
          {/* Map Image Background */}
          <div className="relative h-[500px] w-full bg-gradient-to-br from-blue-100 via-blue-50 to-green-50">
            {/* Decorative Map Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                {/* Portugal outline approximation */}
                <path
                  d="M 150 100 Q 200 80 250 120 L 300 180 Q 350 220 400 250 L 420 300 Q 400 350 350 380 L 280 400 Q 220 380 180 340 L 140 280 Q 120 220 150 100 Z"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
                {/* Coastline approximation */}
                <path
                  d="M 180 200 Q 250 180 300 220 Q 340 260 360 320 Q 350 360 300 380"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
              </svg>
            </div>

            {/* Surf Spot Markers */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 w-full max-w-4xl px-8">
                {surfSpots.map((spot, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center animate-pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Waves className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <MapPin className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                    <h3 className="mt-3 font-bold text-gray-900">{spot.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{spot.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Distance Info */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <p className="text-sm font-semibold text-gray-900">
                <span className="text-orange-500">30-45 min</span> drive to all major breaks
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <Waves className="w-6 h-6 text-orange-500" />
              <h3 className="font-bold text-gray-900">World-Class Waves</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Ericeira is a designated World Surfing Reserve with consistent quality waves year-round
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-blue-500" />
              <h3 className="font-bold text-gray-900">Strategic Location</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Central location allows us to chase the best conditions depending on swell and wind direction
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <h3 className="font-bold text-gray-900">All Levels Welcome</h3>
            </div>
            <p className="text-gray-600 text-sm">
              From beginner beach breaks to expert reef breaks, we have spots suitable for everyone
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
