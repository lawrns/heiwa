'use client'

import { Button } from '@/components/ui/button'

export function BookNowButton() {
  return (
    <Button 
      size="lg"
      className="px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105"
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
