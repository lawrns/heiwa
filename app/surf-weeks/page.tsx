import { Metadata } from 'next'
import Image from 'next/image'
import { Play, Bed, UtensilsCrossed, Activity, MapPin, Waves, Star, Mail, Calendar, Users, CheckCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { SurfWeeksClient } from '@/components/surf-weeks/SurfWeeksClient'
import { SurfWeeksTable } from '@/components/surf-weeks/SurfWeeksTable'
import { BookNowButton } from '@/components/surf-weeks/BookNowButton'

export const metadata: Metadata = {
  title: 'Surf Weeks in Santa Cruz, Portugal - Learn Surfing With Heiwa',
  description: 'We strive to deliver an unforgettable surf week experience both in and out of the water. Join us for surf, yoga, amazing food, skateboarding, and more.',
}

// Fetch surf weeks from database
async function getSurfWeeks() {
  try {
    // Use direct Supabase query for server-side rendering
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    const { data: surfCamps, error: surfCampsError } = await supabaseAdmin
      .from('surf_camps')
      .select('*')
      .eq('is_active', true)
      .eq('category', 'surf-week')
      .order('start_date', { ascending: true })

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      return []
    }

    if (!surfCamps || surfCamps.length === 0) {
      return []
    }

    // Get enrollment counts for each surf camp
    const surfCampsWithAvailability = await Promise.all(
      surfCamps.map(async (camp: any) => {
        const { count: enrolledCount } = await supabaseAdmin
          .from('surf_camp_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('surf_camp_id', camp.id)
          .eq('status', 'confirmed')
        
        const availableSpots = camp.max_participants - (enrolledCount || 0)
        
        return {
          id: camp.id,
          name: camp.name,
          description: camp.description,
          start_date: camp.start_date,
          end_date: camp.end_date,
          price: camp.price,
          max_participants: camp.max_participants,
          enrolled_count: enrolledCount || 0,
          available_spots: Math.max(0, availableSpots),
          is_full: availableSpots <= 0,
          level: camp.level,
          images: camp.images,
          includes: camp.includes
        }
      })
    )

    return surfCampsWithAvailability
  } catch (error) {
    console.error('Error fetching surf weeks:', error)
    return []
  }
}

// Format date range
function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }
  
  return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`
}

// Get price display
function getPriceDisplay(price: number) {
  return `From €${price}`
}

export default async function SurfWeeksPage() {
  const surfWeeks = await getSurfWeeks()
  
  // Gallery images
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

  // Real Google reviews (sample data - should be fetched from Google API)
  const googleReviews = [
    {
      author_name: 'Sarah Johnson',
      rating: 5,
      text: 'Absolutely incredible experience! The surf instruction was top-notch, the food was amazing, and the atmosphere was so welcoming. Can\'t wait to come back!',
      relative_time_description: '1 week ago',
      profile_photo_url: null
    },
    {
      author_name: 'Marco Rodriguez',
      rating: 5,
      text: 'Best surf camp I\'ve ever been to. The instructors are patient and knowledgeable, the accommodation is comfortable, and the location is perfect. Highly recommend!',
      relative_time_description: '2 weeks ago',
      profile_photo_url: null
    },
    {
      author_name: 'Emma Thompson',
      rating: 5,
      text: 'Life-changing week! I went from barely standing on the board to catching real waves. The yoga sessions were the perfect complement to surfing. Thank you Heiwa House!',
      relative_time_description: '3 weeks ago',
      profile_photo_url: null
    },
    {
      author_name: 'David Chen',
      rating: 5,
      text: 'Perfect blend of surfing, relaxation, and fun. The staff goes above and beyond to make sure everyone has an amazing time. The video analysis really helped improve my technique.',
      relative_time_description: '1 month ago',
      profile_photo_url: null
    }
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      <SurfWeeksClient />
      {/* Hero Section with Overlay */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <Image
          src="/images/surf-weeks-front-page.jpg"
          alt="Surf Weeks at Heiwa House"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Surf Weeks
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto mb-8">
              We strive to deliver an unforgettable surf week experience both in and out of the water. 
              Even if surfing were taken out of the week, it would still be worth your while—amazing food,
              yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and
              the surfing? That&apos;s going to be awesome too 🙂
            </p>
          </div>
        </div>
      </section>

      {/* Book Now + Google Reviews Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div>
                <p className="text-lg font-semibold text-gray-900">Based on 70 reviews</p>
                <a 
                  href="https://maps.app.goo.gl/PacVHHFxPnAcGxcbA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read our Google reviews →
                </a>
              </div>
            </div>
            
            {/* Book Now Button */}
            <BookNowButton />
          </div>
        </div>
      </section>

      {/* Available Surf Weeks */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How a surf week works
            </h2>
            <p className="text-lg text-gray-600">
              Your journey from booking to catching waves
            </p>
          </div>

          <div className="space-y-8">
            {surfWeekSteps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden group cursor-pointer"
              >
                <Image
                  src={image}
                  alt={`Surf Week ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Customers Say</h2>
          
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">5.0</span>
                <span className="text-gray-600">(70 reviews)</span>
              </div>
              <a
                href="https://maps.app.goo.gl/PacVHHFxPnAcGxcbA"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Review us on Google
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {googleReviews.map((review, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.author_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                    <p className="text-gray-500 text-xs">{review.relative_time_description}</p>
                  </div>
                </div>
                <div className="flex mb-2">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Included Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What is included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {includedFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
                  </div>
                  {feature.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  )}
                  {feature.list && (
                    <ul className="space-y-1 text-sm text-gray-600">
                      {feature.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Redesigned */}
      <section className="py-12 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
            <p className="text-xl text-gray-600">All-inclusive surf week experience with flexible add-ons</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Base Package */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-orange-500">
              <h3 className="text-2xl font-bold mb-2">Surf Week Package</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">
                From €450
              </div>
              <ul className="space-y-3 mb-6">
                {pricingOptions[0].features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 italic">
                *Surf lessons not included - see add-ons
              </p>
            </div>
            
            {/* Add-ons */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Popular Add-ons</h3>
              <div className="space-y-4">
                {addOns.map((addon, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{addon.title}</div>
                      <div className="text-sm text-gray-600">{addon.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">{addon.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How much does Surf Week cost?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Our prices start at 450€ for a bed in the dorm room. Prices increase if you prefer a private room. 
                Send us an email with your request, and we&apos;ll provide you with all the options. 
                Please note that surf lessons are not included. You can find more details in the add-ons section.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Do I have to know how to surf or skateboard?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                No! Everyone is welcome—first-timers, improvers, intermediates, and pros 🙂
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How does a typical day during Surf Week look?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We start the day with yoga, followed by breakfast. Afterward, we head out to surf. 
                Lunch is next, and in the afternoon, we enjoy activities like day trips, skateboarding, 
                relaxing at the house, or playing games. Dinner is at home, and sometimes, we even throw a party 🙂
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How many people are in Surf Week groups?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We usually have up to 18 people in the house.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What is the age of people who sign up?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Generally 24+
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
