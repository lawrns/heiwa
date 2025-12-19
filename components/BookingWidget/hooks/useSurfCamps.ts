import { useState, useEffect } from 'react';
import { SurfWeek } from '../types';
import { apiFetch } from '../lib/api';

interface UseSurfCampsResult {
  surfCamps: SurfWeek[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSurfCamps(): UseSurfCampsResult {
  const [surfCamps, setSurfCamps] = useState<SurfWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurfCamps = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Try Next.js API endpoint with timeout
        const response = await apiFetch('/surf-camps', {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
      
      // API returns { success: true, data: { surf_camps: [...] } }
      const surfCampsArray = data.data?.surf_camps || data.data;
      
      if (data.success && surfCampsArray && Array.isArray(surfCampsArray)) {
        // Transform API response to our SurfWeek interface
        const transformedCamps: SurfWeek[] = surfCampsArray.map((camp: any) => ({
          id: camp.id,
          name: camp.name,
          description: camp.description || '',
          startDate: camp.start_date,
          endDate: camp.end_date,
          maxParticipants: camp.max_participants || 0,
          price: camp.price || 0,
          level: (camp.level || 'all') as 'beginner' | 'intermediate' | 'advanced' | 'all',
          includes: Array.isArray(camp.includes) ? camp.includes : [],
          images: Array.isArray(camp.images) ? camp.images : [],
          isActive: camp.is_active !== false,
          // Enhanced fields
          priceFrom: camp.price || 0,
          confirmedBooked: camp.enrolled_count || 0,
          availableSpots: camp.available_spots ?? camp.max_participants ?? 0
        }));

        setSurfCamps(transformedCamps);
      } else {
        // No fallback - show error if API fails
        setError('No surf camps available');
        setSurfCamps([]);
      }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Error fetching surf camps:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch surf camps';
      setError(errorMessage);
      // No fallback - show empty state
      setSurfCamps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurfCamps();
  }, []);

  return {
    surfCamps,
    loading,
    error,
    refetch: () => { fetchSurfCamps(); },
  };
}

// No more mock data - always use real database data
