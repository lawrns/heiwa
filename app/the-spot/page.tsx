import { Metadata } from 'next'
import { ImageCarousel } from '@/components/ui/image-carousel'

export const metadata: Metadata = {
  title: 'The Spot - Heiwa House',
  description: 'Heiwa House started as a dream to create more than just a surf house—a place that feels like home.',
}

export default function TheSpotPage() {
  // Venue images
  const venueImages = [
    '/images/DSC03491.jpg',
    '/images/dji_fly_20240111_135624_97_1704981432374_photo_optimized-1.jpg',
    '/images/Freedomroutes-rooms-50.jpg',
    '/images/Freedomroutes-rooms-1.jpg',
    '/images/DSF8619-1.jpg',
    '/images/DSC03534.jpg',
    '/images/DSC03479.jpg',
    '/images/DSF8567.jpg',
    '/images/DSF7352.jpg',
    '/images/DSC04163.jpg',
  ]

  // Yoga dome images
  const yogaImages = [
    '/images/yoga_dome3.jpg',
    '/images/yoga_dome1.jpg',
    '/images/yoga_dome2.jpg',
    '/images/yoga_dome4.jpg',
  ]

  // Skatepark/Camping images
  const activityImages = [
    '/images/DSC04325.jpg',
    '/images/Freedroutes-telts-49.jpg',
    '/images/Freedroutes-telts-38.jpg',
    '/images/DSF7498.jpg',
    '/images/DSC01794.jpg',
    '/images/DSC01829-Enhanced-NR-2.jpg',
  ]

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Simple Page Title */}
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">The Spot</h1>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Our story
          </h2>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
            <p>
              Heiwa House started as a dream to create more than just a surf house—a place that 
              feels like home. After years of running surf camps and renting spaces, it was time 
              to build something permanent. Months of searching and a shared vision led us to the 
              perfect location. A love for surfing, yoga, design, and good vibes helped shape the 
              space into something truly special. Now, Heiwa House is the ultimate adult 
              playground—a place to surf, relax, connect, and just enjoy life.
            </p>
          </div>
        </div>
      </section>

      {/* Main Venue Carousel */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImageCarousel
            images={venueImages}
            alt="Heiwa House Venue"
            aspectRatio="video"
          />
        </div>
      </section>

      {/* Yoga Dome Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Yoga Dome
          </h2>
          <div className="max-w-4xl mx-auto">
            <ImageCarousel
              images={yogaImages}
              alt="Yoga Dome"
              aspectRatio="video"
            />
          </div>
        </div>
      </section>

      {/* Skatepark & Activities Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Skatepark & Activities
          </h2>
          <div className="max-w-4xl mx-auto">
            <ImageCarousel
              images={activityImages}
              alt="Skatepark and Activities"
              aspectRatio="video"
            />
          </div>
        </div>
      </section>
    </div>
  )
}