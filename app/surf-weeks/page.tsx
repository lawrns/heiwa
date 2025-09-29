import { Metadata } from 'next'
import Image from 'next/image'
import { Play } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Surf Camp in Santa Cruz, Portugal - Learn Surfing With Heiwa',
  description: 'We strive to deliver an unforgettable surf camp experience both in and out of the water. Join us for surf, yoga, amazing food, skateboarding, and more.',
}

export default function SurfWeeksPage() {
  // Gallery images
  const galleryImages = [
    '/images/DSC03081-scaled.jpg',
    '/images/DSF8322-scaled.jpg',
    '/images/DSC03521-scaled.jpg',
    '/images/DSC08600-scaled.jpg',
    '/images/DSC02099-scaled.jpg',
    '/images/DSF8619-scaled.jpg',
    '/images/DSF8554-scaled.jpg',
    '/images/DSF8298-scaled.jpg',
    '/images/003844190021-scaled.jpg',
    '/images/DSC02767-scaled.jpg',
    '/images/DSF8812-scaled.jpg',
    '/images/DSC03530-scaled.jpg',
    '/images/DSC08054-scaled.jpg',
    '/images/DSC08736-scaled.jpg',
    '/images/DSF8018-2-scaled.jpg',
    '/images/DSC04325.jpg',
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Page Title */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-text">Surf Camp</h1>
        </div>
      </div>

      {/* Hero Quote Section */}
      <section className="py-section-y bg-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h5 className="text-xl md:text-2xl text-center text-text-muted leading-relaxed max-w-4xl mx-auto">
            We strive to deliver an unforgettable surf camp experience both in and out of the water. 
            Even if surfing were taken out of the week, it would still be worth your while—amazing food, 
            yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and 
            the surfing? That's going to be awesome too 🙂
          </h5>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-card group cursor-pointer max-w-4xl mx-auto">
            <Image
              src="/images/surf-weeks-front-page.jpg"
              alt="Surf Weeks Video"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <a
                href="https://youtu.be/9nhQiKGsgHg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-24 h-24 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Play video"
              >
                <Play className="w-10 h-10 text-accent ml-2" fill="currentColor" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-section-y bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-image overflow-hidden group cursor-pointer"
              >
                <Image
                  src={image}
                  alt={`Surf Week ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-surface-alt">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl text-text-muted">
            *prices starting <span className="font-bold text-accent">450€</span>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-y bg-primary text-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Book your surf week experience and discover the perfect blend of adventure, relaxation, 
            and community on Portugal's beautiful coast.
          </p>
          <button className="btn-primary bg-white text-primary hover:bg-surface-alt">
            Check Availability
          </button>
        </div>
      </section>
    </div>
  )
}