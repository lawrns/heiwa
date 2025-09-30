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
      {/* Simple Page Title */}
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Surf Camp</h1>
        </div>
      </div>

      {/* Hero Quote Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h5 className="text-xl md:text-2xl text-center text-gray-600 leading-relaxed">
            We strive to deliver an unforgettable surf camp experience both in and out of the water. 
            Even if surfing were taken out of the week, it would still be worth your while—amazing food,
            yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and
            the surfing? That&apos;s going to be awesome too 🙂
          </h5>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg group cursor-pointer">
            <Image
              src="/images/surf-weeks-front-page.jpg"
              alt="Surf Weeks Video"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <a
                href="https://youtu.be/9nhQiKGsgHg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-24 h-24 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                aria-label="Play video"
              >
                <Play className="w-10 h-10 text-accent ml-2" fill="currentColor" />
              </a>
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

      {/* Dates 2025 Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Dates 2025</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">June</h4>
              <ul className="space-y-2 text-gray-600">
                <li>May 31 – June 07</li>
                <li>June 07 – June 14</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">August</h4>
              <ul className="space-y-2 text-gray-600">
                <li>August 16 – August 23</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">September</h4>
              <ul className="space-y-2 text-gray-600">
                <li>August 30 – September 06</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a
              href="mailto:info@heiwahouse.com"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
            >
              <Mail className="w-5 h-5" />
              Email to book surf week
            </a>
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
            *prices starting <span className="font-bold text-gray-900">450€</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">FAQ</h2>
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