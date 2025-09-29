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
    <div className="min-h-screen pt-20 bg-white">
      {/* Simple Page Title */}
      <div className="py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Surf Camp</h1>
        </div>
      </div>

      {/* Hero Quote Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h5 className="text-xl md:text-2xl text-center text-gray-600 leading-relaxed">
            We strive to deliver an unforgettable surf camp experience both in and out of the water. 
            Even if surfing were taken out of the week, it would still be worth your while—amazing food, 
            yoga, music, skateboarding, games, exploring, relaxing, and simply enjoying life. Oh, and 
            the surfing? That's going to be awesome too 🙂
          </h5>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg group cursor-pointer">
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

      {/* Photo Gallery - Masonry Style */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden group cursor-pointer"
              >
                <Image
                  src={image}
                  alt={`Surf Week ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-600">
            *prices starting <span className="font-bold text-gray-900">450€</span>
          </p>
        </div>
      </section>
    </div>
  )
}