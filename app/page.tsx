import { Metadata } from 'next'
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
        image={homePageContent.hero.backgroundImage}
        ctas={homePageContent.hero.cta}
      />

      {/* Three Cards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-normal text-text mb-6">
              Discover Heiwa
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Three ways to experience the ultimate coastal lifestyle at Heiwa House
            </p>
          </div>

          <CardGrid
            items={homePageContent.featureCards}
            columns={3}
            className="max-w-6xl mx-auto"
            priorityImages={3}
          />
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-heading font-normal text-text mb-6">
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

          <div className="text-center mt-12">
            <p className="text-muted text-sm mb-4">
              Ready to join the Heiwa community?
            </p>
            <a
              href="/surf-weeks"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-accent-hover text-white text-sm font-medium tracking-wide transition-colors"
            >
              Learn About Surf Weeks
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}