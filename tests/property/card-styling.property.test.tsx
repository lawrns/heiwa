/**
 * Property-based tests for Card component styling consistency
 * Property 2: Card Styling Consistency
 * Validates: Requirements 1.4, 2.1, 2.3, 2.4
 * 
 * Tests that card components maintain consistent styling across all variants
 * and properly apply hover, focus, and interactive states.
 */

import * as fc from 'fast-check'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants } from '@/components/ui/card'

// Cleanup after each test to prevent element accumulation
afterEach(() => {
  cleanup()
})

// Card variant types
const cardVariantOptions = ['default', 'interactive', 'elevated', 'ghost'] as const
type CardVariant = typeof cardVariantOptions[number]

// Arbitrary generators
const cardVariantArb = fc.constantFrom(...cardVariantOptions)
const cardContentArb = fc.string({ minLength: 1, maxLength: 200 })
const classNameArb = fc.constantFrom('', 'custom-class', 'p-4', 'mt-2 mb-4', 'w-full max-w-md')

describe('Card Styling Consistency (Property 2)', () => {
  describe('Requirement 1.4: Card variants apply correct base classes', () => {
    it('should always include base card classes regardless of variant', () => {
      fc.assert(
        fc.property(cardVariantArb, (variant) => {
          const { container } = render(<Card variant={variant} data-testid="card" />)
          const card = container.firstChild as HTMLElement
          
          // All cards should have these base classes
          expect(card).toHaveClass('rounded-xl')
          expect(card).toHaveClass('bg-white')
          expect(card).toHaveClass('text-gray-950')
          expect(card).toHaveClass('transition-all')
        }),
        { numRuns: 100 }
      )
    })

    it('should apply variant-specific classes correctly', () => {
      fc.assert(
        fc.property(cardVariantArb, (variant) => {
          const { container } = render(<Card variant={variant} />)
          const card = container.firstChild as HTMLElement
          const classes = card.className

          switch (variant) {
            case 'default':
              expect(classes).toContain('shadow-card')
              expect(classes).toContain('border-gray-200')
              break
            case 'interactive':
              expect(classes).toContain('cursor-pointer')
              expect(classes).toContain('shadow-card')
              break
            case 'elevated':
              expect(classes).toContain('shadow-elevated')
              break
            case 'ghost':
              expect(classes).toContain('shadow-none')
              break
          }
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Requirement 2.1: Interactive cards have proper hover states', () => {
    it('should include hover transform classes for interactive variant', () => {
      fc.assert(
        fc.property(fc.constant('interactive'), (variant) => {
          const { container } = render(<Card variant={variant} />)
          const card = container.firstChild as HTMLElement
          const classes = card.className

          // Interactive cards should have hover lift effect
          expect(classes).toContain('hover:-translate-y-1')
          expect(classes).toContain('hover:shadow-card-hover')
        }),
        { numRuns: 50 }
      )
    })

    it('should include active state for touch feedback on interactive cards', () => {
      const { container } = render(<Card variant="interactive" />)
      const card = container.firstChild as HTMLElement
      const classes = card.className

      expect(classes).toContain('active:translate-y-0')
      expect(classes).toContain('active:scale-[0.99]')
    })
  })

  describe('Requirement 2.3: Cards have proper focus states for accessibility', () => {
    it('should include focus-visible ring on interactive cards', () => {
      const { container } = render(<Card variant="interactive" />)
      const card = container.firstChild as HTMLElement
      const classes = card.className

      expect(classes).toContain('focus-visible:outline-none')
      expect(classes).toContain('focus-visible:ring-2')
      expect(classes).toContain('focus-visible:ring-accent')
      expect(classes).toContain('focus-visible:ring-offset-2')
    })
  })

  describe('Requirement 2.4: Custom className merging', () => {
    it('should merge custom classNames without overriding base styles', () => {
      fc.assert(
        fc.property(
          cardVariantArb,
          classNameArb,
          (variant, customClass) => {
            const { container } = render(
              <Card variant={variant} className={customClass} />
            )
            const card = container.firstChild as HTMLElement

            // Base classes should still be present
            expect(card).toHaveClass('rounded-xl')
            expect(card).toHaveClass('bg-white')

            // Custom class should be applied if provided
            if (customClass) {
              customClass.split(' ').forEach(cls => {
                if (cls) expect(card).toHaveClass(cls)
              })
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Card composition components render correctly', () => {
    it('should render CardHeader with proper spacing', () => {
      fc.assert(
        fc.property(cardContentArb, (content) => {
          cleanup() // Clean before each property iteration
          const { container } = render(
            <Card>
              <CardHeader data-testid="header">{content}</CardHeader>
            </Card>
          )
          const header = container.querySelector('[data-testid="header"]')
          expect(header).toHaveClass('flex')
          expect(header).toHaveClass('flex-col')
          expect(header).toHaveClass('p-6')
        }),
        { numRuns: 50 }
      )
    })

    it('should render CardTitle with proper typography', () => {
      fc.assert(
        fc.property(cardContentArb, (content) => {
          cleanup()
          const { container } = render(
            <Card>
              <CardHeader>
                <CardTitle data-testid="title">{content}</CardTitle>
              </CardHeader>
            </Card>
          )
          const title = container.querySelector('[data-testid="title"]')
          expect(title).toHaveClass('text-2xl')
          expect(title).toHaveClass('font-semibold')
        }),
        { numRuns: 50 }
      )
    })

    it('should render CardDescription with muted text', () => {
      fc.assert(
        fc.property(cardContentArb, (content) => {
          cleanup()
          const { container } = render(
            <Card>
              <CardHeader>
                <CardDescription data-testid="desc">{content}</CardDescription>
              </CardHeader>
            </Card>
          )
          const desc = container.querySelector('[data-testid="desc"]')
          expect(desc).toHaveClass('text-sm')
          expect(desc).toHaveClass('text-gray-600')
        }),
        { numRuns: 50 }
      )
    })

    it('should render CardContent with proper padding', () => {
      fc.assert(
        fc.property(cardContentArb, (content) => {
          cleanup()
          const { container } = render(
            <Card>
              <CardContent data-testid="content">{content}</CardContent>
            </Card>
          )
          const cardContent = container.querySelector('[data-testid="content"]')
          expect(cardContent).toHaveClass('p-6')
          expect(cardContent).toHaveClass('pt-0')
        }),
        { numRuns: 50 }
      )
    })

    it('should render CardFooter with flex alignment', () => {
      fc.assert(
        fc.property(cardContentArb, (content) => {
          cleanup()
          const { container } = render(
            <Card>
              <CardFooter data-testid="footer">{content}</CardFooter>
            </Card>
          )
          const footer = container.querySelector('[data-testid="footer"]')
          expect(footer).toHaveClass('flex')
          expect(footer).toHaveClass('items-center')
          expect(footer).toHaveClass('p-6')
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('Card variant transitions', () => {
    it('should have appropriate transition duration for each variant', () => {
      fc.assert(
        fc.property(cardVariantArb, (variant) => {
          const { container } = render(<Card variant={variant} />)
          const card = container.firstChild as HTMLElement
          const classes = card.className

          // All variants should have transition classes
          expect(classes).toContain('transition-all')

          // Check duration based on variant
          if (variant === 'interactive' || variant === 'ghost') {
            expect(classes).toContain('duration-micro')
          } else {
            expect(classes).toContain('duration-standard')
          }
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Full card composition', () => {
    it('should render complete card structure correctly', () => {
      fc.assert(
        fc.property(
          cardVariantArb,
          cardContentArb,
          cardContentArb,
          cardContentArb,
          (variant, title, description, content) => {
            cleanup()
            const { container } = render(
              <Card variant={variant} data-testid="full-card">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>{content}</CardContent>
                <CardFooter>
                  <button>Action</button>
                </CardFooter>
              </Card>
            )

            const card = container.querySelector('[data-testid="full-card"]')
            expect(card).toBeInTheDocument()
            expect(card?.children.length).toBe(3) // Header, Content, Footer
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
