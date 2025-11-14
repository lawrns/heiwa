/**
 * Image Utilities Unit Tests
 * Tests for lib/image-utils.ts
 */

import { normalizeImageUrl, normalizeImageUrls, getFirstImageUrl } from '@/lib/image-utils'

describe('Image Utilities', () => {
  describe('normalizeImageUrl', () => {
    it('should return fallback for null URL', () => {
      expect(normalizeImageUrl(null)).toBe('/images/rooms/room1.jpg')
    })

    it('should return fallback for undefined URL', () => {
      expect(normalizeImageUrl(undefined)).toBe('/images/rooms/room1.jpg')
    })

    it('should return relative paths as-is', () => {
      expect(normalizeImageUrl('/images/test.jpg')).toBe('/images/test.jpg')
      expect(normalizeImageUrl('/images/rooms/room2.jpg')).toBe('/images/rooms/room2.jpg')
    })

    it('should return full URLs as-is', () => {
      const url = 'https://example.com/image.jpg'
      expect(normalizeImageUrl(url)).toBe(url)
    })

    it('should return Supabase URLs as-is', () => {
      const url = 'https://zejrhceuuujzgyukdwnb.supabase.co/storage/v1/object/public/rooms/image.jpg'
      expect(normalizeImageUrl(url)).toBe(url)
    })

    it('should return HTTP URLs as-is', () => {
      const url = 'http://example.com/image.jpg'
      expect(normalizeImageUrl(url)).toBe(url)
    })

    it('should handle empty string', () => {
      expect(normalizeImageUrl('')).toBe('/images/rooms/room1.jpg')
    })
  })

  describe('normalizeImageUrls', () => {
    it('should return fallback array for null input', () => {
      expect(normalizeImageUrls(null)).toEqual(['/images/rooms/room1.jpg'])
    })

    it('should return fallback array for undefined input', () => {
      expect(normalizeImageUrls(undefined)).toEqual(['/images/rooms/room1.jpg'])
    })

    it('should return fallback array for empty array', () => {
      expect(normalizeImageUrls([])).toEqual(['/images/rooms/room1.jpg'])
    })

    it('should normalize array of URLs', () => {
      const urls = [
        '/images/test1.jpg',
        'https://example.com/test2.jpg',
        '/images/test3.jpg',
      ]
      expect(normalizeImageUrls(urls)).toEqual(urls)
    })

    it('should filter out null and undefined values', () => {
      const urls = [
        '/images/test1.jpg',
        null,
        '/images/test2.jpg',
        undefined,
        '/images/test3.jpg',
      ]
      expect(normalizeImageUrls(urls)).toEqual([
        '/images/test1.jpg',
        '/images/test2.jpg',
        '/images/test3.jpg',
      ])
    })

    it('should filter out empty strings', () => {
      const urls = ['/images/test1.jpg', '', '   ', '/images/test2.jpg']
      expect(normalizeImageUrls(urls)).toEqual([
        '/images/test1.jpg',
        '/images/test2.jpg',
      ])
    })

    it('should filter out fallback image from array', () => {
      const urls = ['/images/test1.jpg', '/images/rooms/room1.jpg', '/images/test2.jpg']
      expect(normalizeImageUrls(urls)).toEqual([
        '/images/test1.jpg',
        '/images/test2.jpg',
      ])
    })

    it('should return fallback if all URLs are invalid', () => {
      const urls = [null, undefined, '', '   ', '/images/rooms/room1.jpg']
      expect(normalizeImageUrls(urls)).toEqual(['/images/rooms/room1.jpg'])
    })

    it('should handle errors gracefully', () => {
      // Mock console.warn to avoid test output
      const originalWarn = console.warn
      console.warn = jest.fn()

      // Create an array that might cause errors
      const urls = ['/images/test.jpg']
      
      // This should not throw
      expect(() => normalizeImageUrls(urls)).not.toThrow()

      console.warn = originalWarn
    })

    it('should handle mixed URL types', () => {
      const urls = [
        '/images/relative.jpg',
        'https://example.com/absolute.jpg',
        'http://example.com/http.jpg',
        null,
        '/images/rooms/room1.jpg',
      ]
      const result = normalizeImageUrls(urls)
      
      expect(result).toContain('/images/relative.jpg')
      expect(result).toContain('https://example.com/absolute.jpg')
      expect(result).toContain('http://example.com/http.jpg')
      expect(result).not.toContain('/images/rooms/room1.jpg')
    })
  })

  describe('getFirstImageUrl', () => {
    it('should return fallback for null input', () => {
      expect(getFirstImageUrl(null)).toBe('/images/rooms/room1.jpg')
    })

    it('should return fallback for undefined input', () => {
      expect(getFirstImageUrl(undefined)).toBe('/images/rooms/room1.jpg')
    })

    it('should return fallback for empty array', () => {
      expect(getFirstImageUrl([])).toBe('/images/rooms/room1.jpg')
    })

    it('should return first valid image URL', () => {
      const images = ['/images/test1.jpg', '/images/test2.jpg', '/images/test3.jpg']
      expect(getFirstImageUrl(images)).toBe('/images/test1.jpg')
    })

    it('should skip null/undefined values', () => {
      const images = [null, undefined, '/images/test1.jpg', '/images/test2.jpg']
      expect(getFirstImageUrl(images)).toBe('/images/test1.jpg')
    })

    it('should skip empty strings', () => {
      const images = ['', '   ', '/images/test1.jpg']
      expect(getFirstImageUrl(images)).toBe('/images/test1.jpg')
    })

    it('should use custom fallback', () => {
      expect(getFirstImageUrl(null, '/custom/fallback.jpg')).toBe('/custom/fallback.jpg')
    })

    it('should return first URL even if others are invalid', () => {
      const images = ['/images/valid.jpg', null, undefined, '']
      expect(getFirstImageUrl(images)).toBe('/images/valid.jpg')
    })

    it('should handle Supabase URLs', () => {
      const images = [
        'https://zejrhceuuujzgyukdwnb.supabase.co/storage/v1/object/public/rooms/image.jpg',
        '/images/test2.jpg',
      ]
      expect(getFirstImageUrl(images)).toBe(images[0])
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg'
      expect(normalizeImageUrl(longUrl)).toBe(longUrl)
    })

    it('should handle URLs with query parameters', () => {
      const url = 'https://example.com/image.jpg?width=800&height=600'
      expect(normalizeImageUrl(url)).toBe(url)
    })

    it('should handle URLs with hash fragments', () => {
      const url = 'https://example.com/image.jpg#section'
      expect(normalizeImageUrl(url)).toBe(url)
    })

    it('should handle whitespace-only strings', () => {
      expect(normalizeImageUrl('   ')).toBe('/images/rooms/room1.jpg')
    })

    it('should handle arrays with only whitespace', () => {
      expect(normalizeImageUrls(['   ', '  '])).toEqual(['/images/rooms/room1.jpg'])
    })
  })
})

