/**
 * Accessibility Test Setup
 * Feature: comprehensive-testing
 *
 * Configuration and helpers for accessibility testing with jest-axe
 */

import { configureAxe, toHaveNoViolations } from 'jest-axe';
import type { Result } from 'axe-core';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Configure axe-core with WCAG 2.1 AA rules
 */
export const axe = configureAxe({
  rules: {
    // WCAG 2.1 AA compliance rules
    'color-contrast': { enabled: true },
    'valid-aria-role': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'document-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'meta-viewport': { enabled: true },
    'bypass': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
    'tabindex': { enabled: true },
    // Disable rules that may cause false positives in test environment
    'scrollable-region-focusable': { enabled: false },
  },
});

/**
 * Run accessibility check on a container element
 */
export async function checkAccessibility(container: Element): Promise<void> {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

/**
 * Get accessibility violations for debugging
 */
export async function getViolations(container: Element) {
  const results = await axe(container);
  return results.violations;
}

/**
 * Format violations for readable output
 */
export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) {
    return 'No accessibility violations found';
  }

  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.html}\n    ${node.failureSummary}`)
        .join('\n');
      return `${violation.id}: ${violation.description}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Check if element has required ARIA attributes
 */
export function hasRequiredAriaAttributes(element: Element, role: string): boolean {
  const requiredAttributes: Record<string, string[]> = {
    button: [],
    checkbox: ['aria-checked'],
    combobox: ['aria-expanded'],
    dialog: ['aria-modal'],
    listbox: [],
    menu: [],
    menuitem: [],
    option: ['aria-selected'],
    progressbar: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    radio: ['aria-checked'],
    slider: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    spinbutton: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    switch: ['aria-checked'],
    tab: ['aria-selected'],
    tabpanel: [],
    textbox: [],
    tree: [],
    treeitem: [],
  };

  const required = requiredAttributes[role] || [];
  return required.every((attr) => element.hasAttribute(attr));
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');
  
  // Natively focusable elements
  const nativelyFocusable = ['a', 'button', 'input', 'select', 'textarea'];
  if (nativelyFocusable.includes(tagName)) {
    return tabIndex !== '-1';
  }
  
  // Elements with tabindex >= 0
  if (tabIndex !== null && parseInt(tabIndex, 10) >= 0) {
    return true;
  }
  
  return false;
}

/**
 * Check if element has visible focus indicator
 */
export function hasFocusIndicator(element: Element): boolean {
  const styles = window.getComputedStyle(element);
  const focusStyles = window.getComputedStyle(element, ':focus');
  
  // Check for outline or box-shadow on focus
  return (
    focusStyles.outline !== 'none' ||
    focusStyles.boxShadow !== 'none' ||
    styles.getPropertyValue('--focus-ring') !== ''
  );
}

/**
 * Test helper to check color contrast
 */
export function hasAdequateContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return false;

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  // WCAG 2.1 AA requirements
  const minRatio = isLargeText ? 3 : 4.5;
  return ratio >= minRatio;
}
