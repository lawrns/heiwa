'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Waves, Clock, Car, MapPin } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { SeasonalSurfLevelChart } from '@/components/surf/SeasonalSurfLevelChart'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { PageSection } from '@/lib/cms-schemas'

interface SurfPageClientProps {
  sections: PageSection[]
  nextSurfWeek: {
    id: string
    name: string
    start_date: string
    end_date: string
    price: number
    images: string[]
  } | null
}

export default function SurfPageClient({ sections, nextSurfWeek }: SurfPageClientProps) {

  // Helper to get section by type
  const getSection = (type: string) => sections.find(s => s.section_type === type)

  // Extract sections
  const heroSection = getSection('hero')
  const introSection = getSection('intro')
  const faqSection = getSection('faq')
  const localBreakSection = getSection('local_break')
  const surfLessonsSection = getSection('surf_lessons')
  const surfConditionsSection = getSection('surf_conditions')
  const worldClassSurfingSection = getSection('world_class_surfing')

  // Type-safe content accessors
  const heroContent = heroSection?.content as { title?: string; description?: string; videoUrl?: string; imageUrl?: string } | undefined
  const introContent = introSection?.content as { title?: string; content?: string } | undefined
  const faqContent = faqSection?.content as { title?: string; items?: Array<{ question: string; answer: string }> } | undefined
  const localBreakContent = localBreakSection?.content as {
    title?: string
    description?: string
    features?: Array<{ icon: string; title: string; description: string }>
    disclaimer?: string
    imageUrl?: string
  } | undefined
  const surfLessonsContent = surfLessonsSection?.content as {
    title?: string
    paragraphs?: string[]
    carouselImages?: string[]
    buttonText?: string
    buttonUrl?: string
  } | undefined
  const surfConditionsContent = surfConditionsSection?.content as {
    title?: string
    subtitle?: string
    epicImageUrl?: string
    epicImageCaption?: string
    videoUrl?: string
    videoCaption?: string
  } | undefined
  const worldClassSurfingContent = worldClassSurfingSection?.content as {
    title?: string
    subtitle?: string
    locations?: Array<{
      name: string
      distance?: string
      imageUrl?: string
      description: string
      highlights?: string[]
    }>
    mapImageUrl?: string
    footerText?: string
  } | undefined

  // FAQ items - Use CMS if available, otherwise fallback to defaults
  const faqItems = faqContent?.items && Array.isArray(faqContent.items)
    ? faqContent.items.filter(item => item.question && item.answer)
    : [
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

  // Icon component mapper
  const IconComponent = ({ iconName }: { iconName: string }) => {
    switch (iconName) {
      case 'Clock': return <Clock className="w-6 h-6 text-accent" />
      case 'Car': return <Car className="w-6 h-6 text-accent" />
      case 'Waves': return <Waves className="w-6 h-6 text-accent" />
      default: return <Waves className="w-6 h-6 text-accent" />
    }
  }

  // TODO(cms-hardcoded): Remove all default fallbacks - code should ONLY use CMS data
  // If CMS section missing, show empty state or error, not hardcoded defaults
  // This masks CMS changes and makes it impossible to verify if CMS is working

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title={heroContent?.title || "Heiwa Surf"}
        description={heroContent?.description || "Experience the thrill of surfing in Portugal's pristine waters. From beginner lessons to advanced coaching, discover your perfect wave at our doorstep."}
        videoUrl={heroContent?.videoUrl}
        imageUrl={heroContent?.imageUrl || "/images/surf4.jpg"}
      />

      {/* Introduction Section */}
      <section id="section-intro" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            {introContent?.title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {introContent.title}
              </h2>
            )}
            {introContent?.content ? (
              <div
                className="text-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: introContent.content }}
              />
            ) : (
              <>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Located in the heart of Portugal&apos;s surf paradise, Heiwa House offers direct access to some of Europe&apos;s most beautiful beaches.
                  Our prime location between Ericeira and Peniche puts you within minutes of world-class surf breaks suitable for all levels.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you&apos;re catching your first wave or perfecting advanced techniques, our experienced instructors and pristine conditions
                  create the perfect environment for your surfing journey.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Local Surfing Section - CMS Editable */}
      <section id="section-local_break" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              {localBreakContent?.title ? (
                <>
                  <h2 className="text-4xl font-bold text-gray-900">
                    {localBreakContent.title}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {localBreakContent.description}
                  </p>

                  <div className="space-y-4">
                    {localBreakContent.features && localBreakContent.features.length > 0 && localBreakContent.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent iconName={feature.icon} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

                    {localBreakContent.disclaimer && (
                      <div className="pt-4">
                        <p className="text-sm text-gray-500 italic">
                          {localBreakContent.disclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Local Break section not configured in CMS</p>
                </div>
              )}
            </div>

            {/* Map */}
            {localBreakContent?.imageUrl && (
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={localBreakContent.imageUrl}
                  alt="Heiwa House location map"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Promotional Surf Week Card Section */}
      {nextSurfWeek && nextSurfWeek.id && nextSurfWeek.start_date && nextSurfWeek.end_date && typeof nextSurfWeek.price === 'number' && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    className="w-full lg:w-auto px-8 py-4 bg-accent hover:bg-accent-dark text-white font-bold text-xl rounded-lg transition-colors mb-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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

      {/* What People Can Surf Near Heiwa - CMS Editable */}
      <section id="section-surf_conditions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {surfConditionsContent?.title || defaultSurfConditions.title}
            </h2>
            <p className="text-lg text-gray-600">
              {surfConditionsContent?.subtitle || defaultSurfConditions.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Epic Picture */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={surfConditionsContent?.epicImageUrl || defaultSurfConditions.epicImageUrl}
                  alt="Epic Santa Cruz surf day"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <p className="text-sm italic text-gray-600 text-center">
                {surfConditionsContent?.epicImageCaption || defaultSurfConditions.epicImageCaption}
              </p>
            </div>

            {/* Right: Realistic Video */}
            {surfConditionsContent?.videoUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe
                  width="560"
                  height="315"
                  src={surfConditionsContent.videoUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
                <p className="absolute bottom-4 left-4 right-4 text-white text-sm bg-black/50 px-3 py-2 rounded backdrop-blur-sm">
                  {surfConditionsContent.videoCaption || 'Check out the waves'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Surf Lessons Section - CMS Editable */}
      <section id="section-surf_lessons" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo Carousel */}
            <div>
              <ImageCarousel
                images={surfLessonsContent?.carouselImages || defaultSurfLessonsImages}
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
                {surfLessonsContent?.title || 'Surf Lessons'}
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                {(surfLessonsContent?.paragraphs || defaultSurfLessonsParagraphs).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  href={surfLessonsContent?.buttonUrl || "/surf-weeks"}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-white bg-accent hover:bg-accent-dark"
                >
                  <Waves className="w-5 h-5" />
                  {surfLessonsContent?.buttonText || 'Book a Surf Lesson'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* World-Class Surfing Section - CMS Editable */}
      <section id="section-world_class_surfing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {worldClassSurfingContent?.title || defaultWorldClassSurfing.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {worldClassSurfingContent?.subtitle || defaultWorldClassSurfing.subtitle}
            </p>
          </div>

          {/* Location Cards */}
          {worldClassSurfingContent?.locations && worldClassSurfingContent.locations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {worldClassSurfingContent.locations.map((location, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {location.imageUrl && (
                      <div className="relative aspect-video">
                        <Image
                          src={location.imageUrl}
                          alt={`${location.name} Surfing`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-accent" />
                        <h3 className="text-2xl font-bold text-gray-900">{location.name}</h3>
                        {location.distance && (
                          <span className="ml-auto text-sm text-gray-500">{location.distance}</span>
                        )}
                      </div>
                      {location.description && (
                        <p className="text-gray-600 mb-4">
                          {location.description}
                        </p>
                      )}
                      {location.highlights && location.highlights.length > 0 && (
                        <ul className="space-y-2 text-sm text-gray-600">
                          {location.highlights.map((highlight, hIndex) => (
                            <li key={hIndex} className="flex items-start gap-2">
                              <span className="text-accent mt-0.5">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Map - replaced with custom image */}
              {worldClassSurfingContent.mapImageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src={worldClassSurfingContent.mapImageUrl}
                    alt="Surf spots map - Ericeira to Peniche"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
                  />
                </div>
              )}

              {worldClassSurfingContent.footerText && (
                <div className="mt-8 text-center">
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    <strong>The perfect location:</strong> {worldClassSurfingContent.footerText}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">World-Class Surfing section not configured in CMS</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      {faqContent?.items && faqContent.items.length > 0 ? (
        <section id="section-faq" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              {faqContent.title || 'Frequently Asked Questions'}
            </h2>
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
              {faqContent.items.map((item, index) => (
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
      ) : (
        <section id="section-faq" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">FAQ section not configured in CMS</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Surf Weeks */}
      <section id="section-cta" className="py-20 bg-gray-50">
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
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

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
