import { Metadata } from 'next'
import Image from 'next/image'
import { Play, Bed, UtensilsCrossed, Activity, MapPin, Waves, Star, Mail, Calendar, Users, CheckCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { SurfWeeksClient } from '@/components/surf-weeks/SurfWeeksClient'
import { SurfWeeksTable } from '@/components/surf-weeks/SurfWeeksTable'
import { BookNowButton } from '@/components/surf-weeks/BookNowButton'
import { GoogleReviews, GoogleRatingSummary } from '@/components/ui/google-reviews'

// Disable caching to ensure surf camp active status changes are reflected immediately
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Surf Weeks in Santa Cruz, Portugal - Learn Surfing With Heiwa',
  description: 'We strive to deliver an unforgettable surf week experience both in and out of the water. Join us for surf, yoga, amazing food, skateboarding, and more.',
}

// Fetch CMS content for surf-weeks page from unified page_sections table
async function getSurfWeeksSections() {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    const { data, error } = await supabaseAdmin
      .from('page_sections')
      .select('*')
      .eq('page_slug', 'surf-weeks')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (error || !data) {
      console.warn('CMS sections not available for surf-weeks, using defaults')
      return []
    }
    
    return data
  } catch (error) {
    console.warn('Error fetching CMS sections:', error)
    return []
  }
}

// Fetch surf weeks from database
async function getSurfWeeks() {
  try {
    // Use direct Supabase query for server-side rendering
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    // Get current date to filter out past surf weeks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Add cache-busting timestamp to ensure fresh data
    // This ensures Netlify doesn't cache stale surf camp data
    const cacheBuster = Date.now()
    
    console.log(`[Surf Weeks Page] Fetching surf camps at ${new Date().toISOString()} (cache-bust: ${cacheBuster})`)
    
    const { data: surfCamps, error: surfCampsError } = await supabaseAdmin
      .from('surf_camps')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', today.toISOString().split('T')[0])
      .order('start_date', { ascending: true })

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      return []
    }

    if (!surfCamps || surfCamps.length === 0) {
      return []
    }

    // Get enrollment counts for all surf camps in a single query (fixes N+1)
    const campIds = surfCamps.map((camp: any) => camp.id)
    
    // Single aggregated query for all enrollment counts
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('surf_camp_enrollments')
      .select('surf_camp_id, status')
      .in('surf_camp_id', campIds)
      .in('status', ['confirmed', 'pending'])
    
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError)
    }
    
    // Aggregate enrollment counts by camp_id
    const enrollmentCounts = new Map<string, number>()
    if (enrollments) {
      enrollments.forEach((enrollment: any) => {
        const count = enrollmentCounts.get(enrollment.surf_camp_id) || 0
        enrollmentCounts.set(enrollment.surf_camp_id, count + 1)
      })
    }
    
    // Map camps with availability counts
    const surfCampsWithAvailability = surfCamps.map((camp: any) => {
      const enrolledCount = enrollmentCounts.get(camp.id) || 0
      
      // Use max_participants as the primary source, fall back to total_spots for legacy data
      const totalSpots = camp.max_participants || camp.total_spots || 18
      const calculatedAvailableSpots = totalSpots - enrolledCount
      const availableSpots = Math.max(0, calculatedAvailableSpots)
      
      return {
        id: camp.id,
        name: camp.name,
        description: camp.description,
        start_date: camp.start_date,
        end_date: camp.end_date,
        price: camp.price,
        max_participants: totalSpots,
        enrolled_count: enrolledCount,
        available_spots: availableSpots,
        is_full: availableSpots <= 0,
        level: camp.level || 'all',
        images: camp.images || [],
        includes: camp.includes || []
      }
    })

    return surfCampsWithAvailability
  } catch (error) {
    console.error('Error fetching surf weeks:', error)
    return []
  }
}

// Format date range (European format DD/MM/YYYY)
function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  
  return `${start.toLocaleDateString('en-GB', options)} – ${end.toLocaleDateString('en-GB', options)}`
}

// Get price display
function getPriceDisplay(price: number) {
  return `From €${price}`
}

