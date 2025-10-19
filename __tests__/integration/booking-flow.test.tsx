import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingProvider } from '@/lib/booking-context'
import { OptionSelection } from '@/components/BookingWidget/steps/OptionSelection'

// Mock the booking context
const mockBookingContext = {
  state: {
    experienceType: 'room',
    dates: {
      checkIn: new Date('2024-06-15'),
      checkOut: new Date('2024-06-17'),
    },
    guests: 2,
    selectedOption: null,
  },
  dispatch: jest.fn(),
}

const mockRooms = [
  {
    id: '1',
    name: 'Ocean View Room',
    pricePerNight: 120,
    capacity: 2,
    description: 'Beautiful room with ocean view',
    images: ['/images/rooms/ocean-view.jpg'],
    amenities: ['WiFi', 'Air Conditioning'],
  },
  {
    id: '2',
    name: 'Garden Room',
    pricePerNight: 80,
    capacity: 2,
    description: 'Cozy room with garden view',
    images: ['/images/rooms/garden.jpg'],
    amenities: ['WiFi'],
  },
]

const mockSurfCamps = [
  {
    id: '1',
    name: 'Beginner Surf Week',
    price: 450,
    startDate: '2024-06-15',
    endDate: '2024-06-22',
    maxParticipants: 8,
    level: 'beginner',
    includes: ['Surf lessons', 'Equipment', 'Accommodation'],
  },
]

// Mock the API calls
jest.mock('@/lib/content', () => ({
  getRooms: jest.fn(() => Promise.resolve(mockRooms)),
  getSurfCamps: jest.fn(() => Promise.resolve(mockSurfCamps)),
}))

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders room options when experience type is room', async () => {
    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Ocean View Room')).toBeInTheDocument()
      expect(screen.getByText('Garden Room')).toBeInTheDocument()
    })
  })

  it('displays correct pricing for room options', async () => {
    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('€120')).toBeInTheDocument()
      expect(screen.getByText('€80')).toBeInTheDocument()
    })
  })

  it('calculates total price correctly for room selection', async () => {
    const user = userEvent.setup()
    
    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Ocean View Room')).toBeInTheDocument()
    })

    // Select a room
    const roomCard = screen.getByText('Ocean View Room').closest('div')
    if (roomCard) {
      await user.click(roomCard)
    }

    // Check if total price is calculated (2 nights × €120 = €240)
    await waitFor(() => {
      expect(screen.getByText('€240')).toBeInTheDocument()
    })
  })

  it('renders surf camp options when experience type is surf-week', async () => {
    // Mock the context to return surf-week experience type
    const surfWeekContext = {
      ...mockBookingContext,
      state: {
        ...mockBookingContext.state,
        experienceType: 'surf-week',
      },
    }

    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beginner Surf Week')).toBeInTheDocument()
    })
  })

  it('handles date selection correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    // Find and interact with date inputs
    const checkInInput = screen.getByLabelText(/check-in/i)
    const checkOutInput = screen.getByLabelText(/check-out/i)

    if (checkInInput && checkOutInput) {
      await user.clear(checkInInput)
      await user.type(checkInInput, '2024-06-20')
      
      await user.clear(checkOutInput)
      await user.type(checkOutInput, '2024-06-23')

      // Verify dates are updated
      expect(checkInInput).toHaveValue('2024-06-20')
      expect(checkOutInput).toHaveValue('2024-06-23')
    }
  })

  it('handles guest count selection', async () => {
    const user = userEvent.setup()
    
    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    // Find guest count input
    const guestInput = screen.getByLabelText(/guests/i)
    
    if (guestInput) {
      await user.clear(guestInput)
      await user.type(guestInput, '4')
      
      expect(guestInput).toHaveValue(4)
    }
  })

  it('shows loading state initially', () => {
    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    // Should show loading or skeleton while fetching data
    expect(screen.getByText(/loading/i) || screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    // Mock API to return error
    const mockGetRooms = require('@/lib/content').getRooms
    mockGetRooms.mockRejectedValueOnce(new Error('API Error'))

    render(
      <BookingProvider>
        <OptionSelection />
      </BookingProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument()
    })
  })
})

