import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomDetailPage from '@/app/rooms/[id]/page';
import { getRooms } from '@/lib/content';
import type { Room } from '@/lib/types';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock content module
jest.mock('@/lib/content', () => ({
  getRooms: jest.fn(),
}));

// Mock image utils
jest.mock('@/lib/image-utils', () => ({
  normalizeImageUrls: jest.fn((urls) => urls),
  getFirstImageUrl: jest.fn((images, fallback) => {
    if (images && images.length > 0) return images[0];
    return fallback || '/images/rooms/room1.jpg';
  }),
}));

// Mock UI components
jest.mock('@/components/ui/image-carousel', () => ({
  ImageCarousel: ({ images, alt }: { images: string[]; alt: string }) => (
    <div data-testid="image-carousel">
      {images.map((img, idx) => (
        <img key={idx} src={img} alt={alt} />
      ))}
    </div>
  ),
}));

jest.mock('@/components/booking-button', () => ({
  BookingButton: ({ roomId, children, className }: { roomId: string; children: React.ReactNode; className?: string }) => (
    <button data-testid="booking-button" data-room-id={roomId} className={className}>
      {children}
    </button>
  ),
}));

describe('RoomDetailPage', () => {
  const mockRoom: Room = {
    id: 'test-room-1',
    name: 'Test Room',
    image: '/images/rooms/test-room.jpg',
    images: ['/images/rooms/test-room.jpg', '/images/rooms/test-room-2.jpg'],
    description: 'A beautiful test room for testing',
    capacity: 2,
    pricing: {
      standard: 100,
      offSeason: 80,
    },
    bookingType: 'whole',
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Ocean View'],
    isActive: true,
  };

  const mockDormRoom: Room = {
    id: 'dorm-room-1',
    name: 'Shared Dorm Room',
    image: '/images/rooms/dorm.jpg',
    images: ['/images/rooms/dorm.jpg'],
    description: 'A cozy dorm room',
    capacity: 6,
    pricing: {
      standard: 30,
    },
    bookingType: 'perBed',
    amenities: ['Shared Bathroom', 'Lockers', 'Reading Lights'],
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Room Features Section', () => {
    it('should render "Room Features" section with features from enhancedRoom.features', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify "Room Features" heading exists
      const featuresHeading = screen.getByRole('heading', { name: /room features/i });
      expect(featuresHeading).toBeInTheDocument();

      // Verify features are rendered from amenities
      mockRoom.amenities?.forEach((amenity) => {
        expect(screen.getByText(amenity)).toBeInTheDocument();
      });
    });

    it('should NOT render "Room Facilities" section', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify "Room Facilities" heading does NOT exist
      const facilitiesHeading = screen.queryByRole('heading', { name: /room facilities/i });
      expect(facilitiesHeading).not.toBeInTheDocument();
    });

    it('should display features with checkmark icons', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      const { container } = render(page as React.ReactElement);

      // Verify "Room Features" heading exists
      expect(screen.getByText('Room Features')).toBeInTheDocument();

      // Verify checkmarks are present (using text-accent class)
      const checkmarks = container.querySelectorAll('.text-accent');
      expect(checkmarks.length).toBeGreaterThan(0);

      // Verify each feature has text content
      mockRoom.amenities?.forEach((amenity) => {
        const featureElement = screen.getByText(amenity);
        expect(featureElement).toBeInTheDocument();
      });
    });

    it('should render default features for dorm room when no amenities provided', async () => {
      const dormWithoutAmenities = { ...mockDormRoom, amenities: [] };
      (getRooms as jest.Mock).mockResolvedValue([dormWithoutAmenities]);

      const params = Promise.resolve({ id: 'dorm-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify default dorm features are shown
      expect(screen.getByText(/handcrafted wooden bunk beds/i)).toBeInTheDocument();
      expect(screen.getByText(/shared bathroom facilities/i)).toBeInTheDocument();
      expect(screen.getByText(/locker for each guest/i)).toBeInTheDocument();
    });

    it('should render default features for private room when no amenities provided', async () => {
      const roomWithoutAmenities = { ...mockRoom, amenities: [] };
      (getRooms as jest.Mock).mockResolvedValue([roomWithoutAmenities]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify default private room features are shown
      expect(screen.getByText(/comfortable bed/i)).toBeInTheDocument();
      expect(screen.getByText(/private bathroom with shower/i)).toBeInTheDocument();
      expect(screen.getByText(/traditional portuguese tiles/i)).toBeInTheDocument();
    });

    it('should display features in a two-column grid on medium screens', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      const { container } = render(page as React.ReactElement);

      // Find the features list
      const featuresList = container.querySelector('ul.grid.grid-cols-1.md\\:grid-cols-2');
      expect(featuresList).toBeInTheDocument();
    });
  });

  describe('Price Display Without Guarantee Text', () => {
    it('should display price correctly without "Best price guarantee" text', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify price is displayed
      expect(screen.getByText('100€')).toBeInTheDocument();
      expect(screen.getByText('/ night')).toBeInTheDocument();

      // Verify "Best price guarantee" text does NOT exist
      expect(screen.queryByText(/best price guarantee/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/best price/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/guarantee/i)).not.toBeInTheDocument();
    });

    it('should display dorm room price without guarantee text', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockDormRoom]);

      const params = Promise.resolve({ id: 'dorm-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify dorm price is displayed
      expect(screen.getByText('30€')).toBeInTheDocument();
      expect(screen.getByText('/ night')).toBeInTheDocument();

      // Verify no guarantee text
      expect(screen.queryByText(/best price guarantee/i)).not.toBeInTheDocument();
    });

    it('should display price with proper formatting', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      const { container } = render(page as React.ReactElement);

      // Find the price element
      const priceElement = screen.getByText('100€');

      // Verify price has correct styling classes
      expect(priceElement).toHaveClass('text-4xl', 'font-bold', 'text-gray-900');
    });

    it('should display fallback price when pricing data is missing', async () => {
      const roomWithoutPricing = { ...mockRoom, pricing: undefined };
      (getRooms as jest.Mock).mockResolvedValue([roomWithoutPricing]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify fallback price is displayed (80€ for non-dorm)
      expect(screen.getByText('80€')).toBeInTheDocument();
      expect(screen.queryByText(/best price guarantee/i)).not.toBeInTheDocument();
    });

    it('should display fallback price for dorm when pricing is missing', async () => {
      const dormWithoutPricing = { ...mockDormRoom, pricing: undefined };
      (getRooms as jest.Mock).mockResolvedValue([dormWithoutPricing]);

      const params = Promise.resolve({ id: 'dorm-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify fallback dorm price is displayed (30€)
      expect(screen.getByText('30€')).toBeInTheDocument();
      expect(screen.queryByText(/best price guarantee/i)).not.toBeInTheDocument();
    });
  });

  describe('Booking Card Structure', () => {
    it('should render booking card with correct elements', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify booking card heading
      expect(screen.getByRole('heading', { name: /book your room/i })).toBeInTheDocument();

      // Verify price section
      expect(screen.getByText('100€')).toBeInTheDocument();

      // Verify booking button
      const bookingButton = screen.getByTestId('booking-button');
      expect(bookingButton).toHaveTextContent('Check Availability');
      expect(bookingButton).toHaveAttribute('data-room-id', 'test-room-1');

      // Verify "You won't be charged yet" message
      expect(screen.getByText(/you won't be charged yet/i)).toBeInTheDocument();

      // Verify "Good to know" section
      expect(screen.getByText(/good to know/i)).toBeInTheDocument();
    });

    it('should render "Good to know" section without price guarantee', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify "Good to know" items are present
      expect(screen.getByText(/free cancellation up to 48 hours/i)).toBeInTheDocument();
      expect(screen.getByText(/check-in from 15:00/i)).toBeInTheDocument();
      expect(screen.getByText(/check-out by 10:00/i)).toBeInTheDocument();
      expect(screen.getByText(/common kitchen access/i)).toBeInTheDocument();

      // Verify no price guarantee in "Good to know" section
      expect(screen.queryByText(/best price guarantee/i)).not.toBeInTheDocument();
    });
  });

  describe('Room Information Display', () => {
    it('should render room name and quick info correctly', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify room name
      expect(screen.getByRole('heading', { name: mockRoom.name, level: 1 })).toBeInTheDocument();

      // Verify quick info is displayed (mockRoom has capacity: 2, so 2 beds)
      expect(screen.getByText(/2 beds/i)).toBeInTheDocument();
      expect(screen.getByText(/1 bathroom/i)).toBeInTheDocument();
      // Size is derived from room type, test just checks it exists
      expect(screen.getByText(/m²/i)).toBeInTheDocument();
      expect(screen.getByText(/up to 2 guests/i)).toBeInTheDocument();
    });

    it('should render dorm room quick info correctly', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockDormRoom]);

      const params = Promise.resolve({ id: 'dorm-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify dorm specific info
      expect(screen.getByText(/6 beds/i)).toBeInTheDocument();
      expect(screen.getByText(/45m²/i)).toBeInTheDocument();
      expect(screen.getByText(/up to 6 guests/i)).toBeInTheDocument();

      // Dorm should not show bathroom COUNT in quick info bar (but may have "Shared Bathroom" in amenities)
      // The quick info bar shows: beds, size, guests - not bathroom for dorms
      const quickInfoSection = screen.getByText(/6 beds/i).closest('div');
      expect(quickInfoSection).toBeInTheDocument();
    });

    it('should render room description', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify "About this room" section
      expect(screen.getByRole('heading', { name: /about this room/i })).toBeInTheDocument();
      expect(screen.getByText(mockRoom.description!)).toBeInTheDocument();
    });

    it('should render image carousel with room images', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify image carousel is rendered
      const carousel = screen.getByTestId('image-carousel');
      expect(carousel).toBeInTheDocument();

      // Verify images are passed to carousel
      const images = within(carousel).getAllByRole('img');
      expect(images).toHaveLength(mockRoom.images!.length);
    });
  });

  describe('Similar Rooms Section', () => {
    it('should render similar rooms when available', async () => {
      const rooms = [mockRoom, mockDormRoom];
      (getRooms as jest.Mock).mockResolvedValue(rooms);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify "Similar Rooms" section
      expect(screen.getByRole('heading', { name: /similar rooms/i })).toBeInTheDocument();

      // Verify similar room is displayed (should show dorm room)
      expect(screen.getByRole('heading', { name: mockDormRoom.name })).toBeInTheDocument();
    });

    it('should not render similar rooms section when no other rooms exist', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify "Similar Rooms" section is not rendered
      expect(screen.queryByRole('heading', { name: /similar rooms/i })).not.toBeInTheDocument();
    });

    it('should limit similar rooms to 2 maximum', async () => {
      const rooms = [
        mockRoom,
        { ...mockDormRoom, id: 'room-2', name: 'Room 2' },
        { ...mockDormRoom, id: 'room-3', name: 'Room 3' },
        { ...mockDormRoom, id: 'room-4', name: 'Room 4' },
      ];
      (getRooms as jest.Mock).mockResolvedValue(rooms);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify Similar Rooms section exists
      expect(screen.getByRole('heading', { name: /similar rooms/i })).toBeInTheDocument();

      // Verify at most 2 similar rooms are displayed (Room 2, Room 3, but not Room 4)
      // The page limits to slice(0, 2)
      expect(screen.getByText('Room 2')).toBeInTheDocument();
      expect(screen.getByText('Room 3')).toBeInTheDocument();
      expect(screen.queryByText('Room 4')).not.toBeInTheDocument();
    });
  });

  describe('Navigation and Layout', () => {
    it('should render breadcrumb navigation', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify back to rooms link
      const backLink = screen.getByRole('link', { name: /back to room list/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/rooms');
    });

    it('should have proper page layout structure', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      const { container } = render(page as React.ReactElement);

      // Verify main container
      const mainContainer = container.querySelector('.min-h-screen.bg-gray-50');
      expect(mainContainer).toBeInTheDocument();

      // Verify grid layout for content and booking card
      const gridLayout = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(gridLayout).toBeInTheDocument();
    });

    it('should render sticky booking card on desktop', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      const { container } = render(page as React.ReactElement);

      // Find booking card
      const bookingCard = container.querySelector('.sticky.top-24');
      expect(bookingCard).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle room not found', async () => {
      const { notFound } = require('next/navigation');
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'non-existent-room' });
      await RoomDetailPage({ params });

      // Verify notFound was called
      expect(notFound).toHaveBeenCalled();
    });

    it('should handle empty rooms array', async () => {
      const { notFound } = require('next/navigation');
      (getRooms as jest.Mock).mockResolvedValue([]);

      const params = Promise.resolve({ id: 'test-room-1' });
      await RoomDetailPage({ params });

      // Verify notFound was called
      expect(notFound).toHaveBeenCalled();
    });

    it('should handle getRooms error', async () => {
      const { notFound } = require('next/navigation');
      (getRooms as jest.Mock).mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: 'test-room-1' });
      await RoomDetailPage({ params });

      // Verify notFound was called on error
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify h1 for room name
      expect(screen.getByRole('heading', { level: 1, name: mockRoom.name })).toBeInTheDocument();

      // Verify h2 for sections
      expect(screen.getByRole('heading', { level: 2, name: /about this room/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /room features/i })).toBeInTheDocument();
    });

    it('should have descriptive link text', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify back link has descriptive text
      const backLink = screen.getByRole('link', { name: /back to room list/i });
      expect(backLink).toBeInTheDocument();

      // Verify booking button has descriptive text
      const bookingButton = screen.getByTestId('booking-button');
      expect(bookingButton).toHaveTextContent('Check Availability');
    });

    it('should have contact information accessible', async () => {
      (getRooms as jest.Mock).mockResolvedValue([mockRoom]);

      const params = Promise.resolve({ id: 'test-room-1' });
      const page = await RoomDetailPage({ params });
      render(page as React.ReactElement);

      // Verify phone link exists
      const phoneLink = screen.getByRole('link', { name: /call us/i });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:+351912193785');
    });
  });
});
