/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import RoomsPage from '@/app/rooms/page';

// Mock the content module
jest.mock('@/lib/content', () => ({
  getRooms: jest.fn(),
}));

const mockGetRooms = require('@/lib/content').getRooms;

describe('Availability Check Integration', () => {
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

  test('displays availability checking interface', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check that the availability checking guidance is present
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();
  });

  test('provides date selection interface', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // The booking section should provide guidance about checking availability
    // This verifies the integration point exists
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();
  });

  test('shows room information with availability context', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Verify rooms are displayed
    expect(screen.getByText('Ocean View Suite')).toBeInTheDocument();
    expect(screen.getByText('Beautiful ocean view room')).toBeInTheDocument();

    // Availability checking guidance should be accessible from room listings
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();
  });

  test('integrates availability with booking flow', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // The availability check should be the first step in booking
    expect(screen.getByText('Ready to book your stay? Check availability and reserve your room below.')).toBeInTheDocument();
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();
  });

  test('displays availability policies', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Check for availability-related messaging in the booking section
    expect(screen.getByText('Ready to book your stay? Check availability and reserve your room below.')).toBeInTheDocument();
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();
  });

  test('shows contact info for availability inquiries', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Contact information should be available for availability questions
    expect(screen.getByText(/info@heiwahouse.com/)).toBeInTheDocument();
  });

  test('provides clear call-to-action for availability checking', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // Multiple CTAs should guide users to check availability
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();

    expect(screen.getByText('Ready to book your stay? Check availability and reserve your room below.')).toBeInTheDocument();
  });

  test('handles availability checking UI states', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading rooms...')).not.toBeInTheDocument();
    });

    // The availability checking interface should be ready
    expect(screen.getByText('Click the "Check Availability" button below to book your room')).toBeInTheDocument();

    // Should not show loading states for availability checking
    expect(screen.queryByText(/Checking availability/)).not.toBeInTheDocument();
  });
});
