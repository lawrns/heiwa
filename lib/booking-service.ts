// Booking submission service for hybrid data access architecture
// Provides high-level booking submission functionality using admin API

import { adminApi } from './admin-api';
import type { BookingRequest, BookingResponse, ApiLoadingState } from './types';

export interface BookingSubmission extends BookingRequest {
  // Additional metadata for tracking
  submittedAt?: Date;
  source?: 'website' | 'widget' | 'api';
}

export interface BookingResult extends BookingResponse {
  loading: boolean;
  error?: string;
  submittedAt?: Date;
}

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class BookingService {
  /**
   * Submit a booking request with validation and error handling
   */
  async submitBooking(booking: BookingSubmission): Promise<BookingResult> {
    try {
      // Validate booking before submission
      const validation = this.validateBooking(booking);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`,
          loading: false,
          submittedAt: new Date(),
        };
      }

      // Submit to admin API
      const response = await adminApi.createBooking({
        clientName: booking.clientName,
        email: booking.email,
        phone: booking.phone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomId: booking.roomId,
        guests: booking.guests,
        message: booking.message,
      });

      return {
        success: response.success,
        bookingId: response.bookingId,
        status: response.status as 'pending' | 'confirmed' | 'cancelled' | undefined,
        message: response.message,
        loading: false,
        submittedAt: new Date(),
      };
    } catch (error) {
      console.error('Booking submission failed:', error);

      return {
        success: false,
        message: 'Booking submission failed. Please try again or contact us directly.',
        loading: false,
        submittedAt: new Date(),
      };
    }
  }

  /**
   * Validate booking data before submission
   */
  validateBooking(booking: BookingSubmission): BookingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!booking.clientName?.trim()) {
      errors.push('Client name is required');
    }

    if (!booking.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(booking.email)) {
      errors.push('Invalid email format');
    }

    if (!booking.checkIn) {
      errors.push('Check-in date is required');
    }

    if (!booking.checkOut) {
      errors.push('Check-out date is required');
    }

    if (!booking.roomId?.trim()) {
      errors.push('Room selection is required');
    }

    if (!booking.guests || booking.guests < 1) {
      errors.push('Number of guests must be at least 1');
    }

    // Date validation
    if (booking.checkIn && booking.checkOut) {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (checkInDate < now) {
        errors.push('Check-in date cannot be in the past');
      }

      if (checkOutDate <= checkInDate) {
        errors.push('Check-out date must be after check-in date');
      }

      // Minimum stay validation (2 nights)
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 2) {
        errors.push('Minimum stay is 2 nights');
      }
    }

    // Warnings
    if (booking.guests > 4) {
      warnings.push('Large group bookings may require special arrangements');
    }

    const daysUntilCheckIn = booking.checkIn
      ? Math.ceil((new Date(booking.checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysUntilCheckIn < 2) {
      warnings.push('Late bookings may not be confirmed immediately');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if booking would conflict with existing reservations
   * Note: This is a client-side estimate; final validation happens server-side
   */
  async checkBookingConflicts(booking: BookingSubmission): Promise<{
    hasConflicts: boolean;
    message?: string;
  }> {
    // This would typically call an availability check
    // For now, we'll assume no conflicts (server will validate)
    return {
      hasConflicts: false,
    };
  }

  /**
   * Get booking policies and requirements
   */
  getBookingPolicies() {
    return {
      minimumStay: 2, // nights
      cancellationHours: 48, // hours before check-in
      checkInTime: '15:00', // 3:00 PM
      checkOutTime: '11:00', // 11:00 AM
      paymentRequired: true,
      maxGuestsPerRoom: 4,
    };
  }

  /**
   * Calculate estimated booking cost
   * Note: This is an estimate; final pricing comes from server
   */
  calculateEstimatedCost(
    roomId: string,
    checkIn: string,
    checkOut: string,
    guests: number
  ): {
    estimatedTotal: number
    currency: string
    breakdown: {
      baseRate: number
      nights: number
      subtotal: number
      taxes: number
      total: number
    }
  } {
    // This would typically call the admin API for pricing
    // For now, return a placeholder
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      estimatedTotal: nights * 100, // Placeholder pricing
      currency: 'EUR',
      breakdown: {
        baseRate: 100,
        nights,
        subtotal: nights * 100,
        taxes: 0,
        total: nights * 100,
      },
    };
  }

  /**
   * Send booking confirmation email
   * Note: This would typically be handled by the admin system
   */
  async sendConfirmationEmail(bookingId: string): Promise<boolean> {
    // This would call an admin API endpoint for sending confirmations
    console.log(`Sending confirmation email for booking ${bookingId}`);
    return true;
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// Export class for testing
export { BookingService };

