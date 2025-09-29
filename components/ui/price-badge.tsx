import React from 'react'

interface PriceBadgeProps {
  price: number | string
  period?: string
  className?: string
}

export function PriceBadge({ price, period = 'Per Night', className = '' }: PriceBadgeProps) {
  return (
    <div 
      className={`absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-md ${className}`}
    >
      <div className="text-2xl font-bold">{price}€</div>
      <div className="text-xs uppercase tracking-wide opacity-90">{period}</div>
    </div>
  )
}