export default async function SurfWeeksPage() {
  // Force fresh data fetch on every request (no caching)
  const surfWeeks = await getSurfWeeks()
  const sections = await getSurfWeeksSections()
  
  // Log for debugging in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`[Surf Weeks Page] Rendering with ${surfWeeks.length} surf weeks at ${new Date().toISOString()}`)
  }
  
  // Helper to get section by type from unified page_sections
  const getSection = (type: string) => sections.find((s: any) => s.section_type === type)
  
  // Extract CMS sections (unified page_sections table uses section_type + content)
  const heroSection = getSection('hero')
  const introSection = getSection('intro')
  const faqSection = getSection('faq')
  const includedSection = getSection('features') || getSection('included')
  const stepsSection = getSection('steps') || getSection('process')
  
  // Type-safe content accessors
  const heroContent = heroSection?.content as { title?: string; description?: string; imageUrl?: string; videoUrl?: string } | undefined
  const introContent = introSection?.content as { title?: string; content?: string } | undefined
  const faqContent = faqSection?.content as { title?: string; items?: Array<{ question: string; answer: string }> } | undefined
  
  // Gallery images - Use CMS if available
  const galleryImages = [
    '/images/DSC03081-scaled.jpg',
    '/images/DSF8322-scaled.jpg',
    '/images/DSC03521-scaled.jpg',
    '/images/DSC02099-scaled.jpg',
    '/images/DSC02767-scaled.jpg',
    '/images/DSF8619-scaled.jpg',
    '/images/003844190021-scaled.jpg',
    '/images/DSF8298-scaled.jpg',
    '/images/DSF8812-scaled.jpg',
    '/images/DSC03530-scaled.jpg',
    '/images/DSC08054-scaled.jpg',
    '/images/DSF8018-2-scaled.jpg',
  ]

  // Included features
  const includedFeatures = [
    {
      icon: Bed,
      title: 'Accommodation',
      description: 'We offer very comfortable mattresses and beds. Choose to stay in a private room or our cozy dorm room.',
    },
    {
      icon: UtensilsCrossed,
      title: 'Food',
      description: 'Enjoy two amazing meals a day, prepared by our chef. We start the day with breakfast, and depending on the day\'s plans, we\'ll have either lunch or dinner at home.',
    },
    {
      icon: Activity,
      title: 'Yoga',
      description: 'Yoga complements surfing perfectly. During the week, you\'ll have the opportunity to participate in five yoga sessions!',
    },
    {
      icon: MapPin,
      title: 'Day trip',
      description: 'At least one day trip to explore Portugal is included. Some options include Ericeira, Sintra, Óbidos, and Lisbon.',
    },
    {
      icon: Waves,
      title: 'Surfskate lesson',
      description: 'One surf-skateboarding lesson is included. If it\'s your first time, we\'ll teach you the basics. If you want to progress, we\'ll help with that too. Don\'t forget to bring proper shoes! Skateboards are free to use throughout the week.',
    },
    {
      icon: Waves,
      title: 'Introductory surf lesson',
      description: 'We\'ll teach you the basics of surfing right at home. You\'ll learn proper techniques, gain essential knowledge, and practice exercises to ensure you\'re ready and safe in the ocean.',
    },
    {
      icon: Star,
      title: 'Other stuff',
      list: [
        'Table tennis',
        'Darts',
        'Table football',
        'Basketball court',
        'Slackline',
        'Skateboards',
        'Co-working space',
      ],
    },
  ]

  // How it works steps with images
  const surfWeekSteps = [
    {
      title: 'Choose a week & book',
      description: 'Browse our available surf weeks and select the dates that work for you. Send us an email to confirm availability and make your booking. We\'ll provide all the details you need to prepare for your adventure.',
      image: '/images/DSC03081-scaled.jpg'
    },
    {
      title: 'Transfer, Arrival & Check-in',
      description: 'Arrive anytime from 15:00 on your starting date. We can help arrange transfers from the airport (approximately 40€ taxi ride). Settle into your comfortable room and get ready for an incredible week ahead.',
      image: '/images/DSF8322-scaled.jpg'
    },
    {
      title: 'Welcome Tour',
      description: 'We\'ll show you around Heiwa House - from the skatepark and yoga dome to the pool and game areas. Meet your fellow surf week participants and get familiar with everything our amazing property has to offer.',
      image: '/images/DSC03521-scaled.jpg'
    },
    {
      title: 'Surf Theory & Go Surfing!',
      description: 'Start with an introductory surf lesson right at home to learn proper techniques and safety. Then head out to the best beaches in Ericeira and Peniche with our professional instructors. All equipment included!',
      image: '/images/DSC02099-scaled.jpg'
    },
    {
      title: 'Feast Twice a Day!',
      description: 'Enjoy two delicious meals prepared by our chef each day. Start with breakfast to fuel your surf sessions, and return to either lunch or dinner featuring fresh, local Portuguese cuisine. We cater to vegetarians and dietary restrictions.',
      image: '/images/DSC02767-scaled.jpg'
    },
    {
      title: 'Video Analysis',
      description: 'We film your surf sessions and provide detailed video analysis to help you improve your technique. Plus, we share the videos with you so you can use them for social media or keep them as amazing memories! 📹',
      image: '/images/DSF8619-scaled.jpg'
    },
    {
      title: 'Yoga',
      description: 'Five yoga sessions throughout the week complement your surfing perfectly. Practice in our beautiful dome with views of the Portuguese countryside. Improve flexibility, balance, and find your inner flow.',
      image: '/images/003844190021-scaled.jpg'
    },
    {
      title: 'Surfskate, pool, sauna, ice bath, games!',
      description: 'When you\'re not surfing, enjoy endless activities: master surfskate techniques, relax by the pool, experience our weekly sauna nights with ice bath dips, play table tennis, darts, basketball, or explore the area on our bicycles.',
      image: '/images/DSF8298-scaled.jpg'
    },
  ]

  // Simplified pricing structure
  const pricingOptions = [
    {
      title: 'Surf Week Package',
      price: 'From €450',
      description: 'All-inclusive surf week experience',
      features: [
        '7 nights accommodation',
        '14 delicious meals',
        '5 yoga sessions',
        'Surfskate lesson',
        'Day trip',
        'All facilities access'
      ],
      note: 'Surf lessons not included - see add-ons below'
    }
  ]

  const addOns = [
    {
      title: '5 Surf Lessons',
      price: '€200',
      description: 'Most popular option',
      features: ['Professional instructors', 'Equipment included', 'Daily video analysis']
    },
    {
      title: 'Single Surf Lesson',
      price: '€45',
      description: 'Try it out',
      features: ['Professional instructor', 'Equipment included']
    },
    {
      title: 'Bicycle Rental',
      price: '€30/week',
      description: 'Explore the area',
      features: ['Lock included', 'Board rack', 'Perfect for surf trips']
    },
    {
      title: 'Equipment Rentals',
      price: 'From €20/day',
      description: 'Surfboard & wetsuit',
      features: ['Surfboard: €20/day', 'Wetsuit: €5/day', 'Weekly deals available']
    },
    {
      title: 'Massage',
      price: 'From €35',
      description: 'Relax and recover',
      features: ['Professional massage therapist', 'Sore muscle relief']
    },
    {
      title: 'Sauna Night',
      price: '€10',
      description: 'Weekly tradition',
      features: ['Healthy relaxation', 'Ice bath included', 'Social experience']
    }
  ]

  // Google reviews will be fetched client-side via GoogleReviews component

  return (
    <div className="min-h-screen pt-20 bg-white">
      <SurfWeeksClient />
      {/* Hero Section with Overlay */}
      <section id="section-hero" className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <Image
          src={heroContent?.imageUrl || "/images/surf-weeks-front-page.jpg"}
          alt={heroContent?.title || "Surf Weeks at Heiwa House"}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {heroContent?.title || "Surf Weeks"}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto mb-8">
              {heroContent?.description || 
                "We strive to deliver an unforgettable surf week experience both in and out of the water. Even if surfing were taken out of the week, it would still be worth your while—amazing food, yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and the surfing? That's going to be awesome too 🙂"}
            </p>
          </div>
        </div>
      </section>

      {/* Intro Section - CMS Driven */}
      {(introContent?.title || introContent?.content) && (
        <section id="section-intro" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {introContent.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {introContent.title}
              </h2>
            )}
            {introContent.content && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {introContent.content}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Book Now + Google Reviews Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Google Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-3xl font-bold ml-3">5.0</span>
              </div>
              <GoogleRatingSummary className="text-gray-900" />
            </div>
            
            {/* Book Now Button */}
            <BookNowButton />
          </div>
        </div>
      </section>

      {/* Available Surf Weeks */}
      <section id="section-surf-weeks" className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Surf Weeks</h2>
            <p className="text-lg text-gray-600">Choose your perfect week and start your surfing adventure</p>
          </div>
          
          {surfWeeks.length > 0 ? (
            <SurfWeeksTable surfWeeks={surfWeeks} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No surf weeks available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* How a Surf Week Works - With Images */}
      <section id="section-steps" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How a surf week works
            </h2>
            <p className="text-lg text-gray-600">
              Your journey from booking to catching waves
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {surfWeekSteps.map((step, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery - 2 Rows, Horizontal Scroll */}
      <section id="section-gallery" className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* First Row */}
            <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {galleryImages.slice(0, Math.ceil(galleryImages.length / 2)).map((image, index) => (
                  <div
                    key={index}
                    className="relative w-64 h-64 flex-shrink-0 overflow-hidden group cursor-pointer rounded-lg"
                  >
                    <Image
                      src={image}
                      alt={`Surf Week ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="256px"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Second Row */}
            <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {galleryImages.slice(Math.ceil(galleryImages.length / 2)).map((image, index) => (
                  <div
                    key={index + Math.ceil(galleryImages.length / 2)}
                    className="relative w-64 h-64 flex-shrink-0 overflow-hidden group cursor-pointer rounded-lg"
                  >
                    <Image
                      src={image}
                      alt={`Surf Week ${index + Math.ceil(galleryImages.length / 2) + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="256px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Included & Pricing Section - Advertisement Style Overlay */}
      <section id="section-pricing" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/surf-weeks.jpg"
            alt="Surf week experience"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Very subtle dark overlay to maximize image visibility */}
          <div className="absolute inset-0 bg-black/10" />
        </div>
        
        {/* Content Overlay - Advertisement Style Layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            
            {/* Left Column - INCLUDED Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-white/50">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wide drop-shadow-sm">
                  Included
                </h2>
                <div className="space-y-4">
                  {includedFeatures
                    .filter(feature => !feature.list)
                    .map((feature, index) => {
                      const Icon = feature.icon
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-gray-900"
                        >
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-base">{feature.title}</div>
                            {feature.title === 'Food' && (
                              <div className="text-xs text-gray-600">(2 meals a day)</div>
                            )}
                            {feature.title === 'Yoga' && (
                              <div className="text-xs text-gray-600">(5 lessons)</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  
                  {/* Other facilities */}
                  {includedFeatures.find(f => f.list) && (
                    <div className="pt-4 mt-4 border-t border-gray-300">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900">Other facilities</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {includedFeatures
                          .find(f => f.list)
                          ?.list?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-sm text-gray-700"
                            >
                              <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Column - Price Display */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-orange-500 text-center">
                <div className="text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Price Starting
                </div>
                <div className="text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider mb-4">
                  From
                </div>
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-orange-600 mb-6">
                  450€
                </div>
                <div className="text-sm text-gray-600 max-w-xs mx-auto">
                  All-inclusive package. Everything listed is included in your surf week experience.
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-4">
                    Note: Surf lessons are not included - see add-ons
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Popular Add-ons */}
            <div className="lg:col-span-1">
              <div className="bg-white/55 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-white/50">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wide drop-shadow-sm">
                  Popular Addons
                </h2>
                <div className="space-y-4">
                  {addOns.map((addon, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-base">{addon.title}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{addon.description}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg md:text-xl font-bold text-orange-600">{addon.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Center - Book Now Button */}
          <div className="flex justify-center mt-8 lg:mt-12">
            <BookNowButton />
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="section-reviews" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">What Our Customers Say</h2>
          
          {/* Google Reviews Component - Fetches real reviews from API */}
          <GoogleReviews showReviews={true} maxReviews={4} />
        </div>
      </section>

      {/* FAQ Section - Use CMS if available */}
      <section id="section-faq" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            {faqContent?.title || 'Frequently Asked Questions'}
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {/* Use CMS FAQ items if available, otherwise fallback to defaults */}
              {((faqContent?.items && Array.isArray(faqContent.items) && faqContent.items.length > 0)
                ? faqContent.items.map((item: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-4 sm:px-6">
                      <AccordionTrigger className="text-left text-sm sm:text-base">
                        {item.question || item.title || ''}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-sm sm:text-base">
                        {item.answer || item.description || item.text || ''}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                : [
                    { question: 'How much does Surf Week cost?', answer: 'Our prices start at 450€ for a bed in the dorm room. Prices increase if you prefer a private room. Send us an email with your request, and we\'ll provide you with all the options. Please note that surf lessons are not included. You can find more details in the add-ons section.' },
                    { question: 'Do I have to know how to surf or skateboard?', answer: 'No! Everyone is welcome—first-timers, improvers, intermediates, and pros 🙂' },
                    { question: 'How does a typical day during Surf Week look?', answer: 'We start the day with yoga, followed by breakfast. Afterward, we head out to surf. Lunch is next, and in the afternoon, we enjoy activities like day trips, skateboarding, relaxing at the house, or playing games. Dinner is at home, and sometimes, we even throw a party 🙂' },
                    { question: 'How many people are in Surf Week groups?', answer: 'We usually have up to 18 people in the house.' },
                    { question: 'What is the age of people who sign up?', answer: 'Generally 24+' },
                  ].map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-4 sm:px-6">
                      <AccordionTrigger className="text-left text-sm sm:text-base">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-sm sm:text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))
              )}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}
