/**
 * Date Helpers Unit Tests
 * Tests for date conversion and validation utilities
 */

import {
  ensureDate,
  dateToISOString,
  dateToFullISOString,
} from '@/lib/utils/date-helpers';

describe('Date Helpers', () => {
  // ==========================================================================
  // ensureDate Tests
  // ==========================================================================

  describe('ensureDate', () => {
    describe('Date object inputs', () => {
      it('should return valid Date objects unchanged', () => {
        const date = new Date('2025-06-15');
        const result = ensureDate(date);
        
        expect(result).toBeInstanceOf(Date);
        expect(result?.getTime()).toBe(date.getTime());
      });

      it('should return null for invalid Date objects', () => {
        const invalidDate = new Date('invalid');
        expect(ensureDate(invalidDate)).toBeNull();
      });

      it('should handle Date objects with time components', () => {
        const date = new Date('2025-06-15T14:30:00Z');
        const result = ensureDate(date);
        
        expect(result).toBeInstanceOf(Date);
        expect(result?.getHours()).toBeDefined();
      });
    });

    describe('string inputs', () => {
      it('should parse ISO date strings', () => {
        const result = ensureDate('2025-06-15');
        
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2025);
        expect(result?.getMonth()).toBe(5); // June is month 5 (0-indexed)
        // Note: getDate() can vary by timezone, so we check the ISO string instead
        expect(result?.toISOString()).toContain('2025-06-15');
      });

      it('should parse full ISO datetime strings', () => {
        const result = ensureDate('2025-06-15T14:30:00Z');
        
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2025);
      });

      it('should parse various date formats', () => {
        expect(ensureDate('June 15, 2025')).toBeInstanceOf(Date);
        expect(ensureDate('2025/06/15')).toBeInstanceOf(Date);
      });

      it('should return null for invalid date strings', () => {
        expect(ensureDate('not-a-date')).toBeNull();
        expect(ensureDate('invalid')).toBeNull();
        expect(ensureDate('2025-13-45')).toBeNull(); // Invalid month/day
      });

      it('should return null for empty strings', () => {
        expect(ensureDate('')).toBeNull();
      });
    });

    describe('null/undefined inputs', () => {
      it('should return null for null input', () => {
        expect(ensureDate(null)).toBeNull();
      });

      it('should return null for undefined input', () => {
        expect(ensureDate(undefined)).toBeNull();
      });
    });
  });

  // ==========================================================================
  // dateToISOString Tests
  // ==========================================================================

  describe('dateToISOString', () => {
    describe('valid inputs', () => {
      it('should convert Date object to ISO string', () => {
        const date = new Date('2025-06-15T00:00:00Z');
        expect(dateToISOString(date)).toBe('2025-06-15');
      });

      it('should convert date string to ISO string', () => {
        expect(dateToISOString('2025-06-15')).toBe('2025-06-15');
      });

      it('should strip time component from datetime', () => {
        const date = new Date('2025-06-15T14:30:00Z');
        const result = dateToISOString(date);
        
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(result).toBe('2025-06-15');
      });

      it('should handle dates at different times of day', () => {
        const morning = new Date('2025-06-15T06:00:00Z');
        const evening = new Date('2025-06-15T22:00:00Z');
        
        expect(dateToISOString(morning)).toBe('2025-06-15');
        expect(dateToISOString(evening)).toBe('2025-06-15');
      });
    });

    describe('invalid inputs', () => {
      it('should return empty string for null', () => {
        expect(dateToISOString(null)).toBe('');
      });

      it('should return empty string for undefined', () => {
        expect(dateToISOString(undefined)).toBe('');
      });

      it('should return empty string for invalid date string', () => {
        expect(dateToISOString('not-a-date')).toBe('');
      });

      it('should return empty string for invalid Date object', () => {
        expect(dateToISOString(new Date('invalid'))).toBe('');
      });
    });

    describe('edge cases', () => {
      it('should handle year boundaries', () => {
        expect(dateToISOString('2025-01-01')).toBe('2025-01-01');
        expect(dateToISOString('2025-12-31')).toBe('2025-12-31');
      });

      it('should handle leap year dates', () => {
        expect(dateToISOString('2024-02-29')).toBe('2024-02-29');
      });
    });
  });

  // ==========================================================================
  // dateToFullISOString Tests
  // ==========================================================================

  describe('dateToFullISOString', () => {
    describe('valid inputs', () => {
      it('should convert Date object to full ISO string', () => {
        const date = new Date('2025-06-15T14:30:00.000Z');
        const result = dateToFullISOString(date);
        
        expect(result).toBe('2025-06-15T14:30:00.000Z');
      });

      it('should convert date string to full ISO string', () => {
        const result = dateToFullISOString('2025-06-15T14:30:00Z');
        
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });

      it('should include milliseconds', () => {
        const date = new Date('2025-06-15T14:30:00.123Z');
        const result = dateToFullISOString(date);
        
        expect(result).toContain('.123Z');
      });

      it('should include timezone indicator', () => {
        const date = new Date('2025-06-15T14:30:00Z');
        const result = dateToFullISOString(date);
        
        expect(result).toMatch(/Z$/);
      });
    });

    describe('invalid inputs', () => {
      it('should return undefined for null', () => {
        expect(dateToFullISOString(null)).toBeUndefined();
      });

      it('should return undefined for undefined', () => {
        expect(dateToFullISOString(undefined)).toBeUndefined();
      });

      it('should return undefined for invalid date string', () => {
        expect(dateToFullISOString('not-a-date')).toBeUndefined();
      });

      it('should return undefined for invalid Date object', () => {
        expect(dateToFullISOString(new Date('invalid'))).toBeUndefined();
      });
    });

    describe('format consistency', () => {
      it('should always return ISO 8601 format', () => {
        const dates = [
          new Date('2025-01-01'),
          new Date('2025-06-15T12:00:00Z'),
          new Date('2025-12-31T23:59:59Z'),
        ];

        dates.forEach(date => {
          const result = dateToFullISOString(date);
          expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });
      });
    });
  });
});
