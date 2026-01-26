/**
 * Image Utils Unit Tests
 * Tests for URL normalization, validation, and fallback selection
 */

import {
  normalizeImageUrl,
  normalizeImageUrls,
  getFirstImageUrl,
} from '@/lib/image-utils';

describe('Image Utils', () => {
  // ==========================================================================
  // normalizeImageUrl Tests
  // ==========================================================================

  describe('normalizeImageUrl', () => {
    describe('valid inputs', () => {
      it('should return relative paths unchanged', () => {
        expect(normalizeImageUrl('/images/room.jpg')).toBe('/images/room.jpg');
        expect(normalizeImageUrl('/rooms/photo.png')).toBe('/rooms/photo.png');
        expect(normalizeImageUrl('/test.webp')).toBe('/test.webp');
      });

      it('should return https URLs unchanged', () => {
        expect(normalizeImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
        expect(normalizeImageUrl('https://storage.supabase.co/room.jpg')).toBe('https://storage.supabase.co/room.jpg');
      });

      it('should return http URLs unchanged', () => {
        expect(normalizeImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
      });

      it('should return other string formats unchanged', () => {
        expect(normalizeImageUrl('some-path')).toBe('some-path');
        expect(normalizeImageUrl('image.jpg')).toBe('image.jpg');
      });
    });

    describe('invalid inputs', () => {
      it('should return fallback for null', () => {
        expect(normalizeImageUrl(null)).toBe('/images/rooms/room1.jpg');
      });

      it('should return fallback for undefined', () => {
        expect(normalizeImageUrl(undefined)).toBe('/images/rooms/room1.jpg');
      });

      it('should return fallback for empty string', () => {
        expect(normalizeImageUrl('')).toBe('/images/rooms/room1.jpg');
      });

      it('should return fallback for whitespace-only string', () => {
        expect(normalizeImageUrl('   ')).toBe('/images/rooms/room1.jpg');
        expect(normalizeImageUrl('\t\n')).toBe('/images/rooms/room1.jpg');
      });
    });
  });

  // ==========================================================================
  // normalizeImageUrls Tests
  // ==========================================================================

  describe('normalizeImageUrls', () => {
    describe('valid arrays', () => {
      it('should normalize array of valid URLs', () => {
        const urls = ['/images/room1.jpg', '/images/room2.jpg'];
        const result = normalizeImageUrls(urls);
        
        expect(result).toEqual(['/images/room1.jpg', '/images/room2.jpg']);
      });

      it('should normalize mixed URL types', () => {
        const urls = ['/images/local.jpg', 'https://example.com/remote.jpg'];
        const result = normalizeImageUrls(urls);
        
        expect(result).toContain('/images/local.jpg');
        expect(result).toContain('https://example.com/remote.jpg');
      });

      it('should filter out null values', () => {
        const urls = ['/images/valid.jpg', null, '/images/another.jpg'];
        const result = normalizeImageUrls(urls);
        
        expect(result).toEqual(['/images/valid.jpg', '/images/another.jpg']);
      });

      it('should filter out undefined values', () => {
        const urls = ['/images/valid.jpg', undefined, '/images/another.jpg'];
        const result = normalizeImageUrls(urls);
        
        expect(result).toEqual(['/images/valid.jpg', '/images/another.jpg']);
      });

      it('should filter out empty strings', () => {
        const urls = ['/images/valid.jpg', '', '/images/another.jpg'];
        const result = normalizeImageUrls(urls);
        
        expect(result).toEqual(['/images/valid.jpg', '/images/another.jpg']);
      });

      it('should filter out fallback URLs from results', () => {
        const urls = ['/images/rooms/room1.jpg', '/images/custom.jpg'];
        const result = normalizeImageUrls(urls);
        
        // The fallback URL should be filtered out, keeping only custom
        expect(result).toEqual(['/images/custom.jpg']);
      });
    });

    describe('invalid arrays', () => {
      it('should return fallback for null array', () => {
        expect(normalizeImageUrls(null)).toEqual(['/images/rooms/room1.jpg']);
      });

      it('should return fallback for undefined array', () => {
        expect(normalizeImageUrls(undefined)).toEqual(['/images/rooms/room1.jpg']);
      });

      it('should return fallback for empty array', () => {
        expect(normalizeImageUrls([])).toEqual(['/images/rooms/room1.jpg']);
      });

      it('should return fallback when all items are invalid', () => {
        const urls = [null, undefined, '', '   '];
        const result = normalizeImageUrls(urls);
        
        expect(result).toEqual(['/images/rooms/room1.jpg']);
      });
    });

    describe('edge cases', () => {
      it('should handle single-item array', () => {
        const result = normalizeImageUrls(['/images/single.jpg']);
        expect(result).toEqual(['/images/single.jpg']);
      });

      it('should handle large arrays', () => {
        const urls = Array(100).fill(null).map((_, i) => `/images/room${i}.jpg`);
        const result = normalizeImageUrls(urls);
        
        expect(result).toHaveLength(100);
        expect(result[0]).toBe('/images/room0.jpg');
        expect(result[99]).toBe('/images/room99.jpg');
      });
    });
  });

  // ==========================================================================
  // getFirstImageUrl Tests
  // ==========================================================================

  describe('getFirstImageUrl', () => {
    describe('valid arrays', () => {
      it('should return first valid image', () => {
        const images = ['/images/first.jpg', '/images/second.jpg'];
        expect(getFirstImageUrl(images)).toBe('/images/first.jpg');
      });

      it('should skip null values and return first valid', () => {
        const images = [null, '/images/valid.jpg', '/images/another.jpg'];
        expect(getFirstImageUrl(images)).toBe('/images/valid.jpg');
      });

      it('should skip undefined values and return first valid', () => {
        const images = [undefined, '/images/valid.jpg'];
        expect(getFirstImageUrl(images)).toBe('/images/valid.jpg');
      });

      it('should skip empty strings and return first valid', () => {
        const images = ['', '   ', '/images/valid.jpg'];
        expect(getFirstImageUrl(images)).toBe('/images/valid.jpg');
      });

      it('should normalize the returned URL', () => {
        const images = ['https://example.com/image.jpg'];
        expect(getFirstImageUrl(images)).toBe('https://example.com/image.jpg');
      });
    });

    describe('fallback behavior', () => {
      it('should return default fallback for null array', () => {
        expect(getFirstImageUrl(null)).toBe('/images/rooms/room1.jpg');
      });

      it('should return default fallback for undefined array', () => {
        expect(getFirstImageUrl(undefined)).toBe('/images/rooms/room1.jpg');
      });

      it('should return default fallback for empty array', () => {
        expect(getFirstImageUrl([])).toBe('/images/rooms/room1.jpg');
      });

      it('should return custom fallback when provided', () => {
        expect(getFirstImageUrl([], '/custom/fallback.jpg')).toBe('/custom/fallback.jpg');
        expect(getFirstImageUrl(null, '/custom/fallback.jpg')).toBe('/custom/fallback.jpg');
      });

      it('should return fallback when all items are invalid', () => {
        const images = [null, undefined, '', '   '];
        expect(getFirstImageUrl(images)).toBe('/images/rooms/room1.jpg');
      });

      it('should return default fallback when all items are invalid (normalizeImageUrl behavior)', () => {
        // Note: When all items are invalid, normalizeImageUrl(undefined) returns the default fallback
        // The custom fallback only applies when the array itself is null/undefined/empty
        const images = [null, undefined, ''];
        expect(getFirstImageUrl(images, '/my/fallback.png')).toBe('/images/rooms/room1.jpg');
      });
    });

    describe('edge cases', () => {
      it('should handle single valid item', () => {
        expect(getFirstImageUrl(['/images/only.jpg'])).toBe('/images/only.jpg');
      });

      it('should handle whitespace-only strings', () => {
        const images = ['\t', '\n', '/images/valid.jpg'];
        expect(getFirstImageUrl(images)).toBe('/images/valid.jpg');
      });
    });
  });
});
