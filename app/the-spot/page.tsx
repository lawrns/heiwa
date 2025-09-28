import { Metadata } from 'next'
import { CardGrid } from '@/components/card-grid'
import { experiencesPageContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'The Spot - Activities & Amenities',
  description: 'Discover all the activities and amenities at Heiwa House. From surfing and yoga to hiking and horseback riding, find your perfect coastal adventure.',
}

export default function TheSpotPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
          <div className="absolute inset-0 bg-surface/40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-text mb-4">
            The Spot
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto">
            Discover the perfect blend of adventure and relaxation at Heiwa House
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-section-y bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-6">
            Life at Heiwa House
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-surface-alt rounded-card p-6">
              <h3 className="text-xl font-heading font-semibold text-text mb-3">
                Adventure Awaits
              </h3>
              <p className="text-muted">
                From world-class surfing to scenic hikes, our coastal location offers endless opportunities for exploration and discovery.
              </p>
            </div>
            <div className="bg-surface-alt rounded-card p-6">
              <h3 className="text-xl font-heading font-semibold text-text mb-3">
                Wellness & Recovery
              </h3>
              <p className="text-muted">
                Rejuvenate your body and mind with our yoga sessions, sauna, and restorative activities designed for complete relaxation.
              </p>
            </div>
            <div className="bg-surface-alt rounded-card p-6">
              <h3 className="text-xl font-heading font-semibold text-text mb-3">
                Community Connection
              </h3>
              <p className="text-muted">
                Join like-minded adventurers in our communal spaces, sharing stories, meals, and unforgettable experiences together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-4">
              Activities & Amenities
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Experience the best of coastal Portugal with our curated selection of activities and amenities
            </p>
          </div>

          <CardGrid
            items={experiencesPageContent.experiences.map(experience => ({
              title: experience.title,
              image: experience.image,
              description: experience.category || 'Explore this amazing activity'
            }))}
            columns={4}
          />
        </div>
      </section>

      {/* Heiwa Play Section */}
      <section id="play" className="py-section-y bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-6">
                Heiwa Play
              </h2>
              <p className="text-lg text-muted mb-6">
                Unleash your inner child and discover the playful side of coastal living.
                From beach volleyball to creative workshops, find joy in the simple pleasures
                that make Heiwa House special.
              </p>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Beach games and water sports</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Creative workshops and art sessions</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Community gatherings and celebrations</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-surface-alt rounded-card overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <span className="text-lg">Play Activities Gallery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heiwa Flow Section */}
      <section id="flow" className="py-section-y bg-surface-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/3] bg-surface rounded-card overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <span className="text-lg">Flow Activities Gallery</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-6">
                Heiwa Flow
              </h2>
              <p className="text-lg text-muted mb-6">
                Find your rhythm and embrace the natural flow of coastal life.
                Our wellness activities help you connect with your inner peace while
                enjoying the beauty of the Atlantic coast.
              </p>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Yoga and meditation sessions</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Sauna and wellness treatments</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Mindful nature walks and contemplation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}