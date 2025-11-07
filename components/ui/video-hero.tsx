'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Bed } from 'lucide-react'
import { GoogleRatingSummary } from './google-reviews'
import { ScrollIndicator } from './scroll-indicator'

interface VideoHeroProps {
  videoSrc: string
  posterImage?: string
  title: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
  showRating?: boolean
  showScrollIndicator?: boolean
}

export function VideoHero({
  videoSrc,
  posterImage,
  title,
  subtitle,
  ctaText = 'Explore surf weeks',
  ctaHref = '/surf-weeks',
  showRating = true,
  showScrollIndicator = true,
}: VideoHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollY } = useScroll()
  const yOffset = useTransform(scrollY, [0, 500], [0, 150])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: 'easeOut',
      },
    }),
  }

  const subtitleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5,
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.7,
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  }

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterImage}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay - animated from dark to transparent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"
      />

      {/* Hero Content */}
      <motion.div
        style={{ y: yOffset }}
        className="relative h-full flex items-center justify-center text-center px-4"
      >
        <div className="max-w-4xl">
          {/* Animated Title */}
          <motion.h1
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            custom={0}
            variants={titleVariants}
            className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg"
          >
            {title}
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.p
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            variants={subtitleVariants}
            className="text-xl md:text-2xl text-white/90 mb-6 drop-shadow-md"
          >
            {subtitle}
          </motion.p>

          {/* Google Rating */}
          {showRating && (
            <motion.div
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              variants={subtitleVariants}
              className="flex justify-center mb-6"
            >
              <GoogleRatingSummary className="text-white/90" />
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            variants={ctaVariants}
            whileHover="hover"
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white"
              style={{ backgroundColor: '#ec681c' }}
            >
              <Bed className="w-5 h-5" />
              {ctaText}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      {showScrollIndicator && <ScrollIndicator />}
    </section>
  )
}
