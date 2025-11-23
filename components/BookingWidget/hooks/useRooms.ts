import { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import { apiFetch } from '../lib/api';
import { transformApiRoomToRoom } from '@/lib/booking-utils';

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
  retryCount: number;
}

export function useRooms({ checkIn, checkOut, guests }: UseRoomsParams): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Create stable string representations of dates to prevent infinite loops
  // Convert dates to timestamps for stable comparison
  const checkInTime = checkIn?.getTime() ?? null;
  const checkOutTime = checkOut?.getTime() ?? null;

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch real rooms from API
      // If no dates selected, fetch all rooms without availability filtering

      let apiUrl = '/rooms';
      let params = new URLSearchParams();

      // If dates are selected, check availability
      if (checkInTime && checkOutTime) {
        const startDate = new Date(checkInTime).toISOString().split('T')[0];
        const endDate = new Date(checkOutTime).toISOString().split('T')[0];

        apiUrl = '/rooms/availability';
        params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          participants: guests.toString(),
        });
      }

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        // Try Next.js API (public endpoint) with timeout
        const response = await apiFetch(`${apiUrl}${params.toString() ? '?' + params.toString() : ''}`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

      if (data.success && (data.data?.available_rooms || data.data?.rooms)) {
        // Handle both availability endpoint (available_rooms) and general rooms endpoint (rooms)
        const roomsData = data.data.available_rooms || data.data.rooms;

        // Transform API response to our Room interface using utility function
        const transformedRooms: Room[] = roomsData.map((room: any) => {
          const transformedRoom = transformApiRoomToRoom(room);
          
          console.log(`🖼️ Room ${room.name} images:`, {
            hasImagesArray: !!room.images,
            imagesCount: room.images?.length || 0,
            hasFeaturedImage: !!room.featured_image,
            finalImagesCount: transformedRoom.images.length
          });

          return transformedRoom;
        });

        setRooms(transformedRooms);
      } else {
        // If API returns no data, set empty array instead of mock data
        setRooms([]);
        setError('No rooms available');
      }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rooms';
      setError(errorMessage);
      // Set empty array instead of mock data
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [checkInTime, checkOutTime, guests]);

  useEffect(() => {
    // Only fetch if we're in the browser (client-side)
    // Don't use early return - always call the effect, but conditionally execute
    if (typeof window !== 'undefined') {
      fetchRooms().catch((err) => {
        console.error('Failed to fetch rooms in useEffect:', err);
        // Error is already handled in fetchRooms
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInTime, checkOutTime, guests]);

  return {
    rooms,
    loading,
    error,
    refetch: () => { fetchRooms(); },
    retryCount,
  };
}


