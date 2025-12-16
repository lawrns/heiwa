import Link from 'next/link'
import { Bed, Waves } from 'lucide-react'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { HostSection } from '@/components/ui/host-section'
import { GoogleReviews, GoogleRatingSummary } from '@/components/ui/google-reviews'
import { AnimatedHeroHeading } from '@/components/ui/animated-hero-heading'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { YouTubeVideo } from '@/components/ui/youtube-video'
import { SurfWeeksTable } from '@/components/ui/surf-weeks-table'
import { supabaseAdmin } from '@/lib/supabase'

// Revalidate every 60 seconds to pick up CMS changes quickly
export const revalidate = 60

// Server Component - fetches data at build/request time
export default async function HomePage() {
  // Fetch homepage content from unified page_sections table
  let pageSections: any[] = []
  try {
    const { data, error } = await supabaseAdmin
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'home')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (!error && data) {
      pageSections = data
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
  }

  // Fetch surf weeks (server-side)
  let surfWeeks: any[] = []
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: surfCampsData, error: surfCampsError } = await supabaseAdmin
      .from('surf_camps')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', today.toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(3)

    if (!surfCampsError && surfCampsData) {
      surfWeeks = surfCampsData.map((week: any) => {
        const startDate = new Date(week.start_date)
        const endDate = new Date(week.end_date)
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
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
    }
  } catch (error) {
    console.error('Error fetching surf weeks:', error)
  }

  // Extract CMS content from page_sections
  const getSection = (sectionType: string) => {
    const section = pageSections?.find((s: any) => s.section_type === sectionType)
    return section ? { id: section.id, content: section.content || {} } : null
  }

  const heroSection = getSection('hero')
  const surfWeeksSection = getSection('surf-weeks')
  const aboutSection = getSection('about')
  const roomsSection = getSection('rooms')
  const hostsSection = getSection('hosts')
  const reviewsSection = getSection('reviews')
  const facilitiesSection = getSection('facilities')

  // Extract content
  const heroContent = heroSection?.content || {}
  const surfWeeksContent = surfWeeksSection?.content || {}
  const aboutContent = aboutSection?.content || {}
  const roomsContent = roomsSection?.content || {}
  const hostsContent = hostsSection?.content || {}
  const reviewsContent = reviewsSection?.content || {}
  const facilitiesContent = facilitiesSection?.content || {}

  // Hero section values
  const defaultVideoUrl = "https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/cms-media/videos/1763932934179_Timeline-1.mp4"
  const heroTitle = (heroContent.title as string) || 'Welcome to Heiwa House'
  const rawSubtitle = (heroContent.subtitle as string) || ''
  const heroSubtitle = rawSubtitle && rawSubtitle.trim().length > 0 && !rawSubtitle.toLowerCase().includes('edjizz')
    ? rawSubtitle
    : 'Your surf and lifestyle destination in Santa Cruz, Portugal'
  const heroDescription = (heroContent.description as string) || ''
  const heroVideoUrl = (heroContent.video_url as string) || (heroContent.videoUrl as string)
  const heroImageUrl = (heroContent.image_url as string) || (heroContent.imageUrl as string)
  const primaryLinkUrl = (heroContent.primary_link_url as string) || '/surf-weeks'
  const primaryLinkText = (heroContent.primary_link_text as string) || 'Come for a Surf Camp'
  const secondaryLinkUrl = (heroContent.secondary_link_url as string) || '/rooms'
  const secondaryLinkText = (heroContent.secondary_link_text as string) || 'Rent a Room'

  // Surf weeks section values
  const surfWeeksTitle = (surfWeeksContent.title as string) || 'Heiwa Surf Weeks'
  const surfWeeksSubtitle = (surfWeeksContent.subtitle as string) || 'All-inclusive weeks with surf, yoga, great food, and coastal adventures.'
  const surfWeeksBullets = Array.isArray(surfWeeksContent.bullets)
    ? (surfWeeksContent.bullets as string[]).filter(b => typeof b === 'string' && b.trim().length > 0)
    : []
  const surfWeeksVideoId = (surfWeeksContent.videoId as string) || (surfWeeksContent.video_id as string) || '9nhQiKGsgHg'
  const defaultBullets = [
    'Professional surf instruction for all levels',
    'Daily yoga and meditation sessions',
    'Amazing food prepared by our chef',
    'Exciting day trips to explore Portugal',
    'Skateboarding and other activities',
    'Prices starting at 450€'
  ]
  const displayBullets = surfWeeksBullets.length > 0 ? surfWeeksBullets : defaultBullets

  // Homepage curated rooms
  const roomIds: string[] = Array.isArray(roomsContent?.roomIds)
    ? (roomsContent.roomIds as string[]).filter((id: unknown) => typeof id === 'string')
    : []

  let featuredRooms: any[] = []
  if (roomIds.length > 0) {
    try {
      const { data: roomsData, error: roomsError } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .in('id', roomIds)
        .eq('is_active', true)

      if (!roomsError && roomsData) {
        const byId = new Map(roomsData.map((r: any) => [r.id, r]))
        featuredRooms = roomIds.map((id) => byId.get(id)).filter(Boolean)
      }
    } catch (error) {
      console.error('Error fetching featured rooms:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Video Hero Section */}
      <section id="section-hero" className="relative h-screen w-full overflow-hidden">
        {/* Background Video or Image */}
        {heroVideoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={heroImageUrl || '/images/hero/heiwa-hero.jpg'}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        ) : heroImageUrl ? (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/images/hero/heiwa-hero.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={defaultVideoUrl} type="video/mp4" />
          </video>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <AnimatedHeroHeading
              text={heroTitle}
              className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg"
              style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
            />

            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              {heroSubtitle}
            </p>

            {heroDescription && (
              <p className="text-lg md:text-xl text-white/80 mb-8 drop-shadow-md max-w-2xl mx-auto">
                {heroDescription}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href={primaryLinkUrl}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] text-white"
                style={{ backgroundColor: '#ec681c' }}
              >
                <Waves className="w-5 h-5" />
                {primaryLinkText}
              </Link>
              <Link
                href={secondaryLinkUrl}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] text-white border-2 border-white hover:bg-white/10"
              >
                <Bed className="w-5 h-5" />
                {secondaryLinkText}
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

      {/* Heiwa Surf Weeks Section */}
      <section id="section-surf-weeks" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{surfWeeksTitle}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{surfWeeksSubtitle}</p>
          </div>

          <div className="max-w-6xl mx-auto pl-8 lg:pl-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* YouTube Video */}
              <div className="w-full">
                <YouTubeVideo
                  videoId={surfWeeksVideoId}
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
                  {displayBullets.map((text, idx) => (
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
              <SurfWeeksTable surfWeeks={surfWeeks} />
            </div>
          </div>
        </div>
      </section>

      {/* What We Are About Section */}
      <section id="section-about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {(aboutContent?.title as string) || 'What we are about'}
          </h2>
          {aboutContent?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {aboutContent.subtitle as string}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {((aboutContent?.cards as any[]) || [
              { title: 'Play', description: 'Explore activities and experiences around our location', image: '/images/skatepark-1.jpg', link: '/play' },
              { title: 'Surf', description: 'Discover the best surfing spots and conditions', image: '/images/surf4.jpg', link: '/surf' },
              { title: 'Flow', description: 'Wellness, yoga, and mindfulness experiences', image: '/images/yoga_dome1.jpg', link: '/flow' }
            ]).map((card: any, idx: number) => {
              const imageUrl = card.image?.startsWith('http')
                ? card.image
                : card.image?.startsWith('/images/')
                  ? card.image
                  : '/images/placeholder.webp'

              return (
                <Link key={idx} href={card.link || '#'} className="group">
                  <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-80 bg-gray-200">
                    <img src={imageUrl} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="absolute inset-0 flex items-end">
                      <div className="w-full p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                        <p className="text-white/90 text-sm">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Rooms Section */}
      <section id="section-rooms" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {(roomsContent?.title as string) || 'Our Rooms'}
          </h2>
          {roomsContent?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {roomsContent.subtitle as string}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {(featuredRooms.length > 0
              ? featuredRooms
              : [
                  {
                    title: 'Private Rooms',
                    description: 'Step into the charm of our beautifully designed rooms, blending modern comfort with traditional Portuguese aesthetics. Perfect for couples or solo travelers seeking peace and style.',
                    images: ['/images/rooms/room1.jpg', '/images/rooms/room2.webp', '/images/rooms/room3.webp'],
                    link: '/rooms/private'
                  },
                  {
                    title: 'Shared Rooms',
                    description: 'Join our vibrant community in spacious shared accommodations. Meet fellow travelers, share stories, and make lifelong friendships in our comfortable dorm-style rooms.',
                    images: ['/images/rooms/dorm.webp', '/images/Freedomroutes-rooms-50.jpg', '/images/rooms/room1.jpg'],
                    link: '/rooms/shared'
                  }
                ]
            ).map((room: any, idx: number) => {
              const title = room.name || room.title || ''
              const description = room.description || ''
              const images = Array.isArray(room.images) && room.images.length > 0
                ? room.images
                : room.image_url
                  ? [room.image_url]
                  : []
              const finalImages = images.length > 0
                ? images
                : idx === 0
                  ? ['/images/rooms/room1.jpg', '/images/rooms/room2.webp', '/images/rooms/room3.webp']
                  : ['/images/rooms/dorm.webp', '/images/Freedomroutes-rooms-50.jpg', '/images/rooms/room1.jpg']
              const link = room.id ? `/rooms/${room.id}` : (room.link || '/rooms')

              return (
                <Link key={room.id || idx} href={link} className="group">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative w-full h-80">
                      <ImageCarousel images={finalImages} alt={title} className="h-80" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-3">{description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
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
      {hostsContent && ((hostsContent.paragraphs as string[])?.length > 0 || hostsContent.imageUrl) ? (
        <section id="section-hosts" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center italic">
              {(hostsContent.title as string) || 'Your Hosts'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              {/* Polaroid-style Image */}
              {hostsContent.imageUrl && (
                <div className="lg:col-span-1 flex justify-center">
                  <div className="relative">
                    <div className="bg-white p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="bg-gray-100 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={hostsContent.imageUrl as string}
                          alt="Heiwa House Hosts"
                          width={300}
                          height={400}
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="h-8 bg-white"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div className={hostsContent.imageUrl ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
                <div className="prose prose-lg max-w-none">
                  {Array.isArray(hostsContent.paragraphs) && (hostsContent.paragraphs as string[]).map((para: string, idx: number) => (
                    <p key={idx} className="text-gray-700 leading-relaxed">{para}</p>
                  ))}
                </div>

                {/* Signature */}
                {hostsContent.signature && (
                  <div className="pt-6">
                    <p className="text-2xl font-handwriting text-gray-800 italic">
                      {hostsContent.signature as string}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div id="section-hosts">
          <HostSection />
        </div>
      )}

      {/* What Our Customers Say Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {(reviewsContent?.title as string) || 'What Our Customers Say'}
          </h2>
          {reviewsContent?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {reviewsContent.subtitle as string}
            </p>
          )}

          <GoogleReviews showReviews={true} maxReviews={4} />
        </div>
      </section>

      {/* Activities Around Section */}
      <section id="section-facilities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {(facilitiesContent?.title as string) || 'Activities Around'}
          </h2>
          {facilitiesContent?.subtitle && (
            <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              {facilitiesContent.subtitle as string}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const cmsActivities = (facilitiesContent?.facilities as any[]) || (facilitiesContent?.items as any[])
              const activities = (Array.isArray(cmsActivities) && cmsActivities.length > 0)
                ? cmsActivities.map((activity: any) => ({
                    title: activity.title || activity.name || '',
                    desc: activity.description || activity.desc || '',
                    img: activity.image || activity.imageUrl || activity.img || '/images/placeholder.webp'
                  }))
                : [
                    { title: 'Surf Lessons', desc: 'Learn to ride the waves with professional instructors', img: '/optimized/photography_001_dji_0098-scaled.webp' },
                    { title: 'Go Karts', desc: 'Feel the adrenaline rush on our local tracks', img: '/optimized/photography_002_dsc01794.webp' },
                    { title: 'Horseback Riding', desc: 'Explore the countryside on horseback', img: '/optimized/photography_003_dsc01829-enhanced-nr-2.webp' },
                    { title: 'Plane Flight', desc: 'Experience breathtaking aerial views', img: '/optimized/photography_004_dsc02099-scaled.webp' },
                    { title: 'Wineyard Tour', desc: 'Taste local wines and learn about Portuguese vineyards', img: '/optimized/photography_005_dsc02102-scaled.webp' },
                    { title: 'Hiking', desc: 'Discover scenic trails and natural beauty', img: '/optimized/photography_006_dsc02767-scaled.webp' },
                    { title: 'Paragliding', desc: 'Soar above the landscape with stunning views', img: '/optimized/photography_007_dsc03081-enhanced-nr-scaled.webp' },
                    { title: 'Bicycle Riding', desc: 'Pedal through coastal paths and hidden gems', img: '/optimized/photography_008_dsc03427-enhanced-nr-scaled.webp' },
                  ]
              return activities
            })().map((activity: { title: string; desc: string; img: string }) => (
              <div key={activity.title} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-default">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  <img src={activity.img} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
