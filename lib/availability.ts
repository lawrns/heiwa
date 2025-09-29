// Availability checking service for hybrid data access architecture
// Provides high-level availability checking functionality using admin API

import { adminApi } from './admin-api';
import type { AvailabilityCheck, ApiLoadingState } from './types';

export interface AvailabilityQuery {
  roomId: string;
  checkIn: string;
  checkOut: string;
}

export interface AvailabilityResult extends AvailabilityCheck {
  loading: boolean;
  error?: string;
  lastChecked?: Date;
}

class AvailabilityService {
  private cache = new Map<string, AvailabilityResult>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check room availability with caching and error handling
   */
  async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const cacheKey = `${query.roomId}-${query.checkIn}-${query.checkOut}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached.lastChecked)) {
      return cached;
    }

    try {
      const response = await adminApi.checkAvailability(query.roomId, query.checkIn, query.checkOut);

      const result: AvailabilityResult = {
        ...response,
        roomId: query.roomId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        loading: false,
        lastChecked: new Date(),
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Availability check failed:', error);

      const errorResult: AvailabilityResult = {
        roomId: query.roomId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        available: false,
        loading: false,
        error: 'Unable to check availability. Please try again.',
        lastChecked: new Date(),
      };

      // Cache error result briefly to avoid spam
      this.cache.set(cacheKey, errorResult);

      return errorResult;
    }
  }

  /**
   * Check availability for multiple rooms in parallel
   */
  async checkMultipleRoomsAvailability(
    queries: AvailabilityQuery[]
  ): Promise<AvailabilityResult[]> {
    const promises = queries.map(query => this.checkAvailability(query));
    return Promise.all(promises);
  }

  /**
   * Get cached availability result without making API call
   */
  getCachedAvailability(query: AvailabilityQuery): AvailabilityResult | null {
    const cacheKey = `${query.roomId}-${query.checkIn}-${query.checkOut}`;
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached.lastChecked)) {
      return cached;
    }

    return null;
  }

  /**
   * Clear all cached availability results
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific room
   */
  clearRoomCache(roomId: string): void {
    for (const [key, value] of this.cache.entries()) {
      if (key.startsWith(`${roomId}-`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(lastChecked?: Date): boolean {
    if (!lastChecked) return false;
    const now = new Date();
    const age = now.getTime() - lastChecked.getTime();
    return age < this.CACHE_TTL;
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    const now = new Date();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const result of this.cache.values()) {
      if (this.isCacheValid(result.lastChecked)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheHitRatio: this.cache.size > 0 ? validEntries / this.cache.size : 0,
    };
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();

// Export class for testing
export { AvailabilityService };

