'use client'

import { ActivityHighlight } from '@/components/activities/activity-highlight'
import { Mail } from 'lucide-react'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'
import { useEffect, useState } from 'react'
import { PageSection } from '@/lib/cms-schemas'

export default function FlowPage() {
  const [sections, setSections] = useState<PageSection[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch sections from new CMS API
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/cms/pages/flow/sections')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          console.log('✅ CMS sections loaded for flow page:', result.data.length, 'sections')
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
  const activityHighlights = getSectionsByType('activity_highlight')
  const activityGrids = getSectionsByType('activity_grid')
  const ctaSection = getSection('cta')

  // Type-safe content accessors
  const heroContent = heroSection?.content as { title?: string; description?: string; videoUrl?: string; imageUrl?: string } | undefined
  const introContent = introSection?.content as { title?: string; content?: string } | undefined
  const ctaContent = ctaSection?.content as { title?: string; description?: string; buttonText?: string; buttonUrl?: string } | undefined

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title={heroContent?.title || "Heiwa Flow"}
        description={heroContent?.description || "Find your inner flow through yoga, wellness, and mindful practices. Balance your body, mind, and spirit in our peaceful Portuguese sanctuary."}
        videoUrl={heroContent?.videoUrl || "/optimized/videos/video_001_timeline-1.mp4"}
        imageUrl={heroContent?.imageUrl || "/images/yoga_dome3.jpg"}
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
                  Heiwa Flow is your gateway to deeper wellness and self-discovery.
                  Through ancient practices and modern therapies, we help you find balance,
                  reduce stress, and connect with your true self.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you&apos;re seeking physical recovery, mental clarity, or spiritual growth,
                  our flow services provide the perfect complement to your active surf lifestyle.
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
      {activityGrids.map((section) => {
        const content = section.content as {
          title?: string
          description?: string
          category?: 'flow' | 'play' | 'surf'
          tier?: 'always' | 'on-request'
          showTierBadge?: boolean
        }
        return (
          <section key={section.id} className="py-20 bg-gray-50">
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
                category={content.category || 'flow'}
                tier={content.tier || 'always'}
                showTierBadge={content.showTierBadge || false}
                hideIcons={true}
              />
            </div>
          </section>
        )
      })}

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {ctaContent?.title || "Ready to Find Your Flow?"}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {ctaContent?.description || "Enhance your Heiwa House experience with our wellness services. Whether you're staying for a surf week or just visiting, we can customize the perfect flow experience for you."}
          </p>
          <a
            href={ctaContent?.buttonUrl || "mailto:info@heiwahouse.com"}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
            style={{ backgroundColor: '#ec681c' }}
          >
            <Mail className="w-5 h-5" />
            {ctaContent?.buttonText || "Enquire Now"}
          </a>
        </div>
      </section>

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
