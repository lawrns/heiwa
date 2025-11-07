import { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'
import { HeroVideo } from '@/components/hero/hero-video'
import { ActivityGrid } from '@/components/activities/activity-grid'

export const metadata: Metadata = {
  title: 'Heiwa Play - Activities & Fun at Santa Cruz, Portugal',
  description: 'Discover endless fun at Heiwa Play! Enjoy table games, sauna & ice bath, giant pool, gym, bicycles, and more exciting activities in Santa Cruz, Portugal.',
}

export default function PlayPage() {

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

  // Sample reviews for Play page
  const reviews = [
    {
      id: '1',
      name: 'Sarah M.',
      rating: 5,
      text: 'The variety of activities at Heiwa Play is incredible! From table tennis tournaments to evening sauna sessions, there was never a dull moment.',
      timeAgo: '1 week ago',
      verified: true,
    },
    {
      id: '2',
      name: 'Mike R.',
      rating: 5,
      text: 'The skatepark was amazing! I loved trying surfskate for the first time, and the staff was super helpful. The pool was perfect for relaxing after surfing.',
      timeAgo: '2 weeks ago',
      verified: true,
    },
    {
      id: '3',
      name: 'Emma L.',
      rating: 5,
      text: 'Heiwa Play offers so much more than just surfing. The table games brought everyone together, and the bicycle rental let us explore beautiful coastal paths.',
      timeAgo: '3 weeks ago',
      verified: true,
    },
    {
      id: '4',
      name: 'Carlos D.',
      rating: 5,
      text: 'The sauna and ice bath experience was incredible for recovery. Combined with the gym and pool facilities, it\'s the perfect wellness destination.',
      timeAgo: '1 month ago',
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section with Video */}
      <HeroVideo
        title="Heiwa Play"
        description="Unleash your inner child with endless activities and adventures. From skateboarding to sauna sessions, every day is filled with fun and excitement."
        videoUrl="/images/videos/play-activities.mp4"
        imageUrl="/images/games.jpg"
      />

      {/* Introduction Section */}
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

      {/* Always Available Activities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Always Included Activities
            </h2>
            <p className="text-lg text-gray-600">
              These fun experiences are included in your stay at Heiwa House
            </p>
          </div>

          <ActivityGrid 
            category="play" 
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
              Available as Add-ons
            </h2>
            <p className="text-lg text-gray-600">
              Special activities available upon request - contact us to arrange
            </p>
          </div>

          <ActivityGrid 
            category="play" 
            tier="on-request" 
            showTierBadge={true}
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

      {/* Reviews Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say About Play Activities
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from real adventurers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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
                  {review.text}
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.timeAgo}</p>
                  </div>
                  {review.verified && (
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

      {/* CTA Section */}
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

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
