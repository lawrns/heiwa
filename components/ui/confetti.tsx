/**
 * Confetti Celebration Component
 * Airbnb-quality celebration animation for booking success
 * 
 * Requirements: 10.1
 * - Triggers on booking success
 * - Respects prefers-reduced-motion preference
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ConfettiPiece {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  size: number
  rotation: number
}

interface ConfettiProps {
  /** Whether to show the confetti animation */
  isActive?: boolean
  /** Number of confetti pieces */
  count?: number
  /** Duration of the animation in ms */
  duration?: number
  /** Colors for confetti pieces */
  colors?: string[]
  /** Callback when animation completes */
  onComplete?: () => void
  className?: string
}

// Default celebration colors (Heiwa brand + festive)
const DEFAULT_COLORS = [
  '#ec681c', // Heiwa orange
  '#f97316', // Orange
  '#22c55e', // Green (success)
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#ec4899', // Pink
  '#8b5cf6', // Purple
]

/**
 * Confetti component for celebration animations
 * Automatically respects prefers-reduced-motion
 */
export function Confetti({
  isActive = false,
  count = 50,
  duration = 3000,
  colors = DEFAULT_COLORS,
  onComplete,
  className,
}: ConfettiProps) {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  // Check for reduced motion preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Generate confetti pieces when active
  React.useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      setPieces([])
      return
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position (%)
      delay: Math.random() * 500, // Random delay (ms)
      duration: duration + Math.random() * 1000, // Varied duration
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8, // 8-16px
      rotation: Math.random() * 360, // Random initial rotation
    }))

    setPieces(newPieces)

    // Clear pieces and call onComplete after animation
    const timeout = setTimeout(() => {
      setPieces([])
      onComplete?.()
    }, duration + 1500)

    return () => clearTimeout(timeout)
  }, [isActive, count, duration, colors, onComplete, prefersReducedMotion])

  // Don't render anything if reduced motion is preferred
  if (prefersReducedMotion || pieces.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none overflow-hidden z-[100000]',
        className
      )}
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${piece.x}%`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Success Burst - A simpler celebration effect
 * Shows expanding rings from center
 */
export function SuccessBurst({
  isActive = false,
  className,
}: {
  isActive?: boolean
  className?: string
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (!isActive || prefersReducedMotion) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center pointer-events-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-16 h-16 rounded-full border-4 border-success/30 animate-ping"
          style={{
            animationDelay: `${i * 200}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
