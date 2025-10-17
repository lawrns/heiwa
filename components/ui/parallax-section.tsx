'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxSectionProps {
  children: React.ReactNode
  offset?: number
  className?: string
}

export function ParallaxSection({
  children,
  offset = 50,
  className = '',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [elementTop, setElementTop] = useState<number>(0)
  const { scrollY } = useScroll()

  useEffect(() => {
    const element = ref.current
    if (element) {
      setElementTop(element.offsetTop)
    }
  }, [])

  const y = useTransform(scrollY, [elementTop - 500, elementTop + 500], [offset, -offset])

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
