import { Metadata } from 'next'
import Image from 'next/image'
import { Play, Bed, UtensilsCrossed, Activity, MapPin, Waves, Star, Mail } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Surf Camp in Santa Cruz, Portugal - Learn Surfing With Heiwa',
  description: 'We strive to deliver an unforgettable surf camp experience both in and out of the water. Join us for surf, yoga, amazing food, skateboarding, and more.',
}

export default function SurfWeeksPage() {
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

  // Featured surf week data
  const featuredWeek = {
    dates: 'February 1st to 12th, 2025!',
    price: 'From 450€',
    availableSpots: '8 spots left',
    image: '/images/DSC03081-scaled.jpg',
  }

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

  const extraServices = [
    {
      title: 'Surfing lessons',
      pricing: ['One surfing lesson: 45€', 'Five surfing lessons: 200€'],
      includes: [
        'Professional instructors',
        'Equipment: board and wetsuit',
        'Daily video analysis',
      ],
      note: 'And yes, we\'ll share the videos with you, so you can use them for social media or keep them as memories 🙂',
    },
    {
      title: 'Bicycle rental',
      pricing: ['Rent a bicycle for a week for 30€'],
      description: 'Explore the surroundings, the town, and the beaches. Our bicycles come with a lock and a board rack, so you can even go surfing with them.',
    },
    {
      title: 'Massage',
      pricing: ['Prices start from 35€'],
      description: 'Sore muscles after surfing? No need to worry—we can arrange a massage for you.',
    },
    {
      title: 'Sauna',
      pricing: ['Join us for just 10€!'],
      description: 'We love the sauna! It\'s healthy, relieves muscle tension, and feels amazing 🙂 Once a week, we host a sauna night. After the sauna, we take a dip in the ice tub.',
    },
    {
      title: 'Spiritual stuff',
      description: 'Cacao ceremony, Rapé ceremony, Sadhu boards—or if you want to go all in, book a Somatic Alignment session that includes all of the above.',
    },
    {
      title: 'Surfboard rentals',
      pricing: ['Surfboard: 20€ per day', 'Wetsuit: 5€ per day'],
      note: 'Or ask us about a great deal for the whole week!',
    },
  ]

  const faqItems = [
    {
      question: 'How much does Surf Week cost?',
      answer: 'Our prices start at 450€ for a bed in the dorm room. Prices increase if you prefer a private room. Send us an email with your request, and we\'ll provide you with all the options. Please note that surf lessons are not included. You can find more details in the Extras section.',
    },
    {
      question: 'Do I have to know how to surf or skateboard?',
      answer: 'No! Everyone is welcome—first-timers, improvers, intermediates, and pros 🙂',
    },
    {
      question: 'How generally does a day during Surf Week look like?',
      answer: 'We start the day with yoga, followed by breakfast. Afterward, we head out to surf. Lunch is next, and in the afternoon, we enjoy activities like day trips, skateboarding, relaxing at the house, or playing games. Dinner is at home, and sometimes, we even throw a party 🙂',
    },
    {
      question: 'How many people are in Surf Week groups?',
      answer: 'We usually have up to 18 people in the house.',
    },
    {
      question: 'What is the age of people who sign up?',
      answer: 'Generally 24+',
    },
    {
      question: 'What about if I have dietary restrictions?',
      answer: 'We make an effort to cater to vegetarians and accommodate specific food allergies.',
    },
    {
      question: 'How to get to Heiwa House?',
      answer: 'You can get here by car, taxi (approximately 40€), or a combination of buses. Send us a message, and we\'ll provide you with detailed instructions.',
    },
    {
      question: 'What are arrival and departure times at the house?',
      answer: 'On the starting date of the surf week, you can arrive anytime from 15:00. The first day is just for settling in, and we\'ll have dinner at around 19:00. On the final day of the surf week, breakfast is at 8:00, and we kindly ask that you vacate your room by 10:00. However, you\'re welcome to stay around the house for a few hours if needed.',
    },
    {
      question: 'Can I stay more than one week?',
      answer: 'Yes, you can combine several surf weeks or rent a room or bed afterward to enjoy the place longer.',
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Overlay */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <Image
          src="/images/surf-weeks-front-page.jpg"
          alt="Surf Weeks at Heiwa House"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Surf Weeks
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto mb-8">
              We strive to deliver an unforgettable surf camp experience both in and out of the water. 
              Even if surfing were taken out of the week, it would still be worth your while—amazing food,
              yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and
              the surfing? That&apos;s going to be awesome too 🙂
            </p>
          </div>
        </div>
      </section>

      {/* Featured Surf Week Callout */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Next Surf Week at Heiwa!</h2>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Image */}
              <div className="relative h-64 md:h-auto">
                <Image
                  src={featuredWeek.image}
                  alt="Featured Surf Week"
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="md:col-span-2 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{featuredWeek.dates}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg font-semibold">-</span>
                      <span className="text-gray-700">Professional instructors for all levels</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg font-semibold">-</span>
                      <span className="text-gray-700">Amazing food prepared by our chef</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg font-semibold">-</span>
                      <span className="text-gray-700">Daily yoga and meditation sessions</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg font-semibold">-</span>
                      <span className="text-gray-700">Surfskate and other activities!</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-accent text-lg font-semibold">-</span>
                      <span className="text-gray-700">Prices starting from EUR 450!</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 text-xs">4.7 (16,940)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Scheduled Surf Weeks Table */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">More Scheduled Surf Weeks</h2>
          
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
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="text-gray-900 font-medium">May 31 – June 07</div>
                  <div className="text-gray-900 font-medium">From 450€</div>
                  <div className="text-gray-600">5/18</div>
                  <div className="flex justify-end">
                    <a
                      href="mailto:info@heiwahouse.com"
                      className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
                      style={{ backgroundColor: '#ec681c' }}
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="text-gray-900 font-medium">June 07 – June 14</div>
                  <div className="text-gray-900 font-medium">From 450€</div>
                  <div className="text-gray-600">8/18</div>
                  <div className="flex justify-end">
                    <a
                      href="mailto:info@heiwahouse.com"
                      className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
                      style={{ backgroundColor: '#ec681c' }}
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="text-gray-900 font-medium">August 16 – August 23</div>
                  <div className="text-gray-900 font-medium">From 450€</div>
                  <div className="text-gray-600">12/18</div>
                  <div className="flex justify-end">
                    <a
                      href="mailto:info@heiwahouse.com"
                      className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
                      style={{ backgroundColor: '#ec681c' }}
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="text-gray-900 font-medium">August 30 – September 06</div>
                  <div className="text-gray-900 font-medium">From 450€</div>
                  <div className="text-gray-600">15/18</div>
                  <div className="flex justify-end">
                    <a
                      href="mailto:info@heiwahouse.com"
                      className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
                      style={{ backgroundColor: '#ec681c' }}
                    >
                      Book
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How a Surf Week Works Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How a surf week works
            </h2>
            <p className="text-lg text-gray-600">
              Your journey from booking to catching waves
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose a week & book</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse our available surf weeks and select the dates that work for you. 
                  Send us an email to confirm availability and make your booking. 
                  We&apos;ll provide all the details you need to prepare for your adventure.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer, Arrival & Check-in</h3>
                <p className="text-gray-600 leading-relaxed">
                  Arrive anytime from 15:00 on your starting date. We can help arrange transfers 
                  from the airport (approximately 40€ taxi ride). Settle into your comfortable room 
                  and get ready for an incredible week ahead.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Tour</h3>
                <p className="text-gray-600 leading-relaxed">
                  We&apos;ll show you around Heiwa House - from the skatepark and yoga dome to the 
                  pool and game areas. Meet your fellow surf week participants and get familiar 
                  with everything our amazing property has to offer.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Surf Theory & Go Surfing!</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start with an introductory surf lesson right at home to learn proper techniques 
                  and safety. Then head out to the best beaches in Ericeira and Peniche with our 
                  professional instructors. All equipment included!
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Feast Twice a Day!</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy two delicious meals prepared by our chef each day. Start with breakfast 
                  to fuel your surf sessions, and return to either lunch or dinner featuring 
                  fresh, local Portuguese cuisine. We cater to vegetarians and dietary restrictions.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Video Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  We film your surf sessions and provide detailed video analysis to help you 
                  improve your technique. Plus, we share the videos with you so you can use 
                  them for social media or keep them as amazing memories! 📹
                </p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                7
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Yoga</h3>
                <p className="text-gray-600 leading-relaxed">
                  Five yoga sessions throughout the week complement your surfing perfectly. 
                  Practice in our beautiful dome with views of the Portuguese countryside. 
                  Improve flexibility, balance, and find your inner flow.
                </p>
              </div>
            </div>

            {/* Step 8 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                8
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Surfskate, pool, sauna, ice bath, games!</h3>
                <p className="text-gray-600 leading-relaxed">
                  When you&apos;re not surfing, enjoy endless activities: master surfskate techniques, 
                  relax by the pool, experience our weekly sauna nights with ice bath dips, 
                  play table tennis, darts, basketball, or explore the area on our bicycles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery - Masonry Style */}
      <section className="py-12">
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
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Our Customers Say</h2>
          
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">4.7</span>
                <span className="text-gray-600">(16,940 reviews)</span>
              </div>
              <a
                href="https://www.google.com/search?q=heiwa+house+reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Review us on Google
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Review 1 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  JM
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Jesús MR</p>
                  <p className="text-gray-500 text-xs">2 days ago</p>
                </div>
              </div>
              <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lugar con vistas increíbles de la ciudad de Los Angeles, el observatorio "s, es...
              </p>
              <a href="#" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">Read more</a>
            </div>

            {/* Review 2 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  EG
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Ernesto Guevara</p>
                  <p className="text-gray-500 text-xs">1 week ago</p>
                </div>
              </div>
              <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Griffith Observatory is one of the Los Angeles' most iconic attractions and absolutely...
              </p>
              <a href="#" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">Read more</a>
            </div>

            {/* Review 3 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  JZ
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">John Z</p>
                  <p className="text-gray-500 text-xs">2 weeks ago</p>
                </div>
              </div>
              <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Definitely a visit worth it if you come before 11 parking is for free
              </p>
              <a href="#" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">Read more</a>
            </div>

            {/* Review 4 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  PE
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Paul Egan</p>
                  <p className="text-gray-500 text-xs">3 weeks ago</p>
                </div>
              </div>
              <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Best view of LA and the Hollywood sign. Going on a week day is...
              </p>
              <a href="#" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">Read more</a>
            </div>
          </div>
        </div>
      </section>

      {/* What is Included Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What is included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {includedFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-accent" />
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
                          <span className="text-accent mt-0.5">•</span>
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

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-600">
            Prices starting <span className="font-bold text-gray-900">450€</span>
          </p>
        </div>
      </section>

      {/* Extra Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Extra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {extraServices.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h4>
                
                {service.pricing && (
                  <div className="mb-3">
                    {service.pricing.map((price, idx) => (
                      <p key={idx} className="text-gray-900 font-medium">{price}</p>
                    ))}
                  </div>
                )}
                
                {service.includes && (
                  <div className="mb-3">
                    <p className="font-medium text-gray-900 mb-2">Includes:</p>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      {service.includes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {service.description && (
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                )}
                
                {service.note && (
                  <p className="text-gray-600 text-sm italic">{service.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Commonly asked surf related questions</h2>
          <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 last:border-0">
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-gray-50">
                  <span className="font-semibold text-gray-900">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

          </div>
  )
}