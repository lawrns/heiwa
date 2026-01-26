'use client'

import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedCounterProps {
  from: number
  to: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  from,
  to,
  duration = 2,
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    let animationFrameId: number

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      setCount(Math.floor(from + (to - from) * progress))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isInView, from, to, duration])

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
