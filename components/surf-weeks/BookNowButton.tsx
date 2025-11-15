'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BookNowButtonProps {
  className?: string
  fullWidth?: boolean
}

export function BookNowButton({ className, fullWidth = false }: BookNowButtonProps) {
  return (
    <Button 
      size="lg"
      className={cn(
        "px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105",
        fullWidth && "w-full",
        className
      )}
      style={{ backgroundColor: '#ec681c' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65d16'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ec681c'}
      onClick={() => {
        // This will be handled by client-side component
        window.dispatchEvent(new CustomEvent('openBooking'))
      }}
    >
      Book Your Surf Week
    </Button>
  )
}
