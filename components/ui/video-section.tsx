'use client'

import { motion } from 'framer-motion'
import { VideoPlayer } from './video-player'

interface VideoSectionProps {
  title: string
  description?: string
  videos: Array<{
    src: string
    poster?: string
    title?: string
    description?: string
  }>
  layout?: 'single' | 'double' | 'triple'
}

export function VideoSection({
  title,
  description,
  videos,
  layout = 'single',
}: VideoSectionProps) {
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

  const getGridClass = () => {
    switch (layout) {
      case 'double':
        return 'grid-cols-1 md:grid-cols-2'
      case 'triple':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      default:
        return 'grid-cols-1'
    }
  }

  return (
    <section className="py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-6xl mx-auto px-4"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {description && (
            <p className="text-lg text-gray-600">{description}</p>
          )}
        </motion.div>

        {/* Videos Grid */}
        <motion.div
          className={`grid ${getGridClass()} gap-8`}
        >
          {videos.map((video, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <VideoPlayer
                src={video.src}
                poster={video.poster}
                title={video.title}
                description={video.description}
                autoPlay={false}
                controls={true}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
