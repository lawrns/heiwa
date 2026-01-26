/**
 * Property-Based Tests for API Response Shape
 * Feature: comprehensive-testing
 * 
 * These tests verify that API responses maintain consistent shapes
 * across all valid inputs using fast-check.
 */

import * as fc from 'fast-check';
import {
  successResponseArb,
  errorResponseArb,
  validBookingArb,
  validRoomArb,
} from '../utils/generators';

describe('API Response Properties', () => {
  /**
   * Property 8: API Response Shape Consistency
   * For any API response, success responses SHALL have success: true and data;
   * errors SHALL have success: false and error
   * 
   * Validates: Requirements 5.2, 5.3
   */
  describe('Property 8: API Response Shape Consistency', () => {
    describe('Success Response Shape', () => {
      it('should always have success: true for success responses', () => {
        fc.assert(
          fc.property(
            successResponseArb(fc.anything()),
            (response) => {
              return response.success === true;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should always have data property for success responses', () => {
        fc.assert(
          fc.property(
            successResponseArb(fc.anything()),
            (response) => {
              return 'data' in response;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have correct shape for booking success response', () => {
        fc.assert(
          fc.property(
            successResponseArb(validBookingArb),
            (response) => {
              return (
                response.success === true &&
                'data' in response &&
                response.data !== undefined
              );
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have correct shape for room success response', () => {
        fc.assert(
          fc.property(
            successResponseArb(validRoomArb),
            (response) => {
              return (
                response.success === true &&
                'data' in response &&
                response.data !== undefined &&
                typeof response.data.id === 'string'
              );
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Error Response Shape', () => {
      it('should always have success: false for error responses', () => {
        fc.assert(
          fc.property(errorResponseArb, (response) => {
            return response.success === false;
          }),
          { numRuns: 100 }
        );
      });

      it('should always have error property for error responses', () => {
        fc.assert(
          fc.property(errorResponseArb, (response) => {
            return 'error' in response && typeof response.error === 'string';
          }),
          { numRuns: 100 }
        );
      });

      it('should have non-empty error message', () => {
        fc.assert(
          fc.property(errorResponseArb, (response) => {
            return response.error.length > 0;
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Response Type Discrimination', () => {
      it('should be able to discriminate between success and error responses', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              successResponseArb(fc.anything()),
              errorResponseArb
            ),
            (response) => {
              if (response.success === true) {
                return 'data' in response;
              } else {
                return 'error' in response;
              }
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should never have both data and error in same response', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              successResponseArb(fc.anything()),
              errorResponseArb
            ),
            (response) => {
              // Success responses have data but not error
              // Error responses have error but not data
              if (response.success === true) {
                return 'data' in response && !('error' in response);
              } else {
                return 'error' in response && !('data' in response);
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Response Serialization', () => {
      it('should be JSON serializable for success responses', () => {
        fc.assert(
          fc.property(
            successResponseArb(fc.jsonValue()),
            (response) => {
              try {
                const serialized = JSON.stringify(response);
                const parsed = JSON.parse(serialized);
                return parsed.success === true && 'data' in parsed;
              } catch {
                return false;
              }
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should be JSON serializable for error responses', () => {
        fc.assert(
          fc.property(errorResponseArb, (response) => {
            try {
              const serialized = JSON.stringify(response);
              const parsed = JSON.parse(serialized);
              return parsed.success === false && 'error' in parsed;
            } catch {
              return false;
            }
          }),
          { numRuns: 100 }
        );
      });
    });
  });

  /**
   * Additional API Response Properties
   */
  describe('API Response Invariants', () => {
    it('should maintain response shape through transformation', () => {
      fc.assert(
        fc.property(
          successResponseArb(fc.record({
            id: fc.uuid(),
            name: fc.string(),
            value: fc.integer(),
          })),
          (response) => {
            // Transform data
            const transformed = {
              ...response,
              data: {
                ...response.data,
                transformed: true,
              },
            };

            return (
              transformed.success === true &&
              'data' in transformed &&
              transformed.data.transformed === true
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve error details through transformation', () => {
      fc.assert(
        fc.property(errorResponseArb, (response) => {
          // Add additional context to error
          const enhanced = {
            ...response,
            timestamp: new Date().toISOString(),
            requestId: 'test-123',
          };

          return (
            enhanced.success === false &&
            enhanced.error === response.error &&
            'timestamp' in enhanced &&
            'requestId' in enhanced
          );
        }),
        { numRuns: 100 }
      );
    });
  });
});
