/**
 * Utils Unit Tests
 * Tests for general utility functions
 */

import { cn, formatCurrency, formatDate } from '@/lib/utils';

describe('Utils', () => {
  // ==========================================================================
  // cn (className utility) Tests
  // ==========================================================================

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded');
      expect(result).toContain('base');
      expect(result).toContain('included');
      expect(result).not.toContain('excluded');
    });

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toContain('base');
      expect(result).toContain('end');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6');
      // tailwind-merge should keep px-6 and remove px-4
      expect(result).toContain('px-6');
      expect(result).toContain('py-2');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });
  });

  // ==========================================================================
  // formatCurrency Tests
  // ==========================================================================

  describe('formatCurrency', () => {
    it('should format EUR currency', () => {
      const result = formatCurrency(100, 'EUR');
      expect(result).toMatch(/€|EUR/);
      expect(result).toContain('100');
    });

    it('should format USD currency', () => {
      const result = formatCurrency(100, 'USD');
      expect(result).toMatch(/\$|USD/);
      expect(result).toContain('100');
    });

    it('should handle decimal amounts', () => {
      const result = formatCurrency(99.99, 'EUR');
      expect(result).toContain('99');
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0, 'EUR');
      expect(result).toContain('0');
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(10000, 'EUR');
      expect(result).toContain('10');
    });
  });

  // ==========================================================================
  // formatDate Tests
  // ==========================================================================

  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2024-03-15');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format Date object', () => {
      const date = new Date('2024-03-15');
      const result = formatDate(date.toISOString());
      expect(result).toBeTruthy();
    });

    it('should handle different date formats', () => {
      const result1 = formatDate('2024-03-15');
      const result2 = formatDate('2024/03/15');
      
      // Both should produce valid output
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });
  });
});
