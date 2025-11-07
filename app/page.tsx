import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Bed, Waves, Zap, Wind, Dumbbell, Users } from 'lucide-react'
import { FeatureCard } from '@/components/ui/feature-card'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { HostSection } from '@/components/ui/host-section'
import { ActivitiesCarousel } from '@/components/ui/activity-card'
import { AnimatedHeroHeading } from '@/components/ui/animated-hero-heading'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { GoogleRatingSummary } from '@/components/ui/google-reviews'
import { YouTubeVideo } from '@/components/ui/youtube-video'
import { ActivityCardEnhanced } from '@/components/ui/activity-card-enhanced'

export const metadata: Metadata = {
  title: 'Heiwa House - Surf Camp & Rooms in Santa Cruz, Portugal',
  description: 'Experience the ultimate surf and lifestyle destination in Santa Cruz, Portugal. Private rooms, surf camps, yoga, skateboarding, and unforgettable adventures.',
}

export default function HomePage() {
  // Sample data for surf weeks
  const surfWeeks = [
    { id: '1', dates: '01 Feb. - 12 Feb.', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
    { id: '2', dates: '01 May - 12 May', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
    { id: '3', dates: '01 May - 12 May', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
  ]

  // Sample data for reviews
  const reviews = [
    { id: '1', name: 'Jesús MR', rating: 5, text: 'Amazing experience at Heiwa House! The surf lessons were incredible and the yoga sessions were perfect for recovery.', timeAgo: '6 days ago', verified: true },
    { id: '2', name: 'Ernesto Guevara', rating: 5, text: 'Best surf camp I\'ve ever been to. The instructors are professional and the atmosphere is amazing.', timeAgo: '1 week ago', verified: true },
    { id: '3', name: 'John Z', rating: 5, text: 'Heiwa House exceeded all my expectations. The facilities are top-notch and the food is delicious.', timeAgo: '2 weeks ago', verified: true },
    { id: '4', name: 'Paul Egan', rating: 5, text: 'Perfect place to learn surfing and meet like-minded people. Highly recommended!', timeAgo: '3 weeks ago', verified: true },
  ]


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
        <div className="absolute inset-0 bg-black/30" />

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <AnimatedHeroHeading
              text="Welcome to Heiwa House"
              className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg"
            />
            <p className="text-xl md:text-2xl text-white/90 mb-6 drop-shadow-md">
              Your surf and lifestyle destination in Santa Cruz, Portugal
            </p>
            
              {/* Google Reviews */}
              <div className="flex justify-center mb-6">
                <GoogleRatingSummary className="text-white/90" />
              </div>
            
            <Link
              href="/surf-weeks"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white"
              style={{ backgroundColor: '#ec681c' }}
            >
              <Bed className="w-5 h-5" />
              Explore surf weeks
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </section>

      {/* Heiwa Surf Weeks Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Heiwa Surf Weeks
            </h2>
            <p className="text-lg text-gray-600">
              Experience the ultimate surf camp with professional instructors, yoga, amazing food, day trips, and unforgettable memories
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* YouTube Video */}
            <YouTubeVideo 
              videoId="9nhQi o sHf"
              title="Heiwa Surf Weeks Video"
            />

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

          {/* Booking Table */}
          <div className="mt-16">
            <div className="w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Upcoming Surf Weeks
              </h3>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {surfWeeks.map((surfWeek) => (
                    <div key={surfWeek.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        <div className="text-gray-900 font-medium">{surfWeek.dates}</div>
                        <div className="text-gray-900 font-medium">{surfWeek.price}</div>
                        <div className="text-gray-600">{surfWeek.availableSpots}</div>
                        <div className="flex justify-end">
                          <Link
                            href="/surf-weeks"
                            className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
                            style={{ backgroundColor: '#ec681c' }}
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show All Button */}
              <div className="mt-6 text-center">
                <Link
                  href="/surf-weeks"
                  className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                  style={{ backgroundColor: '#ec681c' }}
                >
                  Show All Surf Weeks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Are About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            What we are about
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ActivityCardEnhanced
              title="Surf Lessons"
              description="World-class surf instruction with professional coaches"
              image="/optimized/activities_001_surf-lessons.webp"
              href="/activities/surf"
              index={0}
            />
            <ActivityCardEnhanced
              title="Skateboarding"
              description="Professional ramps and obstacles for all levels"
              image="/optimized/activities_011_skatepark.webp"
              href="/activities/skateboarding"
              index={1}
            />
            <ActivityCardEnhanced
              title="Yoga & Wellness"
              description="Find your zen in our yoga dome with daily sessions"
              image="/optimized/activities_019_yoga_dome1.webp"
              href="/activities/yoga"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Our Rooms Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Rooms
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-80">
                <ImageCarousel
                  images={[
                    '/images/rooms/room1.jpg',
                    '/images/Freedomroutes-rooms-1.jpg',
                    '/images/DSC03479.jpg',
                  ]}
                  alt="Private rooms at Heiwa House"
                  className="h-80"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Private Rooms</h3>
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  Step into the charm of our beautifully designed rooms, blending modern comfort with traditional Portuguese aesthetics. Perfect for couples or solo travelers seeking peace and style.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-80">
                <ImageCarousel
                  images={[
                    '/images/rooms/dorm.webp',
                    '/images/Freedomroutes-rooms-50.jpg',
                    '/images/DSC03491.jpg',
                  ]}
                  alt="Shared rooms at Heiwa House"
                  className="h-80"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Shared Rooms</h3>
                <p className="text-gray-600 leading-relaxed line-clamp-3">
                  Join our vibrant community in spacious shared accommodations. Meet fellow travelers, share stories, and make lifelong friendships in our comfortable dorm-style rooms.
                </p>
              </div>
            </div>
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

      {/* What Our Customers Say Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            What Our Customers Say
          </h2>
          
          {/* Google Reviews Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#ec681c' }}>
                G
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">4.7</span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(16,940)</span>
                </div>
              </div>
            </div>
            <Link
              href="https://www.google.com/search?q=Heiwa+House+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 btn-accent"
            >
              Review us on Google
            </Link>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: '#ec681c' }}>
                      G
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#ec681c' }}>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">{review.timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  {review.text}
                </p>

                {/* Read More Link */}
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Read more
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amazing Facilities Section */}
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

          {/* Facilities Carousel - showing 2 at a time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skatepark */}
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

            {/* Yoga Dome */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg group">
              <Image
                src="/images/yoga_dome1.jpg"
                alt="Yoga Dome"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Yoga Dome</h3>
                  <p className="text-white/90">Perfect space for yoga and meditation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Activities Around Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Activities Around
          </h2>

          <ActivitiesCarousel
            activities={[
              {
                id: '1',
                title: 'Surfing',
                image: '/images/surf4.jpg',
              },
              {
                id: '2',
                title: 'Skateboarding',
                image: '/images/ramp3.jpg',
              },
              {
                id: '3',
                title: 'Yoga & Flow',
                image: '/images/yoga_dome3.jpg',
              },
              {
                id: '4',
                title: 'Swimming Pool',
                image: '/images/pool333.jpg',
              },
              {
                id: '5',
                title: 'Adventure Park',
                image: '/images/park333.jpg',
              },
              {
                id: '6',
                title: 'Games & Fun',
                image: '/images/games.jpg',
              },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
