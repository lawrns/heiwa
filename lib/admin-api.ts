// Admin API client for hybrid data access architecture
// Provides methods to communicate with the admin system for booking operations

export interface AdminApiRoom {
  id: string;
  name: string;
  capacity: number;
  price_per_night: number;
  amenities: string[];
  featured_image: string;
  description: string;
  booking_type: 'whole' | 'perBed';
}

export interface AdminApiAvailabilityResponse {
  available: boolean;
  price?: number;
  message?: string;
}

export interface AdminApiBookingRequest {
  clientName: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  roomId: string;
  guests: number;
  message?: string;
}

export interface AdminApiBookingResponse {
  success: boolean;
  bookingId?: string;
  status?: string;
  message?: string;
}

export interface AdminApiError {
  success: false;
  error: string;
  message: string;
}

class AdminApiClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor() {
    this.baseUrl = process.env.ADMIN_API_BASE || 'https://admin.heiwa.house/api/wordpress';
    this.apiKey = process.env.HEIWA_API_KEY || 'heiwa_wp_test_key_2024_secure_deployment';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const startTime = Date.now();

    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Log request (only on first attempt to avoid spam)
        if (attempt === 1) {
          console.log(`🔄 Admin API ${method} ${endpoint}`, {
            url,
            method,
            hasBody: !!options.body,
            timestamp: new Date().toISOString(),
            maxRetries: this.maxRetries,
          });
        } else {
          console.log(`🔄 Admin API ${method} ${endpoint} - Retry ${attempt}/${this.maxRetries}`);
        }

        const headers = {
          'Content-Type': 'application/json',
          'X-Heiwa-API-Key': this.apiKey,
          ...options.headers,
        };

        const response = await fetch(url, {
          ...options,
          headers,
        });

        const duration = Date.now() - startTime;

        // Log response
        console.log(`✅ Admin API ${method} ${endpoint} - ${response.status} (${duration}ms)`, {
          status: response.status,
          statusText: response.statusText,
          attempt,
          duration,
          timestamp: new Date().toISOString(),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');

          // Only retry on server errors (5xx) or network errors, not client errors (4xx)
          const shouldRetry = response.status >= 500 && attempt < this.maxRetries;

          if (shouldRetry) {
            console.warn(`⚠️ Admin API ${method} ${endpoint} failed (attempt ${attempt}/${this.maxRetries}), retrying in ${this.retryDelay}ms:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
            });

            await this.delay(this.retryDelay * attempt); // Exponential backoff
            continue;
          }

          console.error(`❌ Admin API ${method} ${endpoint} failed (final):`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            attempts: attempt,
            duration,
          });
          throw new Error(`Admin API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Log successful response data (truncated for privacy)
        console.log(`📦 Admin API ${method} ${endpoint} response:`, {
          success: data.success !== undefined ? data.success : 'N/A',
          hasData: !!data.data,
          dataKeys: data.data ? Object.keys(data.data) : [],
          attempts: attempt,
          duration,
        });

        return data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors or if this was the last attempt
        if (attempt >= this.maxRetries || this.isClientError(error)) {
          break;
        }

        console.warn(`⚠️ Admin API ${method} ${endpoint} exception (attempt ${attempt}/${this.maxRetries}), retrying in ${this.retryDelay * attempt}ms:`, {
          error: error instanceof Error ? error.message : String(error),
        });

        await this.delay(this.retryDelay * attempt);
      }
    }

    // All retries exhausted
    const duration = Date.now() - startTime;
    console.error(`💥 Admin API ${method} ${endpoint} failed after ${this.maxRetries} attempts (${duration}ms):`, {
      error: lastError instanceof Error ? lastError.message : String(lastError),
      timestamp: new Date().toISOString(),
    });
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isClientError(error: any): boolean {
    // Consider it a client error if it's not a network/fetch error
    return !(error instanceof TypeError && error.message.includes('fetch'));
  }

  /**
   * Get all available rooms from admin system
   */
  async getRooms(): Promise<AdminApiRoom[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: { rooms: AdminApiRoom[] } } | AdminApiError>('/rooms');

      if ('success' in response && !response.success) {
        throw new Error(response.message || 'Failed to fetch rooms from admin API');
      }

      if ('data' in response && response.data?.rooms) {
        return response.data.rooms;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch rooms from admin API:', error);
      return [];
    }
  }

  /**
   * Check room availability for specific dates
   */
  async checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<AdminApiAvailabilityResponse> {
    try {
      const params = new URLSearchParams({
        roomId,
        checkIn,
        checkOut,
      });

      const response = await this.makeRequest<AdminApiAvailabilityResponse | AdminApiError>(`/availability?${params}`);

      if ('success' in response && !response.success) {
        throw new Error(response.message || 'Failed to check availability');
      }

      if ('available' in response) {
        return response;
      }

      return { available: false, message: 'Availability check failed' };
    } catch (error) {
      console.error('Failed to check availability:', error);
      return { available: false, message: 'Availability service temporarily unavailable' };
    }
  }

  /**
   * Submit a booking request
   */
  async createBooking(bookingData: AdminApiBookingRequest): Promise<AdminApiBookingResponse> {
    try {
      const response = await this.makeRequest<AdminApiBookingResponse | AdminApiError>('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });

      if ('success' in response && !response.success) {
        throw new Error(response.message || 'Failed to create booking');
      }

      return response as AdminApiBookingResponse;
    } catch (error) {
      console.error('Failed to create booking:', error);
      return {
        success: false,
        message: 'Booking submission failed. Please try again or contact us directly.',
      };
    }
  }

  /**
   * Health check for admin system availability
   */
  async healthCheck(): Promise<{
    available: boolean;
    responseTime: number;
    version?: string;
    message?: string;
  }> {
    const startTime = Date.now();

    try {
      console.log('🏥 Admin API health check starting...');

      // Try a simple GET request to check if the API is responsive
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'X-Heiwa-API-Key': this.apiKey,
        },
        // Short timeout for health checks
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('✅ Admin API health check passed', { responseTime, version: data.version });

        return {
          available: true,
          responseTime,
          version: data.version,
          message: 'Admin system is healthy',
        };
      } else {
        console.warn('⚠️ Admin API health check failed', {
          status: response.status,
          responseTime,
        });

        return {
          available: false,
          responseTime,
          message: `Health check failed with status ${response.status}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('💥 Admin API health check error', {
        error: error instanceof Error ? error.message : String(error),
        responseTime,
      });

      return {
        available: false,
        responseTime,
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Check if admin system is available (cached health check)
   */
  private lastHealthCheck: number = 0;
  private healthCache: { available: boolean; timestamp: number } | null = null;
  private readonly HEALTH_CACHE_TTL = 30000; // 30 seconds

  async isAvailable(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if recent
    if (this.healthCache && (now - this.healthCache.timestamp) < this.HEALTH_CACHE_TTL) {
      return this.healthCache.available;
    }

    // Perform fresh health check
    const health = await this.healthCheck();
    this.healthCache = {
      available: health.available,
      timestamp: now,
    };

    return health.available;
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();

// Export class for testing
export { AdminApiClient };
