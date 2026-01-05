import { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import { apiFetch } from '../lib/api';
import { transformApiRoomToRoom } from '@/lib/booking-utils';

interface UseRoomsParams {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  /** When true, skips surf week blocking logic in API (for surf week room selection) */
  forSurfWeek?: boolean;
}

interface UseRoomsResult {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  retryCount: number;
}

export function useRooms({ checkIn, checkOut, guests, forSurfWeek = false }: UseRoomsParams): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Create stable string representations of dates to prevent infinite loops
  // Convert dates to timestamps for stable comparison
  // Handle both Date objects and string dates (from localStorage)
  const ensureDateObj = (date: Date | string | null | undefined): Date | null => {
    if (!date) return null
    if (date instanceof Date) return isNaN(date.getTime()) ? null : date
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  
  const checkInDateObj = ensureDateObj(checkIn)
  const checkOutDateObj = ensureDateObj(checkOut)
  const checkInTime = checkInDateObj?.getTime() ?? null;
  const checkOutTime = checkOutDateObj?.getTime() ?? null;

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

        // When fetching rooms for surf week room selection, skip the surf week blocking logic
        if (forSurfWeek) {
          params.set('for_surf_week', 'true');
        }
      }

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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

        if (data.success) {
          // Check for surf week conflict FIRST
          if (data.data?.surf_week_conflict) {
            setError(data.data.message || 'Room-only bookings are not available during surf camp weeks. Please book a surf camp package instead.');
            setRooms([]);
            setLoading(false);
            return;
          }

          // Handle both availability endpoint (available_rooms) and general rooms endpoint (rooms)
          if (data.data?.available_rooms || data.data?.rooms) {
            const roomsData = data.data.available_rooms || data.data.rooms;

            // Transform API response to our Room interface using utility function
            const transformedRooms: Room[] = roomsData.map((room: Record<string, unknown>) => {
              const transformedRoom = transformApiRoomToRoom(room);
              return transformedRoom;
            });

            setRooms(transformedRooms);
          } else {
            // If API returns no data, set empty array instead of mock data
            setRooms([]);
            setError('No rooms available');
          }
        } else {
          // If API returns success: false, set empty array
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
      // Provide user-friendly error message
      const friendlyMessage = errorMessage.includes('500') || errorMessage.includes('HTTP error')
        ? 'Unable to load rooms. Please try again.'
        : errorMessage;
      setError(friendlyMessage);
      // Set empty array instead of mock data
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [checkInTime, checkOutTime, guests, forSurfWeek]);

  useEffect(() => {
    // Log version to verify deployment
    console.log('🚀 useRooms hook v1.2 - Cache-busting enabled');
    
    // Only fetch if we're in the browser (client-side)
    // Don't use early return - always call the effect, but conditionally execute
    if (typeof window !== 'undefined') {
      // Clear any cached data before fetching
      setRooms([]);
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


