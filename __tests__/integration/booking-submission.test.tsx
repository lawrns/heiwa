/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomsPage from '@/app/rooms/page';

// Mock the content module
jest.mock('@/lib/content', () => ({
  getRooms: jest.fn(),
}));

const mockGetRooms = require('@/lib/content').getRooms;

describe('Booking Submission Integration', () => {
  const mockRooms = [
    {
      id: 'room-1',
      name: 'Ocean View Suite',
      image: '/images/rooms/ocean-view.jpg',
      description: 'Beautiful ocean view room'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRooms.mockResolvedValue(mockRooms);
  });

  test('displays booking-related UI elements', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check for booking-related text
    expect(screen.getByText('Ready to book your stay? Check availability and reserve your room below.')).toBeInTheDocument();
  });

  test('shows booking CTA in footer area', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // The booking CTA should be present (this tests the UI structure)
    // Note: The actual booking widget integration would be tested in the booking widget tests
    const bookingElements = screen.getAllByText(/book|Book|BOOK/i);
    expect(bookingElements.length).toBeGreaterThan(0);
  });

  test('integrates with floating booking widget', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check that the booking section guidance is present
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();
  });

  test('room page provides context for booking', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Verify rooms are displayed with booking context
    expect(screen.getByText('Ocean View Suite')).toBeInTheDocument();
    expect(screen.getByText('Beautiful ocean view room')).toBeInTheDocument();

    // Check for booking encouragement text
    expect(screen.getByText('Ready to book your stay? Check availability and reserve your room below.')).toBeInTheDocument();
  });

  test('handles booking flow initiation', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check that booking guidance is available
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();

    // Note: The actual booking modal opening would be tested in booking widget integration tests
    // This test verifies the UI integration point exists
  });

  test('displays contact information for booking help', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check for contact information
    expect(screen.getByText(/info@heiwahouse.com/)).toBeInTheDocument();
  });

  test('provides booking policies information', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check for booking policies section
    expect(screen.getByText('Booking Policies')).toBeInTheDocument();
    expect(screen.getByText('Free cancellation up to 48 hours before check-in')).toBeInTheDocument();
    expect(screen.getByText('Minimum 2-night stay required')).toBeInTheDocument();
  });

  test('shows amenities information', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check for amenities section
    expect(screen.getByText("What's Included")).toBeInTheDocument();
    expect(screen.getByText('Daily housekeeping service')).toBeInTheDocument();
    expect(screen.getByText('High-speed WiFi throughout the property')).toBeInTheDocument();
  });
});
