'use client'

// import { useBooking } from '@/lib/booking-context'

interface BookingButtonProps {
  roomId?: string
  className?: string
  children: React.ReactNode
}

export function BookingButton({ roomId, className, children }: BookingButtonProps) {
  // const { openBooking } = useBooking()
  const openBooking = () => {}

  const handleClick = () => {
    openBooking()
    // If roomId is provided, could pre-select the room in the booking widget
    if (roomId) {
      // Trigger custom event for room pre-selection
      const event = new CustomEvent('selectRoom', { detail: { roomId } })
      window.dispatchEvent(event)
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
