/**
 * Property-based tests for Form Validation Feedback
 * Property 3: Form Validation Feedback
 * Validates: Requirements 6.2, 6.3
 * 
 * Tests that form inputs provide consistent visual feedback for
 * validation states (success, error, loading).
 */

import * as fc from 'fast-check'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { Input } from '@/components/ui/input'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Arbitrary generators
const inputTypeArb = fc.constantFrom('text', 'email', 'tel', 'password', 'number')
const placeholderArb = fc.string({ minLength: 1, maxLength: 50 })
const errorMessageArb = fc.string({ minLength: 1, maxLength: 100 })

describe('Form Validation Feedback (Property 3)', () => {
  describe('Requirement 6.2: Success state visual feedback', () => {
    it('should show success border color when isSuccess is true', () => {
      fc.assert(
        fc.property(inputTypeArb, placeholderArb, (type, placeholder) => {
          cleanup()
          const { container } = render(
            <Input type={type} placeholder={placeholder} isSuccess />
          )
          const input = container.querySelector('input')
          
          // Component uses border-green-600 for success state
          expect(input).toHaveClass('border-green-600')
        }),
        { numRuns: 50 }
      )
    })

    it('should show success checkmark icon when isSuccess is true', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isSuccess />
      )
      
      // Should have success indicator with Check icon
      const successIcon = container.querySelector('svg')
      expect(successIcon).toBeInTheDocument()
      
      // Parent should have success text color (green-600)
      const iconWrapper = successIcon?.parentElement
      expect(iconWrapper).toHaveClass('text-green-600')
    })

    it('should have success background tint when isSuccess is true', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isSuccess />
      )
      const input = container.querySelector('input')
      
      // Component uses bg-green-50 for success background
      expect(input?.className).toContain('bg-green-50')
    })
  })

  describe('Requirement 6.3: Error state visual feedback', () => {
    it('should show error border color when isError is true', () => {
      fc.assert(
        fc.property(inputTypeArb, placeholderArb, (type, placeholder) => {
          cleanup()
          const { container } = render(
            <Input type={type} placeholder={placeholder} isError />
          )
          const input = container.querySelector('input')
          
          // Component uses border-red-600 for error state
          expect(input).toHaveClass('border-red-600')
        }),
        { numRuns: 50 }
      )
    })

    it('should show error icon when isError is true', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isError />
      )
      
      // Should have error indicator with AlertCircle icon
      const errorIcon = container.querySelector('svg')
      expect(errorIcon).toBeInTheDocument()
      
      // Parent should have error text color (red-600)
      const iconWrapper = errorIcon?.parentElement
      expect(iconWrapper).toHaveClass('text-red-600')
    })

    it('should apply shake animation when isError is true', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isError />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveClass('animate-shake')
    })

    it('should display error message when provided', () => {
      fc.assert(
        fc.property(errorMessageArb, (errorMessage) => {
          cleanup()
          const { container } = render(
            <Input type="text" isError errorMessage={errorMessage} id="test-input" />
          )
          
          const errorElement = container.querySelector('#test-input-error')
          expect(errorElement).toBeInTheDocument()
          expect(errorElement?.textContent).toBe(errorMessage)
        }),
        { numRuns: 30 }
      )
    })

    it('should have aria-invalid attribute when isError is true', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isError />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should have aria-describedby linking to error message', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isError errorMessage="Test error" id="test-input" />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
    })
  })

  describe('Loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isLoading />
      )
      
      // Should have loading spinner
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show success icon when loading', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isSuccess isLoading />
      )
      
      // Should not have success icon (Check)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBe(0)
      
      // Should have loading spinner
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show error icon when loading', () => {
      cleanup()
      const { container } = render(
        <Input type="text" isError isLoading />
      )
      
      // Should not have error icon (AlertCircle)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBe(0)
      
      // Should have loading spinner
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Default state', () => {
    it('should have default border color when no state is set', () => {
      fc.assert(
        fc.property(inputTypeArb, (type) => {
          cleanup()
          const { container } = render(
            <Input type={type} />
          )
          const input = container.querySelector('input')
          
          expect(input).toHaveClass('border-gray-300')
          expect(input).not.toHaveClass('border-green-600')
          expect(input).not.toHaveClass('border-red-600')
        }),
        { numRuns: 30 }
      )
    })

    it('should not show any icons in default state', () => {
      cleanup()
      const { container } = render(
        <Input type="text" />
      )
      
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBe(0)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe('Focus states', () => {
    it('should have focus ring classes for all states', () => {
      fc.assert(
        fc.property(
          inputTypeArb,
          fc.boolean(),
          fc.boolean(),
          (type, isSuccess, isError) => {
            cleanup()
            const { container } = render(
              <Input type={type} isSuccess={isSuccess} isError={isError} />
            )
            const input = container.querySelector('input')
            
            // All inputs should have focus ring classes
            expect(input).toHaveClass('focus-visible:outline-none')
            expect(input).toHaveClass('focus-visible:ring-2')
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Transition animations', () => {
    it('should have transition classes for smooth state changes', () => {
      fc.assert(
        fc.property(inputTypeArb, (type) => {
          cleanup()
          const { container } = render(
            <Input type={type} />
          )
          const input = container.querySelector('input')
          
          // Component uses motion-safe:transition-[...] and motion-safe:duration-300
          expect(input.className).toMatch(/motion-safe:transition-\[/)
          expect(input).toHaveClass('motion-safe:duration-300')
        }),
        { numRuns: 30 }
      )
    })
  })

  describe('Disabled state', () => {
    it('should have disabled styling when disabled', () => {
      cleanup()
      const { container } = render(
        <Input type="text" disabled />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
      expect(input).toBeDisabled()
    })
  })

  describe('Input types for mobile keyboards', () => {
    it('should accept email type for email inputs', () => {
      cleanup()
      const { container } = render(
        <Input type="email" />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should accept tel type for phone inputs', () => {
      cleanup()
      const { container } = render(
        <Input type="tel" />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should accept number type for numeric inputs', () => {
      cleanup()
      const { container } = render(
        <Input type="number" />
      )
      const input = container.querySelector('input')
      
      expect(input).toHaveAttribute('type', 'number')
    })
  })
})
