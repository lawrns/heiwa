import { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';
import { apiFetch } from '../lib/api';

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

        // Transform API response to our Room interface
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

          // Handle images: prefer valid images array, fallback to featured_image, then local fallback
          let images: string[] = [];
          
          // Helper to check if URL is valid and accessible
          const isValidImageUrl = (url: string): boolean => {
            if (!url) return false;
            // Skip broken heiwahouse.com URLs
            if (url.includes('heiwahouse.com/wp-content')) return false;
            // Accept local images and valid external URLs
            return url.startsWith('/') || url.startsWith('http');
          };
          
          if (room.images && Array.isArray(room.images) && room.images.length > 0) {
            // Filter out invalid URLs
            images = room.images.filter(isValidImageUrl);
          }
          
          if (images.length === 0 && room.featured_image && isValidImageUrl(room.featured_image)) {
            images = [room.featured_image];
          }
          
          if (images.length === 0) {
            // Fallback to local images based on room type
            if (roomType === 'dorm') {
              images = [
                '/images/Freedomroutes-rooms-1.jpg',
                '/images/Freedomroutes-rooms-50.jpg',
                '/images/DSC03521-scaled.jpg'
              ];
            } else {
              images = [
                '/images/DSC02099-scaled.jpg',
                '/images/DSC02102-scaled.jpg',
                '/images/DSC03530-scaled.jpg'
              ];
            }
          }

          console.log(`🖼️ Room ${room.name} images:`, {
            hasImagesArray: !!room.images,
            imagesCount: room.images?.length || 0,
            hasFeaturedImage: !!room.featured_image,
            finalImagesCount: images.length
          });

          return {
            id: room.id,
            name: room.name,
            description: room.description || '',
            type: roomType,
            maxOccupancy: room.capacity,
            pricePerNight: room.price_per_night,
            amenities: room.amenities || [],
            images: images,
            isAvailable: true, // All returned rooms are available or shown
          };
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


