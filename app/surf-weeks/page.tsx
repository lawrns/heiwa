import { Metadata } from 'next'
import { VideoEmbed } from '@/components/video-embed'
import { BookingWidget } from '@/components/booking-widget'
import { surfWeeksPageContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Surf Weeks - Professional Surf Training Program',
  description: 'Join our comprehensive surf training program at Heiwa House. Professional instruction for all skill levels with beachside accommodation.',
}

export default function SurfWeeksPage() {
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
            Surf Weeks
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto">
            Professional surf instruction for all skill levels with beachside accommodation
          </p>
        </div>
      </section>

      {/* Program Introduction */}
      <section className="py-section-y bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-6">
              Master the Waves
            </h2>
            <p className="text-lg text-muted mb-8">
              Our comprehensive surf training program combines expert instruction with the perfect coastal environment.
              Whether you're a complete beginner or looking to refine your technique, our experienced instructors
              will help you progress safely and confidently.
            </p>
          </div>

          {/* Program Video */}
          <div className="mb-12">
            <VideoEmbed
              src={surfWeeksPageContent.videoEmbed.src}
              provider={surfWeeksPageContent.videoEmbed.provider}
              poster={surfWeeksPageContent.videoEmbed.poster}
              title="Heiwa House Surf Weeks Program"
              className="max-w-4xl mx-auto"
            />
          </div>

          {/* Program Features */}
          {surfWeeksPageContent.program && (
            <div className="bg-surface-alt rounded-card p-8">
              <h3 className="text-2xl font-heading font-semibold text-text mb-6 text-center">
                {surfWeeksPageContent.program.title}
              </h3>
              <p className="text-muted text-lg mb-8 text-center max-w-2xl mx-auto">
                {surfWeeksPageContent.program.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surfWeeksPageContent.program.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-3 mr-4 flex-shrink-0"></span>
                    <span className="text-muted">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-4">
              What You&apos;ll Learn
            </h2>
            <p className="text-lg text-muted">
              Our structured curriculum covers everything from basics to advanced techniques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface rounded-card p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-on-primary font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Wave Knowledge
              </h3>
              <p className="text-muted text-sm">
                Understanding wave patterns, tides, and ocean safety
              </p>
            </div>

            <div className="bg-surface rounded-card p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-on-primary font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Board Control
              </h3>
              <p className="text-muted text-sm">
                Paddling, positioning, and board handling techniques
              </p>
            </div>

            <div className="bg-surface rounded-card p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-on-primary font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Wave Riding
              </h3>
              <p className="text-muted text-sm">
                Catching waves, maintaining balance, and carving turns
              </p>
            </div>

            <div className="bg-surface rounded-card p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-on-primary font-bold text-lg">4</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Advanced Skills
              </h3>
              <p className="text-muted text-sm">
                Maneuvers, etiquette, and reading the ocean like a local
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-section-y bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-4">
              Book Your Surf Week
            </h2>
            <p className="text-lg text-muted">
              Join our next surf training program and transform your surfing experience
            </p>
          </div>

          <BookingWidget
            title="Surf Week Booking"
            className="max-w-2xl mx-auto"
          />

          <div className="text-center mt-8">
            <p className="text-muted text-sm">
              Questions about our surf program? Contact us at{' '}
              <a
                href="mailto:info@heiwahouse.com"
                className="text-primary hover:underline"
              >
                info@heiwahouse.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-6">
            Meet Your Instructors
          </h2>
          <p className="text-lg text-muted mb-12">
            Learn from experienced surfers who are passionate about sharing their knowledge
            and helping you discover the joy of riding waves.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-on-primary text-2xl font-bold">P</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Professional Instruction
              </h3>
              <p className="text-muted text-sm">
                ISA certified instructors with years of teaching experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-on-primary text-2xl font-bold">S</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Small Groups
              </h3>
              <p className="text-muted text-sm">
                Maximum 6 students per instructor for personalized attention
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-on-primary text-2xl font-bold">L</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-text mb-2">
                Local Knowledge
              </h3>
              <p className="text-muted text-sm">
                Deep understanding of local breaks and wave conditions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
