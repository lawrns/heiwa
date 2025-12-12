'use client'

import { Mail } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'
import { ActivityHighlight } from '@/components/activities/activity-highlight'
import { useEffect, useState } from 'react'
import { PageSection } from '@/lib/cms-schemas'

export default function PlayPage() {
  const [sections, setSections] = useState<PageSection[]>([])
  const [, setLoading] = useState(true)

  // Fetch sections from new CMS API
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/cms/pages/play/sections')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          console.log('✅ CMS sections loaded for play page:', result.data.length, 'sections')
          setSections(result.data)
        }
      } catch (error) {
        console.error('❌ Error fetching CMS sections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [])

  // Helper to get section by type
  const getSection = (type: string) => sections.find(s => s.section_type === type)
  const getSectionsByType = (type: string) => sections.filter(s => s.section_type === type)

  // Extract sections
  const heroSection = getSection('hero')
  const introSection = getSection('intro')
  const faqSection = getSection('faq')
  const activityHighlights = getSectionsByType('activity_highlight')
  const activityGrids = getSectionsByType('activity_grid')
  const ctaSection = getSection('cta')

  // Type-safe content accessors
  const heroContent = heroSection?.content as { title?: string; description?: string; videoUrl?: string; imageUrl?: string } | undefined
  const introContent = introSection?.content as { title?: string; content?: string } | undefined
  const faqContent = faqSection?.content as { title?: string; items?: Array<{ question: string; answer: string }> } | undefined
  const ctaContent = ctaSection?.content as { title?: string; description?: string; buttonText?: string; buttonUrl?: string } | undefined

  const rawHeroVideoUrl = typeof heroContent?.videoUrl === 'string' ? heroContent.videoUrl.trim() : ''
  const resolvedHeroVideoUrl = rawHeroVideoUrl && !rawHeroVideoUrl.includes('/images/videos/play-activities')
    ? rawHeroVideoUrl
    : '/images/videos/sk81.mp4'

  // FAQ items - Use CMS if available, otherwise fallback to defaults
  const faqItems = (faqContent?.items && Array.isArray(faqContent.items) ? faqContent.items : [])
    .filter(item => item.question && item.answer)
  const resolvedFaqItems = faqItems.length > 0
    ? faqItems
    : [
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

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title={heroContent?.title || "Heiwa Play"}
        description={heroContent?.description || "Unleash your inner child with endless activities and adventures. From skateboarding to sauna sessions, every day is filled with fun and excitement."}
        videoUrl={resolvedHeroVideoUrl}
        imageUrl={heroContent?.imageUrl || "/images/games.jpg"}
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
                  At Heiwa Play, we believe that adventure and fun are essential parts of the perfect surf holiday.
                  When you&apos;re not catching waves, you&apos;ll find countless ways to stay active, connect with others,
                  and create unforgettable memories.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you&apos;re competing in table tennis, relaxing in our giant pool, pushing your limits at the skatepark,
                  or finding your zen in the sauna, there&apos;s something for everyone at Heiwa Play.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Activity Highlights Section - CMS Driven */}
      {activityHighlights.length > 0 && (
        <section id="section-activity_highlight" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            {activityHighlights.map((section) => {
              const content = section.content as {
                title?: string
                description?: string
                videoUrl?: string
                videoPoster?: string
                carouselImages?: string[]
                reversed?: boolean
              }
              return (
                <ActivityHighlight
                  key={section.id}
                  title={content.title || ''}
                  description={content.description || ''}
                  videoUrl={content.videoUrl || ''}
                  videoPoster={content.videoPoster || ''}
                  carouselImages={content.carouselImages || []}
                  reversed={content.reversed}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Activity Grids - CMS Driven */}
      {activityGrids.map((section, index) => {
        const content = section.content as {
          title?: string
          description?: string
          category?: 'flow' | 'play' | 'surf'
          tier?: 'always' | 'on-request'
          showTierBadge?: boolean
        }
        return (
          <section key={section.id} className={`py-20 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {content.title || 'Activities'}
                </h2>
                {content.description && (
                  <p className="text-lg text-gray-600">
                    {content.description}
                  </p>
                )}
              </div>

              <ActivityGrid
                category={content.category || 'play'}
                tier={content.tier || 'always'}
                showTierBadge={content.showTierBadge || false}
                hideIcons={true}
              />
            </div>
          </section>
        )
      })}

      {/* FAQ Section */}
      <section id="section-faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {faqContent?.title || 'Frequently Asked Questions'}
          </h2>
          <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
            {resolvedFaqItems.map((item, index) => (
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
      <section id="section-cta" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {ctaContent?.title || "Ready to Play?"}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {ctaContent?.description || "Join our surf weeks and experience all the amazing activities Heiwa Play has to offer. From adventure to relaxation, we have it all!"}
          </p>
          <a
            href={ctaContent?.buttonUrl || "mailto:info@heiwahouse.com"}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
            style={{ backgroundColor: '#ec681c' }}
          >
            <Mail className="w-5 h-5" />
            {ctaContent?.buttonText || "Book Your Adventure"}
          </a>
        </div>
      </section>

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
