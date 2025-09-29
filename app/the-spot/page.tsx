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
    <div className="min-h-screen pt-20">
      {/* Page Title */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-text">The Spot</h1>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-section-y bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">
              Our story
            </h2>
            <div className="space-y-4 text-text-muted text-lg leading-relaxed">
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
        </div>
      </section>

      {/* Main Venue Carousel */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <ImageCarousel
              images={venueImages}
              alt="Heiwa House Venue"
              aspectRatio="video"
            />
          </div>
        </div>
      </section>

      {/* Yoga Dome Section */}
      <section className="py-section-y bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-8 text-center">
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
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-8 text-center">
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

      {/* Amenities Grid */}
      <section className="py-section-y bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-12 text-center">
            What We Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Surfing */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🏄‍♂️</span>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Surfing</h3>
              <p className="text-text-muted">
                Access to world-class surf spots and professional coaching
              </p>
            </div>

            {/* Yoga */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🧘‍♀️</span>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Yoga</h3>
              <p className="text-text-muted">
                Daily yoga sessions in our beautiful yoga dome
              </p>
            </div>

            {/* Skatepark */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🛹</span>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Skatepark</h3>
              <p className="text-text-muted">
                On-site skatepark for all skill levels
              </p>
            </div>

            {/* Pool */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🏊‍♂️</span>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Pool</h3>
              <p className="text-text-muted">
                Relax and cool off in our refreshing pool
              </p>
            </div>

            {/* Coworking */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Coworking</h3>
              <p className="text-text-muted">
                Fast WiFi and comfortable workspaces for digital nomads
              </p>
            </div>

            {/* Community */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Community</h3>
              <p className="text-text-muted">
                Connect with like-minded travelers and locals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-y bg-primary text-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Come Visit Us
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Experience the Heiwa House lifestyle. Book your stay and become part of our community.
          </p>
          <button className="btn-primary bg-white text-primary hover:bg-surface-alt">
            Book Your Stay
          </button>
        </div>
      </section>
    </div>
  )
}