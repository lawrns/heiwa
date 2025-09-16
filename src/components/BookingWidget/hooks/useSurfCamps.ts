import { useState, useEffect } from 'react';
import { SurfWeek } from '../types';

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

      // Try WordPress API first (public endpoint)
      const response = await fetch('/api/wordpress/surf-camps', {
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
      
      if (data.success && data.data?.surf_camps) {
        // Transform WordPress API response to our SurfWeek interface
        const transformedCamps: SurfWeek[] = data.data.surf_camps.map((camp: any) => ({
          id: camp.id,
          name: camp.name,
          description: camp.description,
          startDate: camp.dates.start_date,
          endDate: camp.dates.end_date,
          maxParticipants: camp.details.max_participants,
          price: camp.pricing.base_price,
          level: camp.details.skill_level as 'beginner' | 'intermediate' | 'advanced',
          includes: camp.details.includes,
          images: camp.media.images || [],
          isActive: true, // All returned camps are active
          // Enhanced fields
          priceFrom: camp.pricing?.price_from ?? camp.pricing?.base_price,
          confirmedBooked: camp.details?.confirmed_booked ?? 0,
          availableSpots: camp.details?.available_spots ?? camp.details?.max_participants
        }));

        setSurfCamps(transformedCamps);
      } else {
        // No fallback - show error if API fails
        setError('No surf camps available');
        setSurfCamps([]);
      }
    } catch (err) {
      console.error('Error fetching surf camps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch surf camps');
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
