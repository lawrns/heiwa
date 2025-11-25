'use client'

import { ActivityHighlight } from '@/components/activities/activity-highlight'
import { Mail } from 'lucide-react'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'
import { useEffect, useState } from 'react'

// Note: Metadata export removed because this is now a client component
// SEO metadata is handled via generateMetadata in layout or static metadata

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

export default function FlowPage() {
  const [cmsContent, setCmsContent] = useState<CMSSection[]>([])

  // Fetch CMS content
  useEffect(() => {
    const fetchCMSContent = async () => {
      try {
        const response = await fetch(`/api/cms/page-content?page_slug=flow&is_active=true&sort_by=order_index&sort_order=asc&limit=50`)
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          console.log('✅ CMS content loaded for flow page:', result.data.length, 'sections')
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

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title={typeof heroSection?.content === 'object' && heroSection.content?.title || "Heiwa Flow"}
        description={typeof heroSection?.content === 'object' && heroSection.content?.description || "Find your inner flow through yoga, wellness, and mindful practices. Balance your body, mind, and spirit in our peaceful Portuguese sanctuary."}
        videoUrl={typeof heroSection?.content === 'object' && heroSection.content?.video_url || "/optimized/videos/video_001_timeline-1.mp4"}
        imageUrl={typeof heroSection?.content === 'object' && heroSection.content?.image_url || "/images/yoga_dome3.jpg"}
      />

      {/* Introduction Section */}
      {introSection && (
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
      )}
      {!introSection && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Heiwa Flow is your gateway to deeper wellness and self-discovery. 
                Through ancient practices and modern therapies, we help you find balance, 
                reduce stress, and connect with your true self.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you&apos;re seeking physical recovery, mental clarity, or spiritual growth, 
                our flow services provide the perfect complement to your active surf lifestyle.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Flow Highlights Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          <ActivityHighlight
            title="Yoga Dome"
            description="Practice in our beautiful geodesic dome, surrounded by nature. The perfect space for morning flows and evening meditation."
            videoUrl="/optimized/videos/video_004_location2.mp4"
            videoPoster="/images/yoga_dome1.jpg"
            carouselImages={[
              '/images/yoga_dome1.jpg',
              '/images/yoga_dome2.jpg',
              '/images/yoga_dome3.jpg'
            ]}
          />

          <ActivityHighlight
            title="Sauna & Ice Tub"
            description="Recover and rejuvenate with our contrast therapy facilities. Boost your circulation, reduce inflammation, and feel invigorated."
            videoUrl="/optimized/videos/video_005_location3.mp4"
            videoPoster="/images/pool333.jpg"
            carouselImages={[
              '/images/pool333.jpg',
              '/images/pool4444.jpg',
              '/images/pool333.jpg'
            ]}
            reversed={true}
          />

          <ActivityHighlight
            title="Yoga Lessons"
            description="Join our expert instructors for guided sessions suitable for all levels. From dynamic Vinyasa to restorative Yin."
            videoUrl="/optimized/videos/video_002_fin1.mp4"
            videoPoster="/images/yoga_dome1.jpg"
            carouselImages={[
              '/images/yoga_dome1.jpg',
              '/images/yoga_dome2.jpg',
              '/images/yoga_dome3.jpg'
            ]}
          />

          <ActivityHighlight
            title="Massages"
            description="Treat yourself to a relaxing massage. Our therapists offer various styles to help you release tension and unwind."
            videoUrl="/optimized/videos/video_003_fin2.mp4"
            videoPoster="/images/hh1.jpg"
            carouselImages={[
              '/images/hh1.jpg',
              '/images/hh2.jpg',
              '/images/DSC03491.jpg'
            ]}
            reversed={true}
          />

        </div>
      </section>

      {/* Main Flow Services Section - Renamed/Modified */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Core Flow Services
            </h2>
            <p className="text-lg text-gray-600">
              Included wellness experiences to enhance your stay
            </p>
          </div>

          <ActivityGrid 
            category="flow" 
            tier="always" 
            showTierBadge={false}
            hideIcons={true}
          />
        </div>
      </section>

      {/* Available on Request Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available on Request
            </h2>
            <p className="text-lg text-gray-600">
              Specialized wellness services to deepen your experience
            </p>
          </div>

          <ActivityGrid 
            category="flow" 
            tier="on-request" 
            showTierBadge={true}
            hideIcons={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      {ctaSection ? (
        <section className="py-20 bg-white">
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
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Find Your Flow?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Enhance your Heiwa House experience with our wellness services. 
              Whether you&apos;re staying for a surf week or just visiting, we can customize the perfect flow experience for you.
            </p>
            <a
              href="mailto:info@heiwahouse.com"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
              style={{ backgroundColor: '#ec681c' }}
            >
              <Mail className="w-5 h-5" />
              Enquire Now
            </a>
          </div>
        </section>
      )}

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
