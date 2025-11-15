'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BookNowButtonProps {
  className?: string
  fullWidth?: boolean
}

export function BookNowButton({ className, fullWidth = false }: BookNowButtonProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Compute className consistently
  const buttonClassName = React.useMemo(() => {
    const classes = ["font-semibold", "hover:scale-105"]
    if (fullWidth) {
      classes.push("w-full")
    }
    if (className) {
      classes.push(className)
    }
    return cn(...classes)
  }, [fullWidth, className])

  return (
    <Button 
      size="lg"
      className={buttonClassName}
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
