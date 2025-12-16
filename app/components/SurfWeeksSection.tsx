'use client'

import Link from 'next/link'
import { useState } from 'react'
import { YouTubeVideo } from '@/components/ui/youtube-video'

interface SurfWeeksSectionProps {
  surfWeeksSection?: {
    videoId?: string
    video_id?: string
    title?: string
    subtitle?: string
    bullets?: string[]
  }
  surfWeeks: SurfWeek[]
}

interface SurfWeek {
  id?: string
  dates: string
  price: string
  availableSpots: string | number
}

export function SurfWeeksSection({ surfWeeksSection, surfWeeks }: SurfWeeksSectionProps) {
  const [showAllSurfWeeks, setShowAllSurfWeeks] = useState(false)

  const videoId = surfWeeksSection?.videoId || surfWeeksSection?.video_id || '9nhQiKGsgHg'
  const bullets = Array.isArray(surfWeeksSection?.bullets)
    ? surfWeeksSection?.bullets.filter(b => typeof b === 'string' && b.trim().length > 0)
    : null

  return (
    <section id="section-surf-weeks" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {surfWeeksSection?.title || 'Heiwa Surf Weeks'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {surfWeeksSection?.subtitle || 'Experience the ultimate surf camp with professional instructors, yoga, amazing food, day trips, and unforgettable memories'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto pl-8 lg:pl-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* YouTube Video */}
            <div className="w-full">
              <YouTubeVideo 
                videoId={videoId}
                title="Heiwa Surf Weeks Video"
                className="w-full"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Why Join Our Surf Camps?
              </h3>
              <ul className="space-y-4 text-gray-600">
                {(bullets && bullets.length > 0
                  ? bullets
                  : [
                      'Professional surf instruction for all levels',
                      'Daily yoga and meditation sessions',
                      'Amazing food prepared by our chef',
                      'Exciting day trips to explore Portugal',
                      'Skateboarding and other activities',
                      'Prices starting at 450€'
                    ]
                ).map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Table */}
        <div className="mt-16">
          <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Upcoming Surf Weeks
            </h3>
            
            <div className="relative">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700">
                    <div>Dates</div>
                    <div className="flex items-center gap-2">
                      Price
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>Available Spots</div>
                    <div></div>
                  </div>
                </div>

                {/* Table Body with fade effect */}
                <div className="relative" suppressHydrationWarning>
                  <div className={`divide-y divide-gray-200 ${showAllSurfWeeks ? '' : 'max-h-[600px] overflow-hidden'}`}>
                    {surfWeeks.length > 0 ? (
                      <>
                        {(showAllSurfWeeks ? surfWeeks : surfWeeks.slice(0, 4)).map((surfWeek: SurfWeek, idx: number) => (
                          <div key={surfWeek.id || idx} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                            {/* Mobile Layout */}
                            <div className="md:hidden space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-gray-900 font-medium text-base mb-1">{surfWeek.dates}</div>
                                  <div className="text-sm text-gray-600">{surfWeek.availableSpots} spots available</div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-gray-900 font-semibold text-lg">{surfWeek.price}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (surfWeek.id) {
                                    window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: surfWeek.id }))
                                  } else {
                                    window.dispatchEvent(new CustomEvent('openBooking'))
                                  }
                                }}
                                className="w-full px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 min-h-[44px]"
                              >
                                Book Now
                              </button>
                            </div>
                            
                            {/* Desktop Layout */}
                            <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                              <div className="text-gray-900 font-medium">{surfWeek.dates}</div>
                              <div className="text-gray-900 font-medium">{surfWeek.price}</div>
                              <div className="text-gray-600">{surfWeek.availableSpots}</div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    if (surfWeek.id) {
                                      window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: surfWeek.id }))
                                    } else {
                                      window.dispatchEvent(new CustomEvent('openBooking'))
                                    }
                                  }}
                                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 min-h-[44px]"
                                >
                                  Book
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 sm:px-6 py-8 text-center text-gray-600">
                        <p className="text-lg font-medium text-gray-700 mb-2">No upcoming surf weeks at this time</p>
                        <p className="text-sm text-gray-500">Check back soon for new dates!</p>
                      </div>
                    )}
                  </div>
                  {/* Fade gradient overlay at bottom - only show when not expanded and more than 4 items */}
                  {!showAllSurfWeeks && surfWeeks.length > 4 && (
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none z-10 rounded-b-lg"></div>
                  )}
                </div>
              </div>
              
              {/* Show More / Show Less Button */}
              {surfWeeks.length > 4 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAllSurfWeeks(!showAllSurfWeeks)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-accent text-accent hover:bg-accent hover:text-white font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    style={{ borderColor: '#ec681c', color: '#ec681c' }}
                  >
                    {showAllSurfWeeks ? 'Show Less' : `Show More (${surfWeeks.length - 4} more)`}
                    <svg 
                      className={`w-5 h-5 transition-transform ${showAllSurfWeeks ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Link to Surf Weeks Page */}
              {surfWeeks.length > 0 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/surf-weeks"
                    className="text-sm text-gray-600 hover:text-accent transition-colors"
                    style={{ color: '#ec681c' }}
                  >
                    View all surf weeks →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

