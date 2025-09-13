import { useState, useEffect } from 'react';
import { Room } from '../types';

interface UseRoomsParams {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
}

interface UseRoomsResult {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRooms({ checkIn, checkOut, guests }: UseRoomsParams): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Don't fetch if dates are not available
      if (!checkIn || !checkOut) {
        setRooms(getMockRooms());
        setLoading(false);
        return;
      }

      // Format dates for API
      const startDate = checkIn.toISOString().split('T')[0];
      const endDate = checkOut.toISOString().split('T')[0];
      
      // Build query parameters
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        guests: guests.toString(),
      });

      // Try WordPress API first (public endpoint)
      const response = await fetch(`/api/wordpress/rooms/availability?${params}`, {
        method: 'GET',
        headers: {
          'X-Heiwa-API-Key': 'heiwa_wp_test_key_2024_secure_deployment',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.available_rooms) {
        // Transform WordPress API response to our Room interface
        const transformedRooms: Room[] = data.data.available_rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          description: room.description || '',
          type: room.booking_type === 'perBed' ? 'dorm' : room.capacity === 1 ? 'private' : 'shared',
          maxOccupancy: room.capacity,
          pricePerNight: room.price_per_night,
          amenities: room.amenities || [],
          images: room.featured_image ? [room.featured_image] : [],
          isAvailable: true, // All returned rooms are available
        }));
        
        setRooms(transformedRooms);
      } else {
        // Fallback to mock data if API fails
        setRooms(getMockRooms());
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      // Fallback to mock data
      setRooms(getMockRooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut, guests]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
  };
}

// Mock data fallback
function getMockRooms(): Room[] {
  return [
    {
      id: 'room-1',
      name: 'Ocean View Private Room',
      description: 'Beautiful private room with stunning ocean views and private bathroom.',
      type: 'private',
      maxOccupancy: 2,
      pricePerNight: 89,
      amenities: ['Private Bathroom', 'Ocean View', 'Air Conditioning', 'WiFi'],
      images: ['/room1.jpg'],
      isAvailable: true,
    },
    {
      id: 'room-2',
      name: 'Shared Dormitory',
      description: 'Comfortable shared dormitory with 4 beds, perfect for budget travelers.',
      type: 'dorm',
      maxOccupancy: 4,
      pricePerNight: 35,
      amenities: ['Shared Bathroom', 'WiFi', 'Locker', 'Common Area'],
      images: ['/dorm.webp'],
      isAvailable: true,
    },
    {
      id: 'room-3',
      name: 'Garden Suite',
      description: 'Spacious suite with garden access and modern amenities.',
      type: 'private',
      maxOccupancy: 3,
      pricePerNight: 120,
      amenities: ['Private Bathroom', 'Garden Access', 'Kitchenette', 'WiFi'],
      images: ['/room2.webp'],
      isAvailable: true,
    },
  ];
}
