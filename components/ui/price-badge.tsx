import React from 'react'

interface PriceBadgeProps {
  price: number | string
  className?: string
}

// Subtle price badge matching original heiwahouse.com design
export function PriceBadge({ price, className = '' }: PriceBadgeProps) {
  return (
    <div 
      className={`absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded font-semibold ${className}`}
    >
      {price}€
    </div>
  )
}