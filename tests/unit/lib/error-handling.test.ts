/**
 * Error Handling Tests
 * Feature: comprehensive-testing
 * 
 * Tests for error handling utilities including network failures, retry logic, and error messages
 */

import {
  logError,
  APIError,
  ValidationError,
  BookingError,
  handleAPIError,
  handleValidationError,
  handleBookingError,
  getUserFriendlyMessage,
  isNetworkError,
  retryRequest,
  safeAsync,
} from '@/lib/error-handler';

describe('Error Handler', () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Custom Error Classes', () => {
    describe('APIError', () => {
      it('should create APIError with correct properties', () => {
        const error = new APIError('Not found', 404, '/api/bookings');

        expect(error.message).toBe('Not found');
        expect(error.statusCode).toBe(404);
        expect(error.endpoint).toBe('/api/bookings');
        expect(error.name).toBe('APIError');
      });

      it('should include context when provided', () => {
        const error = new APIError('Error', 500, '/api/test', { userId: '123' });

        expect(error.context).toEqual({ userId: '123' });
      });
    });

    describe('ValidationError', () => {
      it('should create ValidationError with correct properties', () => {
        const error = new ValidationError('Invalid email', 'email', 'invalid@');

        expect(error.message).toBe('Invalid email');
        expect(error.field).toBe('email');
        expect(error.value).toBe('invalid@');
        expect(error.name).toBe('ValidationError');
      });
    });

    describe('BookingError', () => {
      it('should create BookingError with correct properties', () => {
        const error = new BookingError('Payment failed', 'payment', { amount: 100 });

        expect(error.message).toBe('Payment failed');
        expect(error.step).toBe('payment');
        expect(error.context).toEqual({ amount: 100 });
        expect(error.name).toBe('BookingError');
      });
    });
  });

  describe('Error Handlers', () => {
    describe('handleAPIError', () => {
      it('should create APIError from error object', () => {
        const originalError = { message: 'Server error', response: { status: 500 } };
        const result = handleAPIError(originalError, '/api/test');

        expect(result).toBeInstanceOf(APIError);
        expect(result.message).toBe('Server error');
        expect(result.statusCode).toBe(500);
        expect(result.endpoint).toBe('/api/test');
      });

      it('should use default values when error properties missing', () => {
        const result = handleAPIError({}, '/api/test');

        expect(result.message).toBe('An API error occurred');
        expect(result.statusCode).toBe(500);
      });
    });

    describe('handleValidationError', () => {
      it('should create ValidationError with custom message', () => {
        const result = handleValidationError('email', 'test@', 'Invalid email format');

        expect(result).toBeInstanceOf(ValidationError);
        expect(result.message).toBe('Invalid email format');
        expect(result.field).toBe('email');
        expect(result.value).toBe('test@');
      });

      it('should use default message when not provided', () => {
        const result = handleValidationError('email', 'test@');

        expect(result.message).toBe('Invalid value for email');
      });
    });

    describe('handleBookingError', () => {
      it('should create BookingError from error', () => {
        const originalError = new Error('Payment declined');
        const result = handleBookingError('payment', originalError);

        expect(result).toBeInstanceOf(BookingError);
        expect(result.message).toBe('Payment declined');
        expect(result.step).toBe('payment');
      });

      it('should use default message when error has no message', () => {
        const result = handleBookingError('checkout', {});

        expect(result.message).toBe('Error in booking step: checkout');
      });
    });
  });

  describe('getUserFriendlyMessage', () => {
    describe('Network Errors', () => {
      it('should return friendly message for network errors', () => {
        const error = new Error('Failed to fetch');
        expect(getUserFriendlyMessage(error)).toContain('internet connection');
      });

      it('should return friendly message for timeout errors', () => {
        const error = new Error('Request timed out');
        expect(getUserFriendlyMessage(error)).toContain('timed out');
      });

      it('should return friendly message for connection errors', () => {
        const error = new Error('Network connection failed');
        expect(getUserFriendlyMessage(error)).toContain('internet connection');
      });
    });

    describe('Validation Errors', () => {
      it('should return friendly message for required field errors', () => {
        const error = new Error('Field is required');
        expect(getUserFriendlyMessage(error)).toContain('required fields');
      });

      it('should return friendly message for invalid format errors', () => {
        const error = new Error('Invalid format');
        expect(getUserFriendlyMessage(error)).toContain('Invalid format');
      });

      it('should return friendly message for email errors', () => {
        const error = new Error('Please provide a valid email');
        expect(getUserFriendlyMessage(error)).toContain('email');
      });
    });

    describe('API Errors', () => {
      it('should return friendly message for 401 errors', () => {
        const error = new APIError('Unauthorized', 401, '/api/test');
        expect(getUserFriendlyMessage(error)).toContain('log in');
      });

      it('should return friendly message for 403 errors', () => {
        const error = new APIError('Forbidden', 403, '/api/test');
        expect(getUserFriendlyMessage(error)).toContain('permission');
      });

      it('should return friendly message for 404 errors', () => {
        const error = new APIError('Not found', 404, '/api/test');
        expect(getUserFriendlyMessage(error)).toContain('not found');
      });

      it('should return friendly message for 429 errors', () => {
        const error = new APIError('Too many requests', 429, '/api/test');
        expect(getUserFriendlyMessage(error)).toContain('Too many requests');
      });

      it('should return friendly message for 500 errors', () => {
        const error = new APIError('Internal server error', 500, '/api/test');
        expect(getUserFriendlyMessage(error)).toContain('server error');
      });
    });

    describe('Booking Errors', () => {
      it('should return friendly message for availability errors', () => {
        const error = new Error('Room not available');
        expect(getUserFriendlyMessage(error)).toContain('no longer available');
      });

      it('should return friendly message for capacity errors', () => {
        const error = new Error('Exceeds room capacity');
        expect(getUserFriendlyMessage(error)).toContain('capacity');
      });

      it('should return friendly message for payment errors', () => {
        const error = new Error('Payment failed');
        expect(getUserFriendlyMessage(error)).toContain('Payment');
      });
    });

    describe('String Errors', () => {
      it('should handle string errors', () => {
        expect(getUserFriendlyMessage('Network error')).toContain('internet connection');
      });
    });

    describe('Unknown Errors', () => {
      it('should return generic message for unknown errors', () => {
        const error = new Error('Some unknown error xyz123');
        expect(getUserFriendlyMessage(error)).toBe('Some unknown error xyz123');
      });

      it('should handle null/undefined errors', () => {
        expect(getUserFriendlyMessage(null)).toContain('unexpected error');
        expect(getUserFriendlyMessage(undefined)).toContain('unexpected error');
      });
    });
  });

  describe('isNetworkError', () => {
    it('should return true for fetch errors', () => {
      const error = new TypeError('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for network keyword errors', () => {
      expect(isNetworkError(new Error('Network error'))).toBe(true);
      expect(isNetworkError(new Error('Connection failed'))).toBe(true);
      expect(isNetworkError(new Error('Request timeout'))).toBe(true);
    });

    it('should return true for string network errors', () => {
      expect(isNetworkError('Network error')).toBe(true);
      expect(isNetworkError('Connection failed')).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(isNetworkError(new Error('Validation failed'))).toBe(false);
      expect(isNetworkError(new Error('Invalid input'))).toBe(false);
    });

    it('should return false for non-error types', () => {
      expect(isNetworkError(123)).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError({})).toBe(false);
    });
  });

  describe('retryRequest', () => {
    it('should return result on first successful attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retryRequest(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce('success');

      const result = await retryRequest(fn, { maxRetries: 3, delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries exceeded', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryRequest(fn, { maxRetries: 3, delay: 10 }))
        .rejects.toThrow('Always fails');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff when enabled', async () => {
      jest.useFakeTimers();
      
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success');

      const promise = retryRequest(fn, { maxRetries: 3, delay: 100, backoff: true });

      // First retry after 100ms
      await jest.advanceTimersByTimeAsync(100);
      // Second retry after 200ms (100 * 2^1)
      await jest.advanceTimersByTimeAsync(200);

      const result = await promise;
      expect(result).toBe('success');

      jest.useRealTimers();
    });

    it('should use fixed delay when backoff disabled', async () => {
      jest.useFakeTimers();
      
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success');

      const promise = retryRequest(fn, { maxRetries: 2, delay: 100, backoff: false });

      await jest.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe('success');

      jest.useRealTimers();
    });
  });

  describe('safeAsync', () => {
    it('should return result on success', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await safeAsync(fn);

      expect(result).toBe('success');
    });

    it('should return null on error', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      const result = await safeAsync(fn);

      expect(result).toBeNull();
    });

    it('should call error handler on error', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));
      const errorHandler = jest.fn();

      await safeAsync(fn, errorHandler);

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should not throw when error handler is not provided', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(safeAsync(fn)).resolves.toBeNull();
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      
      logError(error, { component: 'TestComponent', action: 'test' });

      expect(console.error).toHaveBeenCalled();
    });

    it('should include timestamp in log', () => {
      const error = new Error('Test error');
      
      logError(error);

      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });
  });
});
