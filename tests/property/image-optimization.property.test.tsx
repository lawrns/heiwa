/**
 * Property-based tests for Image Optimization
 * Property 5: Image Optimization
 * Validates: Requirements 9.3, 9.4
 * 
 * Tests that image components handle loading states, errors,
 * and provide proper accessibility attributes.
 */

import * as fc from 'fast-check'
import React from 'react'
import { render, cleanup, waitFor } from '@testing-library/react'

// Mock next/image since we're testing in Jest
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ 
    src, 
    alt, 
    onLoad, 
    onError, 
    className,
    ...props 
  }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={onLoad}
        onError={onError}
        data-testid="mock-image"
        {...props}
      />
    )
  },
}))

import { ImageBlur, ImageGalleryItem } from '@/components/ui/image-blur'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Arbitrary generators
const imageUrlArb = fc.constantFrom(
  '/images/test.jpg',
  '/images/room.png',
  'https://example.com/image.jpg',
  '/placeholder.webp'
)
const altTextArb = fc.string({ minLength: 1, maxLength: 100 })
const aspectRatioArb = fc.constantFrom('1/1', '4/3', '16/9', '3/2')

describe('Image Optimization (Property 5)', () => {
  describe('Requirement 9.3: Image loading states', () => {
    it('should render with loading state initially', () => {
      fc.assert(
        fc.property(imageUrlArb, altTextArb, (src, alt) => {
          cleanup()
          const { container } = render(
            <ImageBlur src={src} alt={alt} width={400} height={300} />
          )
          
          // Should have shimmer skeleton while loading
          const shimmer = container.querySelector('.shimmer')
          expect(shimmer).toBeInTheDocument()
        }),
        { numRuns: 30 }
      )
    })

    it('should have blur and scale classes while loading', () => {
      cleanup()
      const { container } = render(
        <ImageBlur src="/test.jpg" alt="Test" width={400} height={300} />
      )
      
      const image = container.querySelector('[data-testid="mock-image"]')
      expect(image).toHaveClass('blur-lg')
      expect(image).toHaveClass('scale-105')
      expect(image).toHaveClass('opacity-0')
    })

    it('should have transition classes for smooth loading', () => {
      fc.assert(
        fc.property(imageUrlArb, altTextArb, (src, alt) => {
          cleanup()
          const { container } = render(
            <ImageBlur src={src} alt={alt} width={400} height={300} />
          )
          
          const image = container.querySelector('[data-testid="mock-image"]')
          expect(image).toHaveClass('transition-[filter,transform,opacity]')
          expect(image).toHaveClass('duration-standard')
        }),
        { numRuns: 30 }
      )
    })
  })

  describe('Requirement 9.4: Image accessibility', () => {
    it('should always have alt text', () => {
      fc.assert(
        fc.property(imageUrlArb, altTextArb, (src, alt) => {
          cleanup()
          const { container } = render(
            <ImageBlur src={src} alt={alt} width={400} height={300} />
          )
          
          const image = container.querySelector('[data-testid="mock-image"]')
          expect(image).toHaveAttribute('alt', alt)
        }),
        { numRuns: 50 }
      )
    })

    it('should have aria-hidden on decorative elements', () => {
      cleanup()
      const { container } = render(
        <ImageBlur src="/test.jpg" alt="Test" width={400} height={300} showSkeleton />
      )
      
      const shimmer = container.querySelector('.shimmer')
      if (shimmer) {
        expect(shimmer).toHaveAttribute('aria-hidden', 'true')
      }
    })
  })

  describe('Fallback handling', () => {
    it('should accept fallback src prop', () => {
      fc.assert(
        fc.property(imageUrlArb, imageUrlArb, altTextArb, (src, fallback, alt) => {
          cleanup()
          // Should not throw when rendering with fallback
          expect(() => {
            render(
              <ImageBlur 
                src={src} 
                alt={alt} 
                fallbackSrc={fallback}
                width={400} 
                height={300} 
              />
            )
          }).not.toThrow()
        }),
        { numRuns: 30 }
      )
    })
  })

  describe('Container styling', () => {
    it('should apply container className', () => {
      cleanup()
      const { container } = render(
        <ImageBlur 
          src="/test.jpg" 
          alt="Test" 
          width={400} 
          height={300}
          containerClassName="custom-container"
        />
      )
      
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-container')
    })

    it('should have overflow hidden on container', () => {
      cleanup()
      const { container } = render(
        <ImageBlur src="/test.jpg" alt="Test" width={400} height={300} />
      )
      
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('overflow-hidden')
    })

    it('should have relative positioning on container', () => {
      cleanup()
      const { container } = render(
        <ImageBlur src="/test.jpg" alt="Test" width={400} height={300} />
      )
      
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('relative')
    })
  })

  describe('ImageGalleryItem component', () => {
    it('should render with aspect ratio', () => {
      fc.assert(
        fc.property(imageUrlArb, altTextArb, aspectRatioArb, (src, alt, aspectRatio) => {
          cleanup()
          const { container } = render(
            <ImageGalleryItem 
              src={src} 
              alt={alt} 
              aspectRatio={aspectRatio}
            />
          )
          
          const wrapper = container.firstChild as HTMLElement
          expect(wrapper.style.aspectRatio).toBe(aspectRatio)
        }),
        { numRuns: 30 }
      )
    })

    it('should have rounded corners', () => {
      cleanup()
      const { container } = render(
        <ImageGalleryItem src="/test.jpg" alt="Test" />
      )
      
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('rounded-lg')
    })

    it('should have overflow hidden', () => {
      cleanup()
      const { container } = render(
        <ImageGalleryItem src="/test.jpg" alt="Test" />
      )
      
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('overflow-hidden')
    })
  })

  describe('Placeholder color', () => {
    it('should apply custom placeholder color', () => {
      cleanup()
      const customColor = '#e5e7eb'
      const { container } = render(
        <ImageBlur 
          src="/test.jpg" 
          alt="Test" 
          width={400} 
          height={300}
          placeholderColor={customColor}
        />
      )
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.style.backgroundColor).toBe('rgb(229, 231, 235)')
    })

    it('should have default placeholder color', () => {
      cleanup()
      const { container } = render(
        <ImageBlur src="/test.jpg" alt="Test" width={400} height={300} />
      )
      
      const wrapper = container.firstChild as HTMLElement
      // Default is #f3f4f6 which is rgb(243, 244, 246)
      expect(wrapper.style.backgroundColor).toBe('rgb(243, 244, 246)')
    })
  })

  describe('Skeleton visibility', () => {
    it('should show skeleton when showSkeleton is true', () => {
      cleanup()
      const { container } = render(
        <ImageBlur 
          src="/test.jpg" 
          alt="Test" 
          width={400} 
          height={300}
          showSkeleton={true}
        />
      )
      
      const shimmer = container.querySelector('.shimmer')
      expect(shimmer).toBeInTheDocument()
    })

    it('should not show skeleton when showSkeleton is false', () => {
      cleanup()
      const { container } = render(
        <ImageBlur 
          src="/test.jpg" 
          alt="Test" 
          width={400} 
          height={300}
          showSkeleton={false}
        />
      )
      
      const shimmer = container.querySelector('.shimmer')
      expect(shimmer).not.toBeInTheDocument()
    })
  })
})
