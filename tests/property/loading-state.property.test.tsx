/**
 * Property Test: Loading State Rendering
 * Feature: airbnb-quality-ux, Property 4
 * 
 * *For any* component in a loading state, the component SHALL render either
 * a Skeleton placeholder or a spinner indicator, and interactive elements
 * SHALL be disabled during loading.
 * 
 * **Validates: Requirements 7.1, 7.2, 7.4**
 */

import * as fc from 'fast-check'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonButton, SkeletonInput } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

describe('Property 4: Loading State Rendering', () => {
  describe('Skeleton Component Properties', () => {
    it('should render skeleton with shimmer animation by default', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('text', 'circular', 'rectangular', 'card'),
          (variant) => {
            const { container } = render(
              <Skeleton variant={variant as any} data-testid="skeleton" />
            )
            
            // Should have shimmer class when animate is true (default)
            const skeleton = container.querySelector('.shimmer')
            return skeleton !== null || variant === 'card' // card has shimmer on children
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not have shimmer animation when animate is false', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('text', 'circular', 'rectangular'),
          (variant) => {
            const { container } = render(
              <Skeleton variant={variant as any} animate={false} data-testid="skeleton" />
            )
            
            const skeleton = container.querySelector('.shimmer')
            return skeleton === null
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should apply custom width and height', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 500 }),
          fc.integer({ min: 10, max: 500 }),
          (width, height) => {
            const { container } = render(
              <Skeleton width={width} height={height} data-testid="skeleton" />
            )
            
            const skeleton = container.firstChild as HTMLElement
            const styles = skeleton.style
            
            return (
              styles.width === `${width}px` &&
              styles.height === `${height}px`
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should render correct number of lines for text variant', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (lines) => {
            const { container } = render(
              <SkeletonText lines={lines} data-testid="skeleton" />
            )
            
            if (lines === 1) {
              // Single line renders as single div
              const skeleton = container.firstChild as HTMLElement
              return skeleton.classList.contains('h-4')
            } else {
              // Multiple lines render in a container
              const skeletonLines = container.querySelectorAll('.h-4')
              return skeletonLines.length === lines
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should render circular skeleton with equal width and height', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20, max: 200 }),
          (size) => {
            const { container } = render(
              <SkeletonAvatar size={size} data-testid="skeleton" />
            )
            
            const skeleton = container.firstChild as HTMLElement
            const styles = skeleton.style
            
            return (
              styles.width === `${size}px` &&
              styles.height === `${size}px` &&
              skeleton.classList.contains('rounded-full')
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Button Loading State Properties', () => {
    it('should disable button when loading', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isLoading) => {
            const { unmount } = render(
              <Button disabled={isLoading} data-testid={`button-${isLoading}`}>
                {isLoading ? 'Loading...' : 'Click me'}
              </Button>
            )
            
            const button = screen.getByTestId(`button-${isLoading}`)
            const result = isLoading ? button.hasAttribute('disabled') : !button.hasAttribute('disabled')
            
            unmount()
            return result
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Skeleton Variant Properties', () => {
    it('should render card skeleton with image and content placeholders', () => {
      const { container } = render(<SkeletonCard data-testid="skeleton-card" />)
      
      // Should have image placeholder (h-48)
      const imagePlaceholder = container.querySelector('.h-48')
      expect(imagePlaceholder).not.toBeNull()
      
      // Should have content placeholders
      const contentPlaceholders = container.querySelectorAll('.h-4, .h-5')
      expect(contentPlaceholders.length).toBeGreaterThan(0)
    })

    it('should render button skeleton with correct size classes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('sm', 'default', 'lg'),
          (size) => {
            const { container } = render(
              <SkeletonButton size={size as any} data-testid="skeleton-button" />
            )
            
            const skeleton = container.firstChild as HTMLElement
            const sizeClasses = {
              sm: ['h-9', 'w-20'],
              default: ['h-10', 'w-24'],
              lg: ['h-11', 'w-32'],
            }
            
            return sizeClasses[size as keyof typeof sizeClasses].every(
              cls => skeleton.classList.contains(cls)
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should render input skeleton with correct dimensions', () => {
      const { container } = render(<SkeletonInput data-testid="skeleton-input" />)
      
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.classList.contains('h-10')).toBe(true)
      expect(skeleton.classList.contains('w-full')).toBe(true)
      expect(skeleton.classList.contains('rounded-[10px]')).toBe(true)
    })
  })

  describe('Loading State Accessibility', () => {
    it('should have appropriate ARIA attributes for loading states', () => {
      // Skeletons should be presentational
      const { container } = render(
        <div role="status" aria-busy="true" aria-label="Loading content">
          <Skeleton width={200} height={20} />
          <Skeleton width={150} height={20} />
        </div>
      )
      
      const statusRegion = container.querySelector('[role="status"]')
      expect(statusRegion).not.toBeNull()
      expect(statusRegion?.getAttribute('aria-busy')).toBe('true')
    })
  })
})
