'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Lightbox } from './lightbox'

interface PhotographyImage {
  src: string
  alt: string
  category: 'landscape' | 'lifestyle' | 'events' | 'drone'
  title?: string
  description?: string
}

interface PhotographyGalleryProps {
  images: PhotographyImage[]
  title?: string
  description?: string
}

const categoryLabels = {
  landscape: 'Landscape',
  lifestyle: 'Lifestyle',
  events: 'Events',
  drone: 'Drone',
}

export function PhotographyGallery({
  images,
  title = 'Photography Gallery',
  description = 'Explore our professional photography collection',
}: PhotographyGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const categories = Array.from(new Set(images.map((img) => img.category)))
  const filteredImages = selectedCategory
    ? images.filter((img) => img.category === selectedCategory)
    : images

  const handleImageClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-lg text-gray-600">{description}</p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            selectedCategory === null
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </motion.button>

        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === category
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {categoryLabels[category as keyof typeof categoryLabels]}
          </motion.button>
        ))}
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
      >
        {filteredImages.map((image, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="break-inside-avoid"
            onClick={() => handleImageClick(index)}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-lg cursor-pointer group"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Hover Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4"
              >
                <div className="text-center">
                  {image.title && (
                    <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
                  )}
                  <p className="text-sm text-gray-200">Click to view</p>
                </div>
              </motion.div>

              {/* Category Badge */}
              <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {categoryLabels[image.category as keyof typeof categoryLabels]}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <Lightbox
        images={filteredImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-600 text-lg">
            No images found in this category
          </p>
        </motion.div>
      )}
    </section>
  )
}
