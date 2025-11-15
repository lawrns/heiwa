'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Waves, Clock, Car, MapPin } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'
import { SeasonalSurfLevelChart } from '@/components/surf/SeasonalSurfLevelChart'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { useEffect, useState } from 'react'

interface CMSSection {
  id: string
  section_type: string
  section_name?: string
  content: any
  order_index: number
}

export default function SurfPage() {
  const [cmsContent, setCmsContent] = useState<CMSSection[]>([])
  const [nextSurfWeek, setNextSurfWeek] = useState<any>(null)

  // Fetch CMS content
  useEffect(() => {
    const fetchCMSContent = async () => {
      try {
        const response = await fetch(`/api/cms/page-content?page_slug=surf&is_active=true&sort_by=order_index&sort_order=asc&limit=50`)
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          console.log('✅ CMS content loaded for surf page:', result.data.length, 'sections')
          setCmsContent(result.data)
        }
      } catch (error) {
        console.error('❌ Error fetching CMS content:', error)
      }
    }

    fetchCMSContent()
  }, [])

  // Fetch next upcoming surf week
  useEffect(() => {
    const fetchNextSurfWeek = async () => {
      try {
        const response = await fetch('/api/surf-camps?is_active=true&limit=1')
        const result = await response.json()
        if (result.success && result.data && result.data.length > 0) {
          const surfCamp = result.data[0]
          setNextSurfWeek({
            id: surfCamp.id,
            name: surfCamp.name,
            start_date: surfCamp.start_date,
            end_date: surfCamp.end_date,
            price: surfCamp.price,
            images: surfCamp.images || []
          })
        }
      } catch (error) {
        console.error('Error fetching next surf week:', error)
      }
    }

    fetchNextSurfWeek()
  }, [])

  // Extract CMS sections
  const heroSection = cmsContent.find(s => s.section_type === 'hero')
  const introSection = cmsContent.find(s => s.section_type === 'intro')
  const ctaSection = cmsContent.find(s => s.section_type === 'text' && s.section_name?.toLowerCase().includes('cta'))
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
        title={heroSection?.content?.title || "Heiwa Surf"}
        description={heroSection?.content?.description || "Experience the thrill of surfing in Portugal's pristine waters. From beginner lessons to advanced coaching, discover your perfect wave at our doorstep."}
        videoUrl={heroSection?.content?.video_url || undefined}
        imageUrl={heroSection?.content?.image_url || "/images/surf4.jpg"}
      />

      {/* Introduction Section */}
      {introSection ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {typeof introSection.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: introSection.content }} />
            ) : (
              <>
                {introSection.content?.description && (
                  <p className="text-lg text-gray-700 leading-relaxed text-center">
                    {introSection.content.description}
                  </p>
                )}
                {introSection.content?.text && (
                  <p className="text-lg text-gray-700 leading-relaxed text-center">
                    {introSection.content.text}
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      ) : (
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
      )}

      {/* Local Surfing Section - Moved to be first section after intro */}
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

            {/* Map */}
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/thehouse.webp"
                alt="Heiwa House location map"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Surf Week Card Section - Moved to top */}
      {nextSurfWeek && nextSurfWeek.id && nextSurfWeek.start_date && nextSurfWeek.end_date && typeof nextSurfWeek.price === 'number' && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Temporarily render content directly to avoid component error */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="text-center py-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-3xl font-bold text-gray-900">
                  {new Date(nextSurfWeek.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to {new Date(nextSurfWeek.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {new Date(nextSurfWeek.end_date).getFullYear()}!
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px]">
                  <Image
                    src={nextSurfWeek.images?.[0] || '/images/surf-weeks-front-page.jpg'}
                    alt={nextSurfWeek.name || 'Surf Week Group Photo'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                  <ul className="space-y-4 text-gray-900 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-semibold text-lg mt-0.5">-</span>
                      <span className="text-lg italic text-gray-900">Professional instructors for all levels</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-semibold text-lg mt-0.5">-</span>
                      <span className="text-lg italic text-gray-900">Amazing food prepared by our chef</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-semibold text-lg mt-0.5">-</span>
                      <span className="text-lg italic text-gray-900">Daily yoga and meditation sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-semibold text-lg mt-0.5">-</span>
                      <span className="text-lg italic text-gray-900">Surfskate and other activities!</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-semibold text-lg mt-0.5">-</span>
                      <span className="text-lg italic text-gray-900">Prices starting from EUR {nextSurfWeek.price || 450}!</span>
                    </li>
                  </ul>
                  <Link
                    href="/surf-weeks"
                    className="w-full lg:w-auto px-8 py-4 bg-accent hover:bg-accent-hover text-white font-bold text-xl rounded-lg transition-colors mb-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    style={{ backgroundColor: '#ec681c' }}
                  >
                    Book Now
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      <span className="text-yellow-400">★★★★★</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      5 based on 73 reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Surf Level Chart */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SeasonalSurfLevelChart />
        </div>
      </section>

      {/* What People Can Surf Near Heiwa */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What People Can Surf Near Heiwa
            </h2>
            <p className="text-lg text-gray-600">
              Experience the softer side of Santa Cruz waves - perfect for learning and progression
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Epic Picture */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/surf4.jpg"
                  alt="Epic Santa Cruz surf day"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <p className="text-sm italic text-gray-600 text-center">
                once in a blue moon it is like this
              </p>
            </div>
            
            {/* Right: Realistic Video */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/9nhQiKGsgHg?si=WWXSAJs0SAnR0wHY&controls=0"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
              <p className="absolute bottom-4 left-4 right-4 text-white text-sm bg-black/50 px-3 py-2 rounded backdrop-blur-sm">
                Small and mid surf in Santa Cruz - realistic conditions for most visitors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Surf Lessons Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo Carousel */}
            <div>
              <ImageCarousel
                images={[
                  '/images/surf4.jpg',
                  '/images/surf3.jpg',
                  '/images/DSC03081-scaled.jpg',
                  '/images/DSC02099-scaled.jpg',
                ]}
                alt="Surf lessons in Santa Cruz and Peniche"
                className="w-full"
                aspectRatio="aspect-[4/3]"
                autoAdvance={true}
                autoAdvanceInterval={5000}
              />
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Surf Lessons
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  We offer high quality surf lessons in Santa Cruz and Peniche. Professional instructors will help you to take the first steps or improve at whatever level you are.
                </p>
                <p>
                  Surf lessons starting from 40€ per session, with all equipment included. Whether you&apos;re a complete beginner catching your first wave or an experienced surfer looking to refine your technique, our certified instructors provide personalized coaching tailored to your skill level.
                </p>
                <p>
                  All lessons include professional instruction, surfboard and wetsuit rental, and video analysis to help you progress faster. We also offer package deals for multiple lessons and can organize trips to the best surf spots in Ericeira and Peniche based on current conditions.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/surf-weeks"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-white"
                  style={{ backgroundColor: '#ec681c' }}
                >
                  <Waves className="w-5 h-5" />
                  Book a Surf Lesson
                </Link>
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
                  sizes="(max-width: 1024px) 100vw, 50vw"
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

          {/* Interactive Map - replaced with custom image */}
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/images/heiwalocation.webp"
              alt="Surf spots map - Ericeira to Peniche"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
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
                width="560"
                height="315"
                src="https://www.youtube.com/embed/9nhQiKGsgHg?si=WWXSAJs0SAnR0wHY&controls=0"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
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
