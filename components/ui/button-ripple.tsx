'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface ButtonRippleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  rippleColor?: string
}

export function ButtonRipple({
  children,
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  className,
  ...props
}: ButtonRippleProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [nextId, setNextId] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = nextId
    setNextId(id + 1)
    setRipples((prev) => [...prev, { id, x, y }])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)

    props.onClick?.(e)
  }

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      {...props}
      onClick={handleClick}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            backgroundColor: rippleColor,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  )
}
