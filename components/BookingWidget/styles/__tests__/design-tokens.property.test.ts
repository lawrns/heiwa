/**
 * Property-Based Tests for Design Tokens
 * 
 * Feature: ui-pixel-perfection, Property 4: Spacing Scale Definition
 * Validates: Requirements 2.1
 * 
 * Property 4: Spacing Scale Definition
 * *For any* access to the design tokens spacing scale, the returned values 
 * SHALL match exactly: xs=4px, sm=8px, md=12px, lg=16px, xl=24px, xxl=32px.
 */

import * as fc from 'fast-check';
import { bookingWidgetTokens } from '../design-tokens';

describe('Feature: ui-pixel-perfection, Property 4: Spacing Scale Definition', () => {
  // Expected TOON-compliant spacing scale values
  const expectedSpacingScale = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  } as const;

  const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
  type SpacingKey = typeof spacingKeys[number];

  /**
   * Property 4: Spacing Scale Definition
   * For any spacing key in the scale, the value SHALL match the TOON-compliant specification.
   * Validates: Requirements 2.1
   */
  it('Property 4: For any spacing key, the value matches TOON-compliant specification', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...spacingKeys),
        (spacingKey: SpacingKey) => {
          const actualValue = bookingWidgetTokens.spacing[spacingKey];
          const expectedValue = expectedSpacingScale[spacingKey];
          
          return actualValue === expectedValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4a: Spacing values are valid CSS pixel values
   * For any spacing value in the scale, it SHALL be a valid CSS pixel string.
   * Validates: Requirements 2.1
   */
  it('Property 4a: For any spacing value, it is a valid CSS pixel string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...spacingKeys),
        (spacingKey: SpacingKey) => {
          const value = bookingWidgetTokens.spacing[spacingKey];
          // Must match pattern: number followed by 'px'
          const pxPattern = /^\d+px$/;
          return pxPattern.test(value);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4b: Spacing scale is monotonically increasing
   * For any two adjacent spacing keys, the larger key SHALL have a larger pixel value.
   * Validates: Requirements 2.1
   */
  it('Property 4b: Spacing scale is monotonically increasing', () => {
    const orderedKeys = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
    const adjacentPairs = orderedKeys.slice(0, -1).map((key, i) => [key, orderedKeys[i + 1]] as const);

    fc.assert(
      fc.property(
        fc.constantFrom(...adjacentPairs),
        ([smallerKey, largerKey]) => {
          const smallerValue = parseInt(bookingWidgetTokens.spacing[smallerKey]);
          const largerValue = parseInt(bookingWidgetTokens.spacing[largerKey]);
          
          return largerValue > smallerValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4c: All required spacing keys exist
   * The spacing scale SHALL contain all required keys: xs, sm, md, lg, xl, xxl.
   * Validates: Requirements 2.1
   */
  it('Property 4c: All required spacing keys exist in the scale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...spacingKeys),
        (spacingKey: SpacingKey) => {
          return spacingKey in bookingWidgetTokens.spacing;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4d: Spacing scale completeness
   * The spacing scale SHALL contain exactly the required keys, no more, no less.
   * Validates: Requirements 2.1
   */
  it('Property 4d: Spacing scale contains exactly the required keys', () => {
    const actualKeys = Object.keys(bookingWidgetTokens.spacing).sort();
    const expectedKeys = [...spacingKeys].sort();
    
    expect(actualKeys).toEqual(expectedKeys);
  });
});
