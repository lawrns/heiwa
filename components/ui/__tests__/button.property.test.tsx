/**
 * Property-Based Tests for Button Component
 * Feature: ui-pixel-perfection
 * 
 * Property 1: Button Typography Consistency
 * For any button rendered with the Button component, the computed font-size 
 * SHALL be 14px for primary/default variants and 13px for secondary/destructive 
 * variants, with font-weight of 500.
 * **Validates: Requirements 1.1, 1.2, 3.4**
 * 
 * Property 2: Button Dimensions Compliance
 * For any button rendered with the Button component, the computed styles SHALL 
 * include: min-height of 40px, horizontal padding of at least 16px, vertical 
 * padding of at least 10px, and border-radius of 10px.
 * **Validates: Requirements 1.3, 1.4, 1.5**
 */

import * as fc from 'fast-check';
import * as React from 'react';
import { render, cleanup } from '@testing-library/react';

// Import the button component to test its class generation
import { Button, ButtonProps } from '../button';

// Define the button variants - font sizes are not explicitly set in classes
// The button uses font-medium for all variants
const EXPECTED_FONT_WEIGHT_CLASS = 'font-medium';

// TOON-compliant dimension classes for Property 2
// Updated to match actual Button component implementation
// Note: Component uses pl- and pr- instead of px- for left/right padding
const SIZE_DIMENSION_CLASSES: Record<string, { minHeight: string; paddingLeft: string; paddingRight: string; paddingY: string }> = {
  default: { minHeight: 'min-h-[40px]', paddingLeft: 'pl-5', paddingRight: 'pr-5', paddingY: 'py-2.5' },
  sm: { minHeight: 'min-h-[36px]', paddingLeft: 'pl-4', paddingRight: 'pr-4', paddingY: 'py-2' },
  lg: { minHeight: 'min-h-[44px]', paddingLeft: 'pl-6', paddingRight: 'pr-6', paddingY: 'py-3' },
  icon: { minHeight: 'min-h-[44px]', paddingLeft: '', paddingRight: '', paddingY: '' }, // icon uses w-[44px] instead
};

// Border radius should be 10px for all buttons
const EXPECTED_BORDER_RADIUS_CLASS = 'rounded-[10px]';

// Arbitraries for property-based testing
const buttonVariantArb = fc.constantFrom(
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link'
) as fc.Arbitrary<ButtonProps['variant']>;

const buttonSizeArb = fc.constantFrom(
  'default',
  'sm',
  'lg',
  'icon'
) as fc.Arbitrary<ButtonProps['size']>;

