import { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/hero'
import { CardGrid } from '@/components/card-grid'
import { VideoEmbed } from '@/components/video-embed'
import { homePageContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Home',
  description: homePageContent.hero.subtitle,
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        title={homePageContent.hero.title}
        subtitle={homePageContent.hero.subtitle}
        video={homePageContent.hero.video}
        image={homePageContent.hero.backgroundImage}
        ctas={homePageContent.hero.cta}
      />

      {/* Where Adventure Meets Tranquility Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <p className="text-xs sm:text-sm text-muted tracking-[0.3em] uppercase font-medium mb-6">
              ABOUT HEIWA HOUSE
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-light text-text mb-12 leading-tight">
              Where Adventure Meets Tranquility
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-center">
            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-8">
              Surf the waves, flow through yoga, and skate with freedom. Heiwa House is your
              sanctuary for connection, play, and self-discovery. Here, every experience is
              designed to help you embrace balance, fun, and the beauty of living in the moment.
            </p>
            
            <div className="space-y-6 text-base text-muted leading-relaxed">
              <p>You can book a room and enjoy everything the space has to offer.</p>
              <p>To join a group of like-minded people and have an all-inclusive experience, sign up for any of our dedicated surf weeks.</p>
              <p>We also offer the option to rent the space for your event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Cards Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CardGrid
            items={homePageContent.featureCards}
            columns={3}
            className="max-w-6xl mx-auto"
            priorityImages={3}
          />
        </div>
      </section>

      {/* Surf Weeks Section */}
      <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/surf-weeks.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm text-white/80 tracking-[0.3em] uppercase font-medium mb-6">
            ADVENTURE SURF & YOGA WEEKS
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-light mb-8 leading-tight">
            All-inclusive weeks with surf, yoga, great food, and coastal adventures.
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Prices starting from <span className="font-bold text-2xl">450€</span>
          </p>
          <a
            href="/surf-weeks"
            className="inline-flex items-center justify-center px-8 py-4 border border-white/80 hover:border-white text-white hover:bg-white/10 text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 backdrop-blur-sm"
          >
            DISCOVER OUR WEEKS
          </a>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs sm:text-sm text-muted tracking-[0.3em] uppercase font-medium mb-6">
              RUSTIC CHARM MEETS PORTUGUESE STYLE
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-light text-text mb-8 leading-tight">
              We would be honored to host you in one of our rooms.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-heading font-light mb-2">Room Nr 1</h3>
                <p className="text-sm opacity-90">Cozy and authentic</p>
              </div>
            </div>
            
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-heading font-light mb-2">Room Nr 2</h3>
                <p className="text-sm opacity-90">Spacious and serene</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/rooms"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-accent-hover text-white text-sm font-medium tracking-[0.15em] uppercase transition-colors"
            >
              VIEW ALL ROOMS
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities & Experiences Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Facilities */}
            <div>
              <h3 className="text-lg font-heading font-medium text-primary mb-8 tracking-[0.2em] uppercase">
                Facilities
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <span className="text-2xl">🏊‍♂️</span>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <span className="text-2xl">🛹</span>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <span className="text-2xl">🧘‍♀️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experiences */}
            <div>
              <h3 className="text-lg font-heading font-medium text-primary mb-8 tracking-[0.2em] uppercase">
                Experiences
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-2xl font-heading font-light mb-2">What to do in and around</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-3xl">🏄‍♂️</span>
                    </div>
                    <p className="text-sm font-medium">Surfing and lessons</p>
                  </div>
                  <div className="text-center">
                    <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-3xl">🛹</span>
                    </div>
                    <p className="text-sm font-medium">Skateboarding</p>
                  </div>
                  <div className="text-center">
                    <div className="aspect-[4/3] bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-3xl">🧘‍♀️</span>
                    </div>
                    <p className="text-sm font-medium">Yoga and spiritual practices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-light text-text mb-6">
              Experience Heiwa House
            </h2>
            <p className="text-lg text-muted">
              Watch our promotional video to see why Heiwa House is the perfect destination
            </p>
          </div>

          <VideoEmbed
            src={homePageContent.videoEmbed.src}
            provider={homePageContent.videoEmbed.provider}
            poster={homePageContent.videoEmbed.poster}
            title="Heiwa House Surf Weeks Promo"
            className="max-w-3xl mx-auto"
          />
        </div>
      </section>
    </div>
  )
}