'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { AvailabilityBadge } from './availability-badge'

interface ActivityCardEnhancedProps {
  title: string
  description: string
  image: string
  href: string
  index?: number
  availabilityTier?: 'always' | 'on-request'
}

export function ActivityCardEnhanced({
  title,
  description,
  image,
  href,
  index = 0,
  availabilityTier,
}: ActivityCardEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.6,
      },
    },
  }

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.4 } },
  }

  const overlayVariants = {
    initial: { opacity: 0.6 },
    hover: { opacity: 0.8, transition: { duration: 0.3 } },
  }

  const contentVariants = {
    initial: { y: 0, opacity: 1 },
    hover: { y: -10, opacity: 1, transition: { duration: 0.3 } },
  }

  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-80 rounded-xl overflow-hidden shadow-lg group cursor-pointer"
    >
      {/* Background Image */}
      <motion.div
        variants={imageVariants}
        initial="initial"
        animate={isHovered ? 'hover' : 'initial'}
        className="absolute inset-0"
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        variants={overlayVariants}
        initial="initial"
        animate={isHovered ? 'hover' : 'initial'}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      />

      {/* Content */}
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate={isHovered ? 'hover' : 'initial'}
        className="absolute inset-0 flex flex-col justify-end p-6 text-white"
      >
        
        {/* Title */}
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>

        {/* Description */}
        <p className="text-sm text-white/80 mb-3 line-clamp-2 text-white">
          {description}
        </p>

        {/* Availability */}
        {availabilityTier && (
          <div className="mb-4">
            <AvailabilityBadge tier={availabilityTier} className="scale-90 origin-left" />
          </div>
        )}

        {/* CTA */}
        <div className={`transition-all duration-300 ease ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-orange-400 font-semibold hover:text-orange-300 transition-colors"
          >
            Learn more
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Border on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 border-2 border-orange-400 rounded-xl pointer-events-none"
      />
    </motion.div>
  )
}