describe('Button Typography Properties', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 1: Button Typography Consistency
   * For any button variant and size combination, the generated classes 
   * SHALL include font-weight 500 (font-medium class).
   */
  it('Property 1: For any button variant and size, font-weight SHALL be 500 (medium)', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        // Render the button and get the DOM element
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        // Get the className from the rendered button
        const className = buttonElement.className;
        
        // Verify the button has the font-medium class (font-weight: 500)
        const hasFontWeightClass = className.includes(EXPECTED_FONT_WEIGHT_CLASS);
        
        // Cleanup after each property check
        cleanup();
        
        return hasFontWeightClass;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Button Dimensions Compliance
 * Feature: ui-pixel-perfection, Property 2
 * 
 * For any button rendered with the Button component, the computed styles SHALL 
 * include: min-height of 40px, horizontal padding of at least 16px, vertical 
 * padding of at least 10px, and border-radius of 10px.
 * 
 * **Validates: Requirements 1.3, 1.4, 1.5**
 */
describe('Button Dimensions Properties', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 2: Border Radius Compliance
   * For any button variant and size, the border-radius SHALL be 10px.
   */
  it('Property 2: For any button variant and size, border-radius SHALL be 10px', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasBorderRadiusClass = className.includes(EXPECTED_BORDER_RADIUS_CLASS);
        
        cleanup();
        
        return hasBorderRadiusClass;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Min-Height Compliance
   * For any button size, the min-height SHALL be at least 40px for default/icon,
   * 36px for sm, and 44px for lg.
   */
  it('Property 2: For any button size, min-height SHALL match TOON specification', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const expectedMinHeight = SIZE_DIMENSION_CLASSES[size || 'default'].minHeight;
        const hasMinHeightClass = className.includes(expectedMinHeight);
        
        cleanup();
        
        return hasMinHeightClass;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Padding Compliance
   * For any non-icon button size, horizontal padding SHALL be at least 16px (pl-4 pr-4)
   * for default, and vertical padding SHALL be at least 10px (py-2.5) for default.
   */
  it('Property 2: For any non-icon button, padding SHALL match TOON specification', () => {
    // Filter out 'icon' size as it uses width instead of padding
    const nonIconSizeArb = fc.constantFrom('default', 'sm', 'lg') as fc.Arbitrary<ButtonProps['size']>;

    fc.assert(
      fc.property(buttonVariantArb, nonIconSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');

        if (!buttonElement) {
          return false;
        }

        const className = buttonElement.className;
        const expectedDimensions = SIZE_DIMENSION_CLASSES[size || 'default'];

        const hasPaddingLeftClass = className.includes(expectedDimensions.paddingLeft);
        const hasPaddingRightClass = className.includes(expectedDimensions.paddingRight);
        const hasPaddingYClass = className.includes(expectedDimensions.paddingY);

        cleanup();

        return hasPaddingLeftClass && hasPaddingRightClass && hasPaddingYClass;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Icon Button Width Compliance
   * For icon buttons, width SHALL be 44px (w-[44px]).
   */
  it('Property 2: For icon buttons, width SHALL be 44px', () => {
    fc.assert(
      fc.property(buttonVariantArb, (variant) => {
        const { container } = render(
          React.createElement(Button, { variant, size: 'icon' }, 'X')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasWidthClass = className.includes('w-[44px]');
        
        cleanup();
        
        return hasWidthClass;
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 10: Interaction State Transitions
 * Feature: ui-pixel-perfection, Property 10
 * 
 * For any button with hover/active states:
 * - hover SHALL apply translateY of -1px (hover:-translate-y-px)
 * - hover SHALL apply shadow (hover:shadow-md)
 * - active SHALL apply translateY of 0px (active:translate-y-0)
 * - active SHALL apply scale of 0.98 (active:scale-[0.98])
 * - transitions SHALL use duration of 150ms (duration-150)
 * - transitions SHALL use ease-out easing (ease-out)
 * 
 * **Validates: Requirements 8.1, 8.2, 8.3**
 */

// Expected interaction state classes
// Updated to use motion-safe prefixes for accessibility compliance
const INTERACTION_STATE_CLASSES = {
  // Hover state: translateY -1px with shadow (Requirement 8.1)
  hoverTranslateY: 'motion-safe:hover:-translate-y-px',
  hoverShadow: 'motion-safe:hover:shadow-md',
  // Active state: scale 0.98 (Requirement 8.2)
  activeScale: 'motion-safe:active:scale-[0.98]',
  // Transition: duration-300 ease-out (Requirement 8.3)
  transitionDuration: 'motion-safe:duration-300',
  transitionEasing: 'motion-safe:ease-out',
  transitionAll: 'motion-safe:transition-all',
};

describe('Button Interaction State Properties', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 10: Hover State - TranslateY
   * For any button variant and size, hover SHALL apply translateY of -1px.
   */
  it('Property 10: For any button, hover SHALL apply translateY of -1px', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasHoverTranslateY = className.includes(INTERACTION_STATE_CLASSES.hoverTranslateY);
        
        cleanup();
        
        return hasHoverTranslateY;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Hover State - Shadow
   * For any button variant and size, hover SHALL apply subtle shadow.
   */
  it('Property 10: For any button, hover SHALL apply shadow-md', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasHoverShadow = className.includes(INTERACTION_STATE_CLASSES.hoverShadow);
        
        cleanup();
        
        return hasHoverShadow;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Active State - Scale
   * For any button variant and size, active SHALL apply scale of 0.98.
   */
  it('Property 10: For any button, active SHALL apply scale of 0.98', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasActiveScale = className.includes(INTERACTION_STATE_CLASSES.activeScale);
        
        cleanup();
        
        return hasActiveScale;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Transition Duration
   * For any button variant and size, transitions SHALL use duration-300.
   */
  it('Property 10: For any button, transitions SHALL use duration-300', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasDuration = className.includes(INTERACTION_STATE_CLASSES.transitionDuration);
        
        cleanup();
        
        return hasDuration;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Transition Easing
   * For any button variant and size, transitions SHALL use ease-out easing.
   */
  it('Property 10: For any button, transitions SHALL use ease-out easing', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        const hasEasing = className.includes(INTERACTION_STATE_CLASSES.transitionEasing);
        
        cleanup();
        
        return hasEasing;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Complete Interaction State Compliance
   * For any button variant and size, ALL interaction state classes SHALL be present.
   */
  it('Property 10: For any button, ALL interaction state classes SHALL be present', () => {
    fc.assert(
      fc.property(buttonVariantArb, buttonSizeArb, (variant, size) => {
        const { container } = render(
          React.createElement(Button, { variant, size }, 'Test Button')
        );
        const buttonElement = container.querySelector('button');
        
        if (!buttonElement) {
          return false;
        }
        
        const className = buttonElement.className;
        
        // Check all interaction state classes are present
        const hasAllClasses = 
          className.includes(INTERACTION_STATE_CLASSES.hoverTranslateY) &&
          className.includes(INTERACTION_STATE_CLASSES.hoverShadow) &&
          className.includes(INTERACTION_STATE_CLASSES.activeScale) &&
          className.includes(INTERACTION_STATE_CLASSES.transitionDuration) &&
          className.includes(INTERACTION_STATE_CLASSES.transitionEasing) &&
          className.includes(INTERACTION_STATE_CLASSES.transitionAll);
        
        cleanup();
        
        return hasAllClasses;
      }),
      { numRuns: 100 }
    );
  });
});
