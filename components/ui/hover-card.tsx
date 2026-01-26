'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface HoverCardProps {
  children: React.ReactNode
  className?: string
}

export function HoverCard({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}
