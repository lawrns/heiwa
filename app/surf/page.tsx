import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Waves, MapPin, Clock, Car, Mail } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'

export const metadata: Metadata = {
  title: 'Heiwa Surf - Surf Lessons & Ocean Adventures in Santa Cruz, Portugal',
  description: 'Learn to surf at Heiwa House in Santa Cruz, Portugal. Professional surf instruction for all levels with equipment provided and beachside accommodation.',
}

export default function SurfPage() {
  const faqItems = [
    {
      question: 'What is the best time of year to surf in Santa Cruz?',
      answer: 'Portugal offers year-round surfing! Summer (June-September) provides smaller, more manageable waves perfect for beginners, with water temperatures around 18-20°C. Autumn and winter (October-March) bring bigger swells for experienced surfers, though the water is cooler (14-16°C). Spring (April-May) offers a great balance of consistent waves and pleasant weather.',
    },
    {
      question: 'Do I need to bring my own surfboard?',
      answer: 'No need to bring your own board! We offer surfboard rentals at 20€ per day and wetsuits at 5€ per day. We also have special weekly rates available. Our surf lessons include all equipment. If you prefer to bring your own board, we have secure storage available.',
    },
    {
      question: 'Are there surf spots suitable for beginners?',
      answer: 'Absolutely! The beaches near our house offer gentle, sandy-bottomed breaks perfect for beginners. The long sandy beaches provide plenty of space to learn safely. Both Ericeira and Peniche also have beginner-friendly spots, and our instructors will help you find the best conditions for your level.',
    },
    {
      question: 'How do I get to the surf spots from Heiwa House?',
      answer: 'The nearest surf spots are incredibly accessible - just a 15-20 minute walk or 5 minute drive from the house. For Ericeira and Peniche (about 30 minutes drive each way), we organize daily surf trips as part of our surf weeks. You can also rent a bicycle from us for 30€/week to explore the local beaches independently.',
    },
    {
      question: 'What surf lessons do you offer?',
      answer: 'We offer professional surf instruction for all levels. One lesson costs 45€, or you can get five lessons for 200€. All lessons include professional instructors, equipment (board and wetsuit), and daily video analysis. We also provide a free introductory surf lesson at the house to teach you the basics before hitting the water.',
    },
    {
      question: 'Can I surf without joining a surf week?',
      answer: 'Yes! You can book a private room or bed with us and surf independently. We offer surfboard and wetsuit rentals, individual surf lessons, and can provide information about the best local spots. Our surf weeks are an amazing experience, but you\'re welcome to create your own surf adventure.',
    },
    {
      question: 'What makes the surfing in this area special?',
      answer: 'Our location is truly unique - we\'re perfectly positioned between two of Portugal\'s most famous surf destinations (Ericeira and Peniche), giving you access to dozens of world-class surf spots within 30 minutes. Plus, you have beautiful, less-crowded beaches just 5 minutes away. This variety means you can always find the perfect wave for your skill level and the day\'s swell conditions.',
    },
    {
      question: 'What skill level do I need to be?',
      answer: 'All levels are welcome! Whether you\'ve never stood on a surfboard or you\'re an experienced surfer looking to improve, the variety of breaks in this area cater to everyone. Our instructors will assess your level and guide you to the spots that match your abilities, ensuring you progress safely and have fun.',
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title="Heiwa Surf"
        description="Experience the thrill of surfing in Portugal's pristine waters. From beginner lessons to advanced coaching, discover your perfect wave at our doorstep."
        videoUrl="/images/videos/surf-ocean.mp4"
        imageUrl="/images/surf4.jpg"
      />

      {/* Introduction Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Located in the heart of Portugal&apos;s surf paradise, Heiwa House offers direct access to some of Europe&apos;s most beautiful beaches. 
              Our prime location between Ericeira and Peniche puts you within minutes of world-class surf breaks suitable for all levels.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you&apos;re catching your first wave or perfecting advanced techniques, our experienced instructors and pristine conditions 
              create the perfect environment for your surfing journey.
            </p>
          </div>
        </div>
      </section>

      {/* Surf Activities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Surf Programs & Services
            </h2>
            <p className="text-lg text-gray-600">
              Professional surf instruction and ocean experiences
            </p>
          </div>

          <ActivityGrid 
            category="surf" 
            tier="always" 
            showTierBadge={false}
          />
        </div>
      </section>

      {/* Local Surfing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Your Local Break
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Just a short walk or quick drive from Heiwa House, you&apos;ll find beautiful sandy beaches
                with consistent waves. These local spots are perfect for morning sessions, sunset surfs,
                or when you just want to grab your board and go.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">15-20 minute walk</h3>
                    <p className="text-gray-600">
                      Enjoy a beautiful coastal walk down to the beach. Perfect for warming up before your session.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">5 minute drive</h3>
                    <p className="text-gray-600">
                      Quick and easy access by car. We also offer bicycle rentals with board racks for 30€/week.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Waves className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Long sandy beaches</h3>
                    <p className="text-gray-600">
                      Miles of coastline to explore. Find your own peak, avoid the crowds, and enjoy the Atlantic.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 italic">
                  We don&apos;t name specific spots - part of the adventure is exploring and finding your own wave.
                  But don&apos;t worry, we&apos;ll point you in the right direction 🙂
                </p>
              </div>
            </div>

            {/* Map/Video */}
            <div className="space-y-6">
              {/* Local Area Map */}
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d97440.91857867094!2d-9.3897!3d39.1397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1ec4c3c5c5c5c5%3A0x5c5c5c5c5c5c5c5!2sSanta%20Cruz%2C%20Portugal!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Local surf area map"
                  className="absolute inset-0"
                />
              </div>

              {/* Optional Video Section */}
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    {/* Placeholder for future surf video */}
                    Video coming soon: Local surf sessions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* World-Class Surfing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              World-Class Surfing Nearby
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Heiwa House sits in the sweet spot between Ericeira and Peniche - two of Europe&apos;s premier surf destinations.
              Both are just 30 minutes away, giving you access to dozens of world-class breaks.
            </p>
          </div>

          {/* Ericeira & Peniche Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Ericeira Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src="/images/surf3.jpg"
                  alt="Ericeira Surfing"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-accent" />
                  <h3 className="text-2xl font-bold text-gray-900">Ericeira</h3>
                  <span className="ml-auto text-sm text-gray-500">~30 min drive</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Europe&apos;s first World Surfing Reserve and home to legendary breaks like Ribeira d&apos;Ilhas,
                  Coxos, and Pedra Branca. From mellow beach breaks to powerful reef breaks, Ericeira has it all.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Multiple world-class point breaks and reef breaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Beginner-friendly beaches like Foz do Lizandro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Consistent year-round swell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Charming Portuguese fishing village atmosphere</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Peniche Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src="/images/surf4.jpg"
                  alt="Peniche Surfing"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-accent" />
                  <h3 className="text-2xl font-bold text-gray-900">Peniche</h3>
                  <span className="ml-auto text-sm text-gray-500">~30 min drive</span>
                </div>
                <p className="text-gray-600 mb-4">
                  Home to Supertubos, one of the world&apos;s best beach breaks and regular host of the World Surf League.
                  The peninsula geography means there&apos;s always a sheltered spot with good waves.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Famous for powerful, hollow waves at Supertubos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Sheltered spots for all swell directions and winds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Spots for every skill level around the peninsula</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>WSL Championship Tour venue</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d198721.82397165!2d-9.4679!3d39.2845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0xd1ec5bfc7c5c5c5%3A0x5c5c5c5c5c5c5c5!2sEriceira%2C%20Portugal!3m2!1d38.9633!2d-9.4178!4m5!1s0xd1ed8c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5!2sPeniche%2C%20Portugal!3m2!1d39.3558!2d-9.3813!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Surf spots map - Ericeira to Peniche"
              className="absolute inset-0"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              <strong>The perfect location:</strong> With Ericeira to the south and Peniche to the north,
              you&apos;ll always find clean waves, no matter the swell direction or wind conditions.
              Our daily surf trips take you to the best spots based on the day&apos;s forecast.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Surfing FAQs
          </h2>
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

      {/* CTA Section - Surf Weeks */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* YouTube Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/9nhQiKGsgHg"
                title="Heiwa Surf Weeks Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Join Our Surf Weeks
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Want the complete experience? Our surf weeks combine professional surf instruction,
                yoga sessions, amazing food, day trips, and an incredible community of like-minded people.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>Professional surf instruction with video analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>Daily yoga and meditation sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>Two amazing meals per day by our chef</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>Surf trips to the best spots in Ericeira and Peniche</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold mt-1">•</span>
                  <span>Skateboarding, day trips, and amazing memories</span>
                </li>
              </ul>
              <div className="pt-4">
                <Link
                  href="/surf-weeks"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-accent hover:bg-accent-hover"
                >
                  <Waves className="w-5 h-5" />
                  Explore Surf Weeks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
