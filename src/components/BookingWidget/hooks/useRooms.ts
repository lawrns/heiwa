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

      // Always fetch real rooms from API
      // If no dates selected, fetch all rooms without availability filtering

      let apiUrl = '/api/wordpress/rooms';
      let params = new URLSearchParams();

      // If dates are selected, check availability
      if (checkIn && checkOut) {
        const startDate = checkIn.toISOString().split('T')[0];
        const endDate = checkOut.toISOString().split('T')[0];

        apiUrl = '/api/wordpress/rooms/availability';
        params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          guests: guests.toString(),
        });
      }

      // Try WordPress API (public endpoint)
      const response = await fetch(`${apiUrl}${params.toString() ? '?' + params.toString() : ''}`, {
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

      if (data.success && (data.data?.available_rooms || data.data?.rooms)) {
        // Handle both availability endpoint (available_rooms) and general rooms endpoint (rooms)
        const roomsData = data.data.available_rooms || data.data.rooms;

        // Transform WordPress API response to our Room interface
        const transformedRooms: Room[] = roomsData.map((room: any) => {
          // Determine room type based on booking type and capacity
          let roomType: 'private' | 'shared' | 'dorm';
          if (room.booking_type === 'perBed') {
            roomType = 'dorm';
          } else if (room.capacity === 1) {
            roomType = 'private';
          } else {
            roomType = 'shared';
          }

          return {
            id: room.id,
            name: room.name,
            description: room.description || '',
            type: roomType,
            maxOccupancy: room.capacity,
            pricePerNight: room.price_per_night,
            amenities: room.amenities || [],
            images: room.featured_image ? [room.featured_image] : [],
            isAvailable: true, // All returned rooms are available or shown
          };
        });

        setRooms(transformedRooms);
      } else {
        // If API returns no data, set empty array instead of mock data
        setRooms([]);
        setError('No rooms available');
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      // Set empty array instead of mock data
      setRooms([]);
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


