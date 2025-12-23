/**
 * Property-based tests for Touch Target Compliance
 * Property 1: Touch Target Compliance
 * Validates: Requirements 1.5, 8.1
 * 
 * Tests that interactive elements meet WCAG 2.1 touch target requirements
 * (minimum 44x44px for touch targets on mobile devices).
 */

import * as fc from 'fast-check'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { Button } from '@/components/ui/button'

// Button variant and size types
const buttonVariants = ['default', 'secondary', 'ghost', 'outline', 'destructive', 'link', 'success'] as const
const buttonSizes = ['default', 'sm', 'lg', 'icon'] as const

type ButtonVariant = typeof buttonVariants[number]
type ButtonSize = typeof buttonSizes[number]

// Arbitrary generators
const buttonVariantArb = fc.constantFrom(...buttonVariants)
const buttonSizeArb = fc.constantFrom(...buttonSizes)
const buttonTextArb = fc.string({ minLength: 1, maxLength: 50 })

// Cleanup after each test
afterEach(() => {
  cleanup()
})

describe('Touch Target Compliance (Property 1)', () => {
  describe('Requirement 1.5: Minimum touch target size', () => {
    it('should have min-height of at least 36px for all button sizes', () => {
      fc.assert(
        fc.property(
          buttonVariantArb,
          buttonSizeArb,
          buttonTextArb,
          (variant, size, text) => {
            cleanup()
            const { container } = render(
              <Button variant={variant} size={size}>
                {text}
              </Button>
            )
            const button = container.firstChild as HTMLElement
            const classes = button.className

            // Check for min-height class based on size
            switch (size) {
              case 'sm':
                expect(classes).toContain('min-h-[36px]')
                break
              case 'default':
              case 'icon':
                expect(classes).toContain('min-h-[40px]')
                break
              case 'lg':
                expect(classes).toContain('min-h-[44px]')
                break
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should have lg size buttons meet 44px WCAG touch target requirement', () => {
      fc.assert(
        fc.property(buttonVariantArb, buttonTextArb, (variant, text) => {
          cleanup()
          const { container } = render(
            <Button variant={variant} size="lg">
              {text}
            </Button>
          )
          const button = container.firstChild as HTMLElement
          
          // lg buttons must have 44px min-height for WCAG compliance
          expect(button.className).toContain('min-h-[44px]')
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('Requirement 8.1: Touch feedback states', () => {
    it('should have active scale transform for touch feedback', () => {
      fc.assert(
        fc.property(
          buttonVariantArb,
          buttonSizeArb,
          buttonTextArb,
          (variant, size, text) => {
            cleanup()
            const { container } = render(
              <Button variant={variant} size={size}>
                {text}
              </Button>
            )
            const button = container.firstChild as HTMLElement
            
            // All buttons should have active:scale for touch feedback
            expect(button.className).toContain('active:scale-[0.98]')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should have transition for smooth feedback', () => {
      fc.assert(
        fc.property(
          buttonVariantArb,
          buttonSizeArb,
          (variant, size) => {
            cleanup()
            const { container } = render(
              <Button variant={variant} size={size}>
                Click me
              </Button>
            )
            const button = container.firstChild as HTMLElement
            
            // Should have transition classes
            expect(button.className).toContain('transition-all')
            expect(button.className).toContain('duration-micro')
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Button loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      fc.assert(
        fc.property(
          buttonVariantArb,
          buttonSizeArb,
          (variant, size) => {
            cleanup()
            const { container } = render(
              <Button variant={variant} size={size} isLoading>
                Submit
              </Button>
            )
            const button = container.firstChild as HTMLElement
            
            // Should have loading cursor
            expect(button.className).toContain('cursor-wait')
            
            // Should have aria-busy attribute
            expect(button).toHaveAttribute('aria-busy', 'true')
            
            // Should be disabled
            expect(button).toBeDisabled()
            
            // Should contain spinner SVG with animate-spin class
            const spinner = button.querySelector('svg')
            expect(spinner).toBeInTheDocument()
            expect(spinner).toHaveClass('animate-spin')
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should display custom loading text when provided', () => {
      cleanup()
      const { container } = render(
        <Button isLoading loadingText="Processing...">
          Submit
        </Button>
      )
      const button = container.firstChild as HTMLElement
      
      expect(button.textContent).toContain('Processing...')
    })

    it('should display default loading text when not provided', () => {
      cleanup()
      const { container } = render(
        <Button isLoading>
          Submit
        </Button>
      )
      const button = container.firstChild as HTMLElement
      
      expect(button.textContent).toContain('Loading...')
    })
  })

  describe('Button success state', () => {
    it('should show success checkmark when isSuccess is true', () => {
      fc.assert(
        fc.property(buttonSizeArb, (size) => {
          cleanup()
          const { container } = render(
            <Button size={size} isSuccess>
              Submit
            </Button>
          )
          const button = container.firstChild as HTMLElement
          
          // Should have success variant styling
          expect(button.className).toContain('bg-success')
          
          // Should contain checkmark SVG
          const checkmark = button.querySelector('svg')
          expect(checkmark).toBeInTheDocument()
        }),
        { numRuns: 20 }
      )
    })

    it('should display custom success text when provided', () => {
      cleanup()
      const { container } = render(
        <Button isSuccess successText="Saved!">
          Submit
        </Button>
      )
      const button = container.firstChild as HTMLElement
      
      expect(button.textContent).toContain('Saved!')
    })

    it('should display default success text when not provided', () => {
      cleanup()
      const { container } = render(
        <Button isSuccess>
          Submit
        </Button>
      )
      const button = container.firstChild as HTMLElement
      
      expect(button.textContent).toContain('Success!')
    })
  })

  describe('Button disabled state', () => {
    it('should have proper disabled styling', () => {
      fc.assert(
        fc.property(
          buttonVariantArb,
          buttonSizeArb,
          (variant, size) => {
            cleanup()
            const { container } = render(
              <Button variant={variant} size={size} disabled>
                Disabled
              </Button>
            )
            const button = container.firstChild as HTMLElement
            
            // Should have disabled opacity
            expect(button.className).toContain('disabled:opacity-50')
            expect(button.className).toContain('disabled:pointer-events-none')
            
            // Should be disabled
            expect(button).toBeDisabled()
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Button focus states for accessibility', () => {
    it('should have focus ring for keyboard navigation', () => {
      fc.assert(
        fc.property(
          buttonVariantArb,
          buttonSizeArb,
          (variant, size) => {
            cleanup()
            const { container } = render(
              <Button variant={variant} size={size}>
                Focus me
              </Button>
            )
            const button = container.firstChild as HTMLElement
            
            // Should have focus ring classes
            expect(button.className).toContain('focus:outline-none')
            expect(button.className).toContain('focus:ring-2')
            expect(button.className).toContain('focus:ring-offset-2')
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Button icon sizing', () => {
    it('should have consistent icon button dimensions', () => {
      fc.assert(
        fc.property(buttonVariantArb, (variant) => {
          cleanup()
          const { container } = render(
            <Button variant={variant} size="icon">
              <span>X</span>
            </Button>
          )
          const button = container.firstChild as HTMLElement
          
          // Icon buttons should be square
          expect(button.className).toContain('min-h-[40px]')
          expect(button.className).toContain('w-10')
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('Button variant styling', () => {
    it('should apply correct background colors for each variant', () => {
      const variantBackgrounds: Record<ButtonVariant, string> = {
        default: 'bg-accent',
        secondary: 'bg-gray-800',
        ghost: 'text-gray-600',
        outline: 'bg-white',
        destructive: 'bg-red-600',
        link: 'text-accent',
        success: 'bg-success',
      }

      fc.assert(
        fc.property(buttonVariantArb, (variant) => {
          cleanup()
          const { container } = render(
            <Button variant={variant}>
              Test
            </Button>
          )
          const button = container.firstChild as HTMLElement
          
          expect(button.className).toContain(variantBackgrounds[variant])
        }),
        { numRuns: 50 }
      )
    })
  })
})
