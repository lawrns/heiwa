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
        }));
        
        setSurfCamps(transformedCamps);
      } else {
        // Fallback to mock data if API fails
        setSurfCamps(getMockSurfCamps());
      }
    } catch (err) {
      console.error('Error fetching surf camps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch surf camps');
      // Fallback to mock data
      setSurfCamps(getMockSurfCamps());
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
    refetch: fetchSurfCamps,
  };
}

// Mock data fallback
function getMockSurfCamps(): SurfWeek[] {
  return [
    {
      id: 'surf-camp-1',
      name: 'Beginner Surf Week - Costa Rica',
      description: 'Perfect introduction to surfing with professional coaching and beautiful waves.',
      startDate: '2024-02-15',
      endDate: '2024-02-22',
      maxParticipants: 12,
      price: 899,
      level: 'beginner',
      includes: [
        '7 nights accommodation',
        'Daily surf lessons',
        'All meals included',
        'Equipment rental',
        'Transportation to surf spots',
        'Professional photography'
      ],
      images: ['/room1.jpg'],
      isActive: true,
    },
    {
      id: 'surf-camp-2',
      name: 'Intermediate Surf Week - Morocco',
      description: 'Take your surfing to the next level with advanced coaching in Morocco.',
      startDate: '2024-03-10',
      endDate: '2024-03-17',
      maxParticipants: 10,
      price: 799,
      level: 'intermediate',
      includes: [
        '7 nights accommodation',
        'Advanced surf coaching',
        'All meals included',
        'Premium equipment',
        'Video analysis sessions',
        'Cultural activities'
      ],
      images: ['/room2.webp'],
      isActive: true,
    },
    {
      id: 'surf-camp-3',
      name: 'Advanced Surf Week - Portugal',
      description: 'Expert-level coaching for experienced surfers in world-class waves.',
      startDate: '2024-04-05',
      endDate: '2024-04-12',
      maxParticipants: 8,
      price: 1099,
      level: 'advanced',
      includes: [
        '7 nights luxury accommodation',
        'Expert surf coaching',
        'Gourmet meals',
        'Professional equipment',
        'Personal video analysis',
        'Exclusive surf spots access'
      ],
      images: ['/room3.webp'],
      isActive: true,
    },
  ];
}
