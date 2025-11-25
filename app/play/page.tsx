'use client'

import { Mail } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'
import { ActivityHighlight } from '@/components/activities/activity-highlight'
import { useEffect, useState } from 'react'

interface CMSSection {
  id: string
  section_type: string
  section_name?: string
  content: string | {
    title?: string
    description?: string
    video_url?: string
    image_url?: string
    text?: string
    html?: string
    button_text?: string
    button_url?: string
    items?: Array<{
      title?: string
      description?: string
      icon?: string
    }>
    [key: string]: unknown
  }
  order_index: number
}

export default function PlayPage() {
  const [cmsContent, setCmsContent] = useState<CMSSection[]>([])

  // Fetch CMS content
  useEffect(() => {
    const fetchCMSContent = async () => {
      try {
        const response = await fetch(`/api/cms/page-content?page_slug=play&is_active=true&sort_by=order_index&sort_order=asc&limit=50`)
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          console.log('✅ CMS content loaded for play page:', result.data.length, 'sections')
          setCmsContent(result.data)
        }
      } catch (error) {
        console.error('❌ Error fetching CMS content:', error)
      }
    }

    fetchCMSContent()
  }, [])

  // Extract CMS sections
  const heroSection = cmsContent.find(s => s.section_type === 'hero')
  const introSection = cmsContent.find(s => s.section_type === 'intro')
  const ctaSection = cmsContent.find(s => s.section_type === 'text' && s.section_name?.toLowerCase().includes('cta'))

  // FAQ items for Play page
  const faqItems = [
    {
      question: 'Are the play activities included in the surf week package?',
      answer: 'Yes! Most of our play activities including table games, skatepark access, pool usage, and gym facilities are included in your surf week stay. Some activities like bicycle rental may have additional costs.',
    },
    {
      question: 'Do I need to bring my own equipment for activities?',
      answer: 'No need to bring equipment! We provide all necessary gear for table games, skateboarding, and gym activities. For bicycles, we offer rentals with locks and board racks included.',
    },
    {
      question: 'Is the skatepark suitable for beginners?',
      answer: 'Absolutely! Our skatepark has obstacles and ramps for all skill levels, from first-time skaters to experienced riders. We also offer surfskate lessons as part of our surf weeks.',
    },
    {
      question: 'What are the pool and sauna opening hours?',
      answer: 'The pool is available throughout the day for guests. Sauna sessions are typically held in the evenings, with ice bath access available during sauna nights. Specific times may vary based on weather and season.',
    },
    {
      question: 'Can I use the gym facilities anytime?',
      answer: 'Yes, gym access is available to all guests throughout your stay. We have basic equipment for cardio and strength training to help you stay active during your visit.',
    },
    {
      question: 'Are the activities supervised?',
      answer: 'While most activities are self-guided, our staff is always available to help with equipment, provide tips, or join in the fun. During surf weeks, we often organize group activities and games.',
    },
  ]

  // Reviews will be fetched from Google Reviews API via GoogleReviews component

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title={typeof heroSection?.content === 'object' && heroSection.content?.title || "Heiwa Play"}
        description={typeof heroSection?.content === 'object' && heroSection.content?.description || "Unleash your inner child with endless activities and adventures. From skateboarding to sauna sessions, every day is filled with fun and excitement."}
        videoUrl={typeof heroSection?.content === 'object' && heroSection.content?.video_url || "/images/videos/play-activities.mp4"}
        imageUrl={typeof heroSection?.content === 'object' && heroSection.content?.image_url || "/images/games.jpg"}
      />

      {/* Introduction Section */}
      {introSection ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              {typeof introSection.content === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: introSection.content }} />
              ) : (
                <>
                  {introSection.content?.description && (
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {introSection.content.description}
                    </p>
                  )}
                  {introSection.content?.text && (
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {introSection.content.text}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                At Heiwa Play, we believe that adventure and fun are essential parts of the perfect surf holiday. 
                When you&apos;re not catching waves, you&apos;ll find countless ways to stay active, connect with others, 
                and create unforgettable memories.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you&apos;re competing in table tennis, relaxing in our giant pool, pushing your limits at the skatepark, 
                or finding your zen in the sauna, there&apos;s something for everyone at Heiwa Play.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Skateboarding & Music Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          <ActivityHighlight
            title="Skateboarding"
            description="Carve your own path in our custom-designed skatepark. Whether you're dropping in for the first time or perfecting your tricks, our concrete waves are waiting for you."
            videoUrl="/images/videos/sk81.mp4"
            videoPoster="/images/park4444.jpg"
            carouselImages={[
              '/images/park4444.jpg',
              '/images/DSC03081-scaled.jpg',
              '/images/DSC08054-scaled.jpg'
            ]}
          />

          <ActivityHighlight
            title="Music"
            description="Find your rhythm in our fully equipped jam room. Connect with fellow musicians, create something new, or just enjoy the vibes."
            videoUrl="/images/videos/Timeline-1.mp4"
            videoPoster="/images/DSC08736-scaled.jpg"
            carouselImages={[
              '/images/DSC08736-scaled.jpg',
              '/images/DSC01794.jpg',
              '/images/DSC08054-scaled.jpg'
            ]}
          />

        </div>
      </section>

      {/* Activities On-Site Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Activities On-Site
            </h2>
            <p className="text-lg text-gray-600">
              These fun experiences are included in your stay at Heiwa House
            </p>
          </div>

          <ActivityGrid 
            category="play" 
            tier="always" 
            showTierBadge={false}
            hideIcons={true}
          />
        </div>
      </section>

      {/* Activities Around Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Activities Around
            </h2>
            <p className="text-lg text-gray-600">
              Special activities available upon request - contact us to arrange
            </p>
          </div>

          <ActivityGrid 
            category="play" 
            tier="on-request" 
            showTierBadge={true}
            hideIcons={true}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
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

      {/* CTA Section */}
      {ctaSection ? (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {typeof ctaSection.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: ctaSection.content }} />
            ) : (
              <>
                {ctaSection.content?.title && (
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    {ctaSection.content.title}
                  </h2>
                )}
                {ctaSection.content?.description && (
                  <p className="text-lg text-gray-600 mb-8">
                    {ctaSection.content.description}
                  </p>
                )}
                {ctaSection.content?.button_text && ctaSection.content?.button_url && (
                  <a
                    href={ctaSection.content.button_url}
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
                    style={{ backgroundColor: '#ec681c' }}
                  >
                    <Mail className="w-5 h-5" />
                    {ctaSection.content.button_text}
                  </a>
                )}
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Play?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our surf weeks and experience all the amazing activities Heiwa Play has to offer. 
              From adventure to relaxation, we have it all!
            </p>
            <a
              href="mailto:info@heiwahouse.com"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
              style={{ backgroundColor: '#ec681c' }}
            >
              <Mail className="w-5 h-5" />
              Book Your Adventure
            </a>
          </div>
        </section>
      )}

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
