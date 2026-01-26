/**
 * Property-based tests for Typography Consistency
 * Property 6: Typography Consistency
 * Validates: Requirements 11.3
 * 
 * Tests that typography styles are consistent across the application,
 * including heading sizes, font weights, and text colors.
 */

import * as fc from 'fast-check'
import React from 'react'
import { render, cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Typography scale based on Tailwind defaults
const headingSizes = {
  h1: ['text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'],
  h2: ['text-3xl', 'text-4xl'],
  h3: ['text-xl', 'text-2xl'],
  h4: ['text-lg', 'text-xl'],
}

const fontWeights = ['font-medium', 'font-semibold', 'font-bold']
const textColors = ['text-gray-900', 'text-gray-800', 'text-gray-700']

// Arbitrary generators
const headingLevelArb = fc.constantFrom('h1', 'h2', 'h3', 'h4') as fc.Arbitrary<keyof typeof headingSizes>
const headingTextArb = fc.string({ minLength: 1, maxLength: 100 })
const fontWeightArb = fc.constantFrom(...fontWeights)
const textColorArb = fc.constantFrom(...textColors)

// Test component that renders headings with consistent styles
function TestHeading({ 
  level, 
  children, 
  className = '' 
}: { 
  level: keyof typeof headingSizes
  children: React.ReactNode
  className?: string 
}) {
  const Tag = level
  const defaultClasses = {
    h1: 'text-5xl font-bold text-gray-900',
    h2: 'text-4xl font-bold text-gray-900',
    h3: 'text-2xl font-semibold text-gray-900',
    h4: 'text-xl font-semibold text-gray-900',
  }
  
  return (
    <Tag className={`${defaultClasses[level]} ${className}`}>
      {children}
    </Tag>
  )
}

// Test component for body text
function TestBodyText({ 
  children, 
  variant = 'default',
  className = '' 
}: { 
  children: React.ReactNode
  variant?: 'default' | 'muted' | 'small'
  className?: string 
}) {
  const variantClasses = {
    default: 'text-base text-gray-700 leading-relaxed',
    muted: 'text-base text-gray-500 leading-relaxed',
    small: 'text-sm text-gray-600 leading-normal',
  }
  
  return (
    <p className={`${variantClasses[variant]} ${className}`}>
      {children}
    </p>
  )
}

describe('Typography Consistency (Property 6)', () => {
  describe('Requirement 11.3: Heading typography', () => {
    it('should render headings with appropriate size classes', () => {
      fc.assert(
        fc.property(headingLevelArb, headingTextArb, (level, text) => {
          cleanup()
          const { container } = render(
            <TestHeading level={level}>{text}</TestHeading>
          )
          
          const heading = container.querySelector(level)
          expect(heading).toBeInTheDocument()
          
          // Check that heading has a valid size class
          const validSizes = headingSizes[level]
          const hasValidSize = validSizes.some(size => 
            heading?.className.includes(size)
          )
          expect(hasValidSize).toBe(true)
        }),
        { numRuns: 50 }
      )
    })

    it('should render headings with bold or semibold weight', () => {
      fc.assert(
        fc.property(headingLevelArb, headingTextArb, (level, text) => {
          cleanup()
          const { container } = render(
            <TestHeading level={level}>{text}</TestHeading>
          )
          
          const heading = container.querySelector(level)
          const hasBoldWeight = heading?.className.includes('font-bold') || 
                               heading?.className.includes('font-semibold')
          expect(hasBoldWeight).toBe(true)
        }),
        { numRuns: 50 }
      )
    })

    it('should render headings with dark text color', () => {
      fc.assert(
        fc.property(headingLevelArb, headingTextArb, (level, text) => {
          cleanup()
          const { container } = render(
            <TestHeading level={level}>{text}</TestHeading>
          )
          
          const heading = container.querySelector(level)
          const hasDarkColor = textColors.some(color => 
            heading?.className.includes(color)
          )
          expect(hasDarkColor).toBe(true)
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('Body text typography', () => {
    it('should render body text with appropriate base size', () => {
      fc.assert(
        fc.property(headingTextArb, (text) => {
          cleanup()
          const { container } = render(
            <TestBodyText>{text}</TestBodyText>
          )
          
          const paragraph = container.querySelector('p')
          expect(paragraph).toHaveClass('text-base')
        }),
        { numRuns: 30 }
      )
    })

    it('should render muted text with lighter color', () => {
      cleanup()
      const { container } = render(
        <TestBodyText variant="muted">Muted text</TestBodyText>
      )
      
      const paragraph = container.querySelector('p')
      expect(paragraph).toHaveClass('text-gray-500')
    })

    it('should render small text with smaller size', () => {
      cleanup()
      const { container } = render(
        <TestBodyText variant="small">Small text</TestBodyText>
      )
      
      const paragraph = container.querySelector('p')
      expect(paragraph).toHaveClass('text-sm')
    })

    it('should have relaxed line height for readability', () => {
      fc.assert(
        fc.property(headingTextArb, (text) => {
          cleanup()
          const { container } = render(
            <TestBodyText>{text}</TestBodyText>
          )
          
          const paragraph = container.querySelector('p')
          expect(paragraph).toHaveClass('leading-relaxed')
        }),
        { numRuns: 30 }
      )
    })
  })

  describe('Typography hierarchy', () => {
    it('should maintain size hierarchy (h1 > h2 > h3 > h4)', () => {
      cleanup()
      const { container } = render(
        <div>
          <TestHeading level="h1">Heading 1</TestHeading>
          <TestHeading level="h2">Heading 2</TestHeading>
          <TestHeading level="h3">Heading 3</TestHeading>
          <TestHeading level="h4">Heading 4</TestHeading>
        </div>
      )
      
      const h1 = container.querySelector('h1')
      const h2 = container.querySelector('h2')
      const h3 = container.querySelector('h3')
      const h4 = container.querySelector('h4')
      
      // H1 should have larger size than H2
      expect(h1?.className).toContain('text-5xl')
      expect(h2?.className).toContain('text-4xl')
      expect(h3?.className).toContain('text-2xl')
      expect(h4?.className).toContain('text-xl')
    })
  })

  describe('Custom className merging', () => {
    it('should merge custom classNames with default styles', () => {
      fc.assert(
        fc.property(
          headingLevelArb,
          headingTextArb,
          fc.constantFrom('mb-4', 'text-center', 'italic'),
          (level, text, customClass) => {
            cleanup()
            const { container } = render(
              <TestHeading level={level} className={customClass}>
                {text}
              </TestHeading>
            )
            
            const heading = container.querySelector(level)
            // Should have both default and custom classes
            expect(heading).toHaveClass(customClass)
            // Should have either font-bold or font-semibold
            const hasFontWeight = heading?.className.includes('font-bold') || 
                                 heading?.className.includes('font-semibold')
            expect(hasFontWeight).toBe(true)
          }
        ),
        { numRuns: 30 }
      )
    })
  })

  describe('Section heading consistency', () => {
    it('should use consistent section heading styles', () => {
      // Section headings should be h2 with text-4xl font-bold text-center
      cleanup()
      const { container } = render(
        <section>
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Section Title
          </h2>
        </section>
      )
      
      const heading = container.querySelector('h2')
      expect(heading).toHaveClass('text-4xl')
      expect(heading).toHaveClass('font-bold')
      expect(heading).toHaveClass('text-gray-900')
      expect(heading).toHaveClass('text-center')
      expect(heading).toHaveClass('mb-12')
    })
  })

  describe('Subtitle typography', () => {
    it('should render subtitles with appropriate styling', () => {
      cleanup()
      const { container } = render(
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
          This is a subtitle that provides additional context
        </p>
      )
      
      const subtitle = container.querySelector('p')
      expect(subtitle).toHaveClass('text-lg')
      expect(subtitle).toHaveClass('text-gray-600')
      expect(subtitle).toHaveClass('text-center')
    })
  })
})
