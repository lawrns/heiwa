'use client'

import { Mail } from 'lucide-react'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'
import { useEffect, useState } from 'react'

// Note: Metadata export removed because this is now a client component
// SEO metadata is handled via generateMetadata in layout or static metadata

interface Testimonial {
  id: string
  author_name: string
  content: string
  rating: number
  is_featured: boolean
}

export default function FlowPage() {
  const [reviews, setReviews] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/admin/testimonials?featured=true')
        const data = await response.json()
        if (data.success && data.data) {
          setReviews(data.data)
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        // Fallback to empty array - page still renders
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title="Heiwa Flow"
        description="Find your inner flow through yoga, wellness, and mindful practices. Balance your body, mind, and spirit in our peaceful Portuguese sanctuary."
        videoUrl="/images/videos/flow-wellness.mp4"
        imageUrl="/images/yoga_dome3.jpg"
      />

      {/* Introduction Section */}
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

      {/* Main Flow Services Section */}
      <section className="py-20 bg-white">
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
          />
        </div>
      </section>

      {/* Available on Request Section */}
      <section className="py-20 bg-gray-50">
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
          />
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say About Flow
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from our wellness seekers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200">
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {review.content}
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                  </div>
                  {review.is_featured && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
