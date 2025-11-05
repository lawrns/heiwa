'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

interface FadeInSectionProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeInSection({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = ''
}: FadeInSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            delay,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
