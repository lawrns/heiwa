import { Metadata } from 'next'
import Image from 'next/image'
import { Heart, Wind, Droplets, Thermometer, Mail, Star } from 'lucide-react'
import { FloatingCheckAvailability } from '@/components/floating-check-availability'

export const metadata: Metadata = {
  title: 'Heiwa Flow - Yoga, Massage & Wellness in Santa Cruz, Portugal',
  description: 'Find your flow at Heiwa House with yoga, massage, ice bath, sauna, and wellness services. Experience ultimate relaxation and rejuvenation in Portugal.',
}

export default function FlowPage() {
  // Main flow services
  const flowServices = [
    {
      title: 'Yoga',
      description: 'Daily yoga and meditation sessions in our beautiful dome overlooking the Portuguese countryside. Find balance, flexibility, and inner peace.',
      image: '/images/yoga_dome1.jpg',
      icon: Heart,
      features: ['Daily sessions', 'All levels welcome', 'Meditation & breathwork', 'Beautiful dome setting'],
    },
    {
      title: 'Massage',
      description: 'Professional massage therapy to soothe sore muscles after surfing or simply to relax and rejuvenate your body and mind.',
      image: '/images/yoga_dome2.jpg',
      icon: Wind,
      features: ['Professional therapists', 'Multiple techniques', 'Recovery focused', 'Relaxing environment'],
    },
    {
      title: 'Ice Bath',
      description: 'Experience the power of cold therapy for recovery, circulation, and mental clarity. Perfect complement to our active lifestyle.',
      image: '/images/pool333.jpg',
      icon: Droplets,
      features: ['Cold therapy', 'Recovery benefits', 'Mental clarity', 'Guided sessions'],
    },
    {
      title: 'Sauna',
      description: 'Traditional sauna experience to detoxify, relax muscles, and promote overall wellness. Weekly sauna nights with community.',
      image: '/images/pool333.jpg',
      icon: Thermometer,
      features: ['Traditional sauna', 'Detoxification', 'Muscle relaxation', 'Community nights'],
    },
  ]

  // Available on request services
  const requestServices = [
    {
      title: 'Breathwork',
      description: 'Guided breathing techniques to reduce stress, increase energy, and enhance mental clarity.',
      icon: Wind,
    },
    {
      title: 'Gong and Sound Healing',
      description: 'Therapeutic sound sessions using gongs and other instruments to promote deep relaxation and healing.',
      icon: Heart,
    },
    {
      title: 'Nail Boards',
      description: 'Traditional Sadhu nail board experience for mindfulness, focus, and overcoming mental barriers.',
      icon: Droplets,
    },
    {
      title: 'Somatic Alignment',
      description: 'Holistic body-mind therapy combining movement, breath, and awareness for optimal wellness.',
      icon: Heart,
    },
    {
      title: 'Reiki',
      description: 'Energy healing therapy to balance your body\'s energy centers and promote deep relaxation.',
      icon: Wind,
    },
    {
      title: 'Cacao Ceremony',
      description: 'Sacred cacao rituals for heart opening, connection, and spiritual exploration.',
      icon: Heart,
    },
    {
      title: 'Rapé Ceremony',
      description: 'Traditional Amazonian snuff ceremony for cleansing, clarity, and spiritual connection.',
      icon: Wind,
    },
    {
      title: 'Meditation',
      description: 'Guided meditation sessions for stress reduction, focus, and inner peace.',
      icon: Droplets,
    },
  ]

  // Reviews for Flow page
  const reviews = [
    {
      id: '1',
      name: 'Maria S.',
      rating: 5,
      text: 'The yoga sessions in the dome were absolutely magical. Waking up to practice with that view was the perfect start to each day.',
      timeAgo: '1 week ago',
      verified: true,
    },
    {
      id: '2',
      name: 'Thomas K.',
      rating: 5,
      text: 'The ice bath and sauna combination was incredible for recovery. I felt refreshed and energized after every session.',
      timeAgo: '2 weeks ago',
      verified: true,
    },
    {
      id: '3',
      name: 'Lisa P.',
      rating: 5,
      text: 'The massage therapy was exactly what I needed after surfing. Professional, relaxing, and so beneficial for my muscles.',
      timeAgo: '3 weeks ago',
      verified: true,
    },
    {
      id: '4',
      name: 'David R.',
      rating: 5,
      text: 'The sound healing session was transformative. I\'d never experienced anything like it before - so deeply relaxing.',
      timeAgo: '1 month ago',
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src="/images/yoga_dome3.jpg"
          alt="Heiwa Flow Wellness"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Heiwa Flow
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto">
              Find your inner flow through yoga, wellness, and mindful practices. 
              Balance your body, mind, and spirit in our peaceful Portuguese sanctuary.
            </p>
          </div>
        </div>
      </section>

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
              Flow Services
            </h2>
            <p className="text-lg text-gray-600">
              Core wellness experiences to enhance your stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {flowServices.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-64">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/90 rounded-lg flex items-center justify-center">
                          <Icon className="w-7 h-7 text-accent" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {requestServices.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )
            })}
          </div>
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

      {/* Floating Check Availability Button */}
      <FloatingCheckAvailability />
    </div>
  )
}
