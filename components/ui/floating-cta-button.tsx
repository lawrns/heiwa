'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export function FloatingCTAButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past hero (approximately 500px)
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href="/surf-weeks"
        className="inline-flex items-center gap-2 px-6 py-4 bg-accent text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-dark focus-visible:ring-offset-2 min-h-[44px]"
      >
        <Calendar className="w-5 h-5" />
        <span>Book Now</span>
      </Link>

      {/* Pulsing dot indicator */}
      <motion.div
        className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}
