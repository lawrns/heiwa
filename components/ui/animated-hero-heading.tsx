'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedHeroHeadingProps {
  text: string
  className?: string
}

export function AnimatedHeroHeading({ text, className = '' }: AnimatedHeroHeadingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const characters = text.split('')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  }

  const characterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={characterVariants}
          transition={{ duration: 0.3 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  )
}
