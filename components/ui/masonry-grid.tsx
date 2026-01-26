'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MasonryGridProps {
  children: ReactNode[]
  columns?: number
  gap?: number
}

export function MasonryGrid({
  children,
  columns = 3,
  gap = 6,
}: MasonryGridProps) {
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

  const gridColsClass = {
    2: 'md:columns-2',
    3: 'md:columns-3',
    4: 'md:columns-4',
  }[columns] || 'md:columns-3'

  const gapClass = {
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  }[gap] || 'gap-6'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className={`columns-1 ${gridColsClass} ${gapClass} space-y-${gap}`}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="break-inside-avoid"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
