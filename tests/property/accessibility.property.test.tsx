/**
 * Property-Based Tests for Accessibility
 * Feature: comprehensive-testing
 * 
 * These tests verify that interactive components maintain
 * accessibility attributes across all valid prop combinations.
 */

import * as fc from 'fast-check';
import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  buttonVariantArb,
  buttonSizeArb,
  inputTypeArb,
} from '../utils/generators';
import {
  isKeyboardAccessible,
  hasRequiredAriaAttributes,
} from '../accessibility/setup';

describe('Accessibility Properties', () => {
  /**
   * Property 10: Accessibility Attribute Presence
   * For any interactive component, rendered output SHALL include
   * ARIA attributes and keyboard handlers
   * 
   * Validates: Requirements 8.4, 8.5
   */
  describe('Property 10: Accessibility Attribute Presence', () => {
    describe('Button Accessibility', () => {
      it('should be keyboard accessible for any variant/size', () => {
        fc.assert(
          fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
            const { container } = render(
              <Button variant={variant as any} size={size as any}>
                Test Button
              </Button>
            );
            const button = container.querySelector('button');
            return button !== null && isKeyboardAccessible(button);
          }),
          { numRuns: 100 }
        );
      });

      it('should have accessible name for any variant', () => {
        // Use alphanumeric strings to ensure non-whitespace content
        const nonWhitespaceTextArb = fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.trim().length > 0);
        
        fc.assert(
          fc.property(
            buttonVariantArb,
            nonWhitespaceTextArb,
            (variant, text) => {
              const { container } = render(
                <Button variant={variant as any}>{text}</Button>
              );
              const button = container.querySelector('button');
              // Button should have text content or aria-label
              return (
                button !== null &&
                (button.textContent?.trim().length > 0 ||
                  button.hasAttribute('aria-label'))
              );
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should have correct role for any variant', () => {
        fc.assert(
          fc.property(buttonVariantArb, (variant) => {
            const { container } = render(
              <Button variant={variant as any}>Test</Button>
            );
            const button = container.querySelector('button');
            // Native button element has implicit role="button"
            return (
              button !== null &&
              (button.getAttribute('role') === 'button' ||
                button.tagName.toLowerCase() === 'button')
            );
          }),
          { numRuns: 100 }
        );
      });

      it('should indicate disabled state accessibly', () => {
        fc.assert(
          fc.property(buttonVariantArb, (variant) => {
            const { container } = render(
              <Button variant={variant as any} disabled>
                Test
              </Button>
            );
            const button = container.querySelector('button');
            return (
              button !== null &&
              (button.hasAttribute('disabled') ||
                button.getAttribute('aria-disabled') === 'true')
            );
          }),
          { numRuns: 100 }
        );
      });

      it('should have focus ring styles for any variant', () => {
        fc.assert(
          fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
            const { container } = render(
              <Button variant={variant as any} size={size as any}>
                Test
              </Button>
            );
            const button = container.querySelector('button');
            // Check for focus-related classes
            const className = button?.className || '';
            return (
              button !== null &&
              (className.includes('focus') ||
                className.includes('ring') ||
                className.includes('outline'))
            );
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Input Accessibility', () => {
      it('should be keyboard accessible for any type', () => {
        fc.assert(
          fc.property(inputTypeArb, (type) => {
            const { container } = render(<Input type={type} />);
            const input = container.querySelector('input');
            return input !== null && isKeyboardAccessible(input);
          }),
          { numRuns: 100 }
        );
      });

      it('should support aria-label for any type', () => {
        fc.assert(
          fc.property(
            inputTypeArb,
            fc.string({ minLength: 1, maxLength: 50 }),
            (type, label) => {
              const { container } = render(
                <Input type={type} aria-label={label} />
              );
              const input = container.querySelector('input');
              return (
                input !== null && input.getAttribute('aria-label') === label
              );
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should support aria-describedby for any type', () => {
        fc.assert(
          fc.property(inputTypeArb, (type) => {
            const { container } = render(
              <>
                <Input type={type} aria-describedby="help-text" />
                <span id="help-text">Help text</span>
              </>
            );
            const input = container.querySelector('input');
            return (
              input !== null &&
              input.getAttribute('aria-describedby') === 'help-text'
            );
          }),
          { numRuns: 100 }
        );
      });

      it('should indicate disabled state accessibly', () => {
        fc.assert(
          fc.property(inputTypeArb, (type) => {
            const { container } = render(<Input type={type} disabled />);
            const input = container.querySelector('input');
            return (
              input !== null &&
              (input.hasAttribute('disabled') ||
                input.getAttribute('aria-disabled') === 'true')
            );
          }),
          { numRuns: 100 }
        );
      });

      it('should indicate readonly state accessibly', () => {
        fc.assert(
          fc.property(inputTypeArb, (type) => {
            const { container } = render(<Input type={type} readOnly />);
            const input = container.querySelector('input');
            return (
              input !== null &&
              (input.hasAttribute('readonly') ||
                input.getAttribute('aria-readonly') === 'true')
            );
          }),
          { numRuns: 100 }
        );
      });

      it('should indicate required state accessibly', () => {
        fc.assert(
          fc.property(inputTypeArb, (type) => {
            const { container } = render(<Input type={type} required />);
            const input = container.querySelector('input');
            return (
              input !== null &&
              (input.hasAttribute('required') ||
                input.getAttribute('aria-required') === 'true')
            );
          }),
          { numRuns: 100 }
        );
      });

      it('should have focus ring styles for any type', () => {
        fc.assert(
          fc.property(inputTypeArb, (type) => {
            const { container } = render(<Input type={type} />);
            const input = container.querySelector('input');
            const className = input?.className || '';
            return (
              input !== null &&
              (className.includes('focus') ||
                className.includes('ring') ||
                className.includes('outline'))
            );
          }),
          { numRuns: 100 }
        );
      });
    });

    describe('Combined Accessibility', () => {
      it('should maintain accessibility when components are combined', () => {
        fc.assert(
          fc.property(
            buttonVariantArb,
            inputTypeArb,
            (buttonVariant, inputType) => {
              const { container } = render(
                <form>
                  <label htmlFor="test-input">Test Label</label>
                  <Input id="test-input" type={inputType} />
                  <Button variant={buttonVariant as any} type="submit">
                    Submit
                  </Button>
                </form>
              );

              const input = container.querySelector('input');
              const button = container.querySelector('button');
              const label = container.querySelector('label');

              return (
                input !== null &&
                button !== null &&
                label !== null &&
                label.getAttribute('for') === 'test-input' &&
                input.id === 'test-input' &&
                isKeyboardAccessible(input) &&
                isKeyboardAccessible(button)
              );
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
