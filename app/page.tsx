'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bed, Waves, Zap, Wind, Dumbbell, Users } from 'lucide-react'
import { FeatureCard } from '@/components/ui/feature-card'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { HostSection } from '@/components/ui/host-section'
import { ActivitiesCarousel } from '@/components/ui/activity-card'
import { AnimatedHeroHeading } from '@/components/ui/animated-hero-heading'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { GoogleRatingSummary, GoogleReviews } from '@/components/ui/google-reviews'
import { YouTubeVideo } from '@/components/ui/youtube-video'
import { ActivityCardEnhanced } from '@/components/ui/activity-card-enhanced'
import { DynamicActivities } from '@/components/ui/dynamic-activities'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [homepageContent, setHomepageContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [surfWeeks, setSurfWeeks] = useState<any[]>([])

  // Reviews will be fetched from Google Reviews API via GoogleReviews component

  // Fetch homepage content from CMS
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/admin/homepage?t=' + Date.now(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const result = await response.json()
        if (result.success && result.data && result.data.length > 0) {
          console.log('✅ CMS content loaded:', result.data.length, 'sections')
          // Update cards in about section if they have old "Heiwa" prefix
          const updatedData = result.data.map((section: any) => {
            if (section.section === 'about' && section.cards) {
              const updatedCards = section.cards.map((card: any) => {
                const cleanTitle = card.title?.replace(/^Heiwa /, '') || card.title
                return {
                  ...card,
                  title: cleanTitle,
                  // Update images to use better ones based on cleaned title
                  image: cleanTitle === 'Play' ? '/images/skatepark-1.jpg' :
                         cleanTitle === 'Surf' ? '/images/surf4.jpg' :
                         cleanTitle === 'Flow' ? '/images/yoga_dome1.jpg' : card.image
                }
              })
              return { ...section, cards: updatedCards }
            }
            return section
          })
          setHomepageContent(updatedData)
        } else {
          console.log('⚠️ No CMS content, using defaults')
        }
      } catch (error) {
        console.error('❌ Error fetching homepage content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Extract CMS content or use defaults
  const heroSection = homepageContent?.find((s: any) => s.section === 'hero')
  const surfWeeksSection = homepageContent?.find((s: any) => s.section === 'surf-weeks')
  const aboutSection = homepageContent?.find((s: any) => s.section === 'about')
  const roomsSection = homepageContent?.find((s: any) => s.section === 'rooms')
  const hostsSection = homepageContent?.find((s: any) => s.section === 'hosts')
  const reviewsSection = homepageContent?.find((s: any) => s.section === 'reviews')
  const facilitiesSection = homepageContent?.find((s: any) => s.section === 'facilities')

  // Fetch real surf weeks from API
  useEffect(() => {
    const fetchSurfWeeks = async () => {
      try {
        const response = await fetch('/api/surf-camps?is_active=true&limit=3')
        const result = await response.json()
        if (result.success && result.data && Array.isArray(result.data)) {
          // Format the data to match the expected structure
          const formattedWeeks = result.data.map((week: any) => {
            const startDate = new Date(week.start_date)
            const endDate = new Date(week.end_date)
            const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
            const dates = `${startDate.toLocaleDateString('en-US', dateOptions)} - ${endDate.toLocaleDateString('en-US', dateOptions)}`
            
            const totalSpots = week.total_spots || week.max_participants || 18
            const availableSpots = week.available_spots !== undefined ? week.available_spots : totalSpots
            
            return {
              id: week.id,
              dates: dates,
              price: `From €${week.price}`,
              availableSpots: `${availableSpots}/${totalSpots}`,
              totalSpots: totalSpots,
              start_date: week.start_date,
              end_date: week.end_date
            }
          })
          setSurfWeeks(formattedWeeks)
        }
      } catch (error) {
        console.error('Error fetching surf weeks:', error)
      }
    }

    fetchSurfWeeks()
  }, [])
  
  const heroTitle = heroSection?.title || 'Welcome to Heiwa House'
  const heroSubtitle = heroSection?.subtitle || 'Your surf and lifestyle destination in Santa Cruz, Portugal'


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
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/videos/Timeline-1.mp4" type="video/mp4" />
          <source src="/images/videos/Timeline-1.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <AnimatedHeroHeading
              text={heroTitle}
              className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg" style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
            />
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              {heroSubtitle}
            </p>
            
            {/* Two Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/surf-weeks"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white"
                style={{ backgroundColor: '#ec681c' }}
              >
                <Waves className="w-5 h-5" />
                Come for a Surf Camp
              </Link>
              <Link
                href="/rooms"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white border-2 border-white hover:bg-white/10"
              >
                <Bed className="w-5 h-5" />
                Rent a Room
              </Link>
            </div>
            
            {/* Google Reviews */}
            <div className="flex justify-center">
              <GoogleRatingSummary className="text-white/90" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </section>

      {/* Heiwa Surf Weeks Section - Using CMS Data */}
      <section className="py-20 bg-gray-50">
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
                  videoId={surfWeeksSection?.videoId || '9nhQiKGsgHg'}
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
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>Professional surf instruction for all levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>Daily yoga and meditation sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>Amazing food prepared by our chef</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>Exciting day trips to explore Portugal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>Skateboarding and other activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>Prices starting at 450€</span>
                  </li>
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
                  <div className="divide-y divide-gray-200 relative">
                    {surfWeeks.length > 0 ? (
                      <>
                        {surfWeeks.map((surfWeek: any, idx: number) => (
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
                          style={{ backgroundColor: '#ec681c' }}
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
                            style={{ backgroundColor: '#ec681c' }}
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                        ))}
                        {/* Fade gradient overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                      </>
                    ) : (
                      <div className="px-4 sm:px-6 py-8 text-center text-gray-600">
                        Loading surf weeks...
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Find More Button */}
                {surfWeeks.length > 0 && (
                  <div className="mt-6 text-center">
                    <Link
                      href="/surf-weeks"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-accent text-accent hover:bg-accent hover:text-white font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      style={{ borderColor: '#ec681c', color: '#ec681c' }}
                    >
                      Find More Surf Weeks
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Are About Section - Using CMS Data */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {aboutSection?.title || 'What we are about'}
          </h2>
          {aboutSection?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {aboutSection.subtitle}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Cards - Using CMS Data */}
            {(aboutSection?.cards || [
              { title: 'Play', description: 'Explore activities and experiences around our location', image: '/images/skatepark-1.jpg', link: '/play' },
              { title: 'Surf', description: 'Discover the best surfing spots and conditions', image: '/images/surf4.jpg', link: '/surf' },
              { title: 'Flow', description: 'Wellness, yoga, and mindfulness experiences', image: '/images/yoga_dome1.jpg', link: '/flow' }
            ]).map((card: any, idx: number) => (
              <Link key={idx} href={card.link || '#'} className="group">
                <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-80 bg-gray-200">
                  <img src={card.image || '/images/placeholder.webp'} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                      <p className="text-white/90 text-sm">{card.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Rooms Section - Using CMS Data */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {roomsSection?.title || 'Our Rooms'}
          </h2>
          {roomsSection?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {roomsSection.subtitle}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Rooms Cards - Using CMS Data */}
            {(roomsSection?.cards || [
              { title: 'Private Rooms', description: 'Step into the charm of our beautifully designed rooms, blending modern comfort with traditional Portuguese aesthetics. Perfect for couples or solo travelers seeking peace and style.', images: ['/images/rooms/room1.jpg', '/images/Freedomroutes-rooms-1.jpg', '/images/DSC03479.jpg'], link: '/rooms/private' },
              { title: 'Shared Rooms', description: 'Join our vibrant community in spacious shared accommodations. Meet fellow travelers, share stories, and make lifelong friendships in our comfortable dorm-style rooms.', images: ['/images/rooms/dorm.webp', '/images/Freedomroutes-rooms-50.jpg', '/images/DSC03491.jpg'], link: '/rooms/shared' }
            ]).map((room: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-80">
                  <ImageCarousel
                    images={room.images || ['/images/placeholder.webp']}
                    alt={room.title}
                    className="h-80"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{room.title}</h3>
                  <p className="text-gray-600 leading-relaxed line-clamp-3">
                    {room.description}
                  </p>
                </div>
              </div>
            ))}
          </div>


          <div className="text-center">
            <Link
              href="/rooms"
              className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white"
              style={{ backgroundColor: '#ec681c' }}
            >
              Explore All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Your Hosts Section */}
      <HostSection />

      {/* What Our Customers Say Section - Using CMS Data */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {reviewsSection?.title || 'What Our Customers Say'}
          </h2>
          {reviewsSection?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {reviewsSection.subtitle}
            </p>
          )}
          
          {/* Google Reviews Component - Fetches real reviews from API */}
          <GoogleReviews showReviews={true} maxReviews={4} />
        </div>
      </section>

      {/* Activities Around Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Activities Around
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Surf Lessons', desc: 'Learn to ride the waves with professional instructors', img: '/optimized/photography_001_dji_0098-scaled.webp' },
              { title: 'Go Karts', desc: 'Feel the adrenaline rush on our local tracks', img: '/optimized/photography_002_dsc01794.webp' },
              { title: 'Horseback Riding', desc: 'Explore the countryside on horseback', img: '/optimized/photography_003_dsc01829-enhanced-nr-2.webp' },
              { title: 'Plane Flight', desc: 'Experience breathtaking aerial views', img: '/optimized/photography_004_dsc02099-scaled.webp' },
              { title: 'Wineyard Tour', desc: 'Taste local wines and learn about Portuguese vineyards', img: '/optimized/photography_005_dsc02102-scaled.webp' },
              { title: 'Hiking', desc: 'Discover scenic trails and natural beauty', img: '/optimized/photography_006_dsc02767-scaled.webp' },
              { title: 'Paragliding', desc: 'Soar above the landscape with stunning views', img: '/optimized/photography_007_dsc03081-enhanced-nr-scaled.webp' },
              { title: 'Bicycle Riding', desc: 'Pedal through coastal paths and hidden gems', img: '/optimized/photography_008_dsc03427-enhanced-nr-scaled.webp' },
            ].map((activity) => (
              <div key={activity.title} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-default">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  <img src={activity.img} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors"></div>
                  
                  {/* Title - always visible */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold text-white">{activity.title}</h3>
                  </div>
                  
                  {/* Description - appears on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-center text-sm px-4 font-medium">{activity.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
