import React from 'react'
import { render } from '@testing-library/react'
import { BookingWidget } from '@/components/BookingWidget/BookingWidget'

// Mock the booking context
jest.mock('@/lib/booking-context', () => ({
  useBooking: () => ({
    openBooking: jest.fn(),
    isBookingOpen: true,
    closeBooking: jest.fn(),
    bookingData: null,
    updateBookingData: jest.fn()
  })
}))

describe('BookingWidget Component', () => {
  test('should render without crashing', () => {
    const { container } = render(<BookingWidget />)
    expect(container).toBeTruthy()
  })

  test('should render a React component', () => {
    const { container } = render(<BookingWidget />)
    // Check that something was rendered
    expect(container.innerHTML.length).toBeGreaterThan(0)
  })

  test('should have proper structure', () => {
    const { container } = render(<BookingWidget />)
    expect(container.firstChild).toBeTruthy()
  })

  test('should render without errors', () => {
    // This test verifies the component can be mounted without throwing
    expect(() => {
      render(<BookingWidget />)
    }).not.toThrow()
  })
})
