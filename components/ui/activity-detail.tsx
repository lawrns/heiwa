'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ImageGallery } from './image-gallery'

interface ActivityDetailProps {
  title: string
  description: string
  longDescription?: string
  heroImage: string
  galleryImages: Array<{
    src: string
    alt: string
    title?: string
  }>
  highlights?: string[]
  ctaText?: string
  ctaHref?: string
}

export function ActivityDetail({
  title,
  description,
  longDescription,
  heroImage,
  galleryImages,
  highlights,
  ctaText = 'Book Now',
  ctaHref = '/booking',
}: ActivityDetailProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl mb-12"
      >
        <Image
          src={heroImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-8 text-white"
        >
          <h1 className="text-5xl font-bold mb-2">{title}</h1>
          <p className="text-xl text-white/90">{description}</p>
        </motion.div>
      </motion.div>

      {/* Description Section */}
      {longDescription && (
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto mb-12"
        >
          <p className="text-lg text-gray-600 leading-relaxed">
            {longDescription}
          </p>
        </motion.div>
      )}

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg"
              >
                <span className="text-orange-500 font-bold text-xl flex-shrink-0">
                  ✓
                </span>
                <span className="text-gray-700">{highlight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gallery Section */}
      <motion.div
        variants={itemVariants}
        className="mb-12"
      >
        <ImageGallery
          images={galleryImages}
          title="Gallery"
          description="Explore our activity in action"
        />
      </motion.div>

      {/* CTA Section */}
      <motion.div
        variants={itemVariants}
        className="max-w-3xl mx-auto text-center py-12 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Experience This?
        </h2>
        <p className="text-gray-600 mb-6">
          Join us for an unforgettable experience at Heiwa House
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 text-white bg-orange-500 hover:bg-orange-600"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
