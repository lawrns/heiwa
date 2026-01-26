/**
 * React Testing Library Render Helpers
 * Provides utilities for rendering components with providers and router context
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

// ============================================================================
// Types
// ============================================================================

interface WrapperProps {
  children: React.ReactNode;
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Record<string, unknown>;
}

interface RenderWithRouterOptions extends RenderWithProvidersOptions {
  route?: string;
}

// ============================================================================
// Provider Wrapper
// ============================================================================

/**
 * Default wrapper that includes all necessary providers
 * Add providers here as needed (e.g., ThemeProvider, QueryClientProvider)
 */
function AllProviders({ children }: WrapperProps): ReactElement {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}

// ============================================================================
// Render Utilities
// ============================================================================

/**
 * Render a component with all providers wrapped
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult {
  const { initialState, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions,
  });
}

/**
 * Render a component with router context
 * Note: For Next.js, you may need to mock useRouter
 */
export function renderWithRouter(
  ui: ReactElement,
  options: RenderWithRouterOptions = {}
): RenderResult {
  const { route = '/', ...rest } = options;
  
  // Set window.location for route-dependent components
  if (typeof window !== 'undefined') {
    window.history.pushState({}, 'Test page', route);
  }
  
  return renderWithProviders(ui, rest);
}

/**
 * Custom render that includes common setup
 * Use this as the default render in tests
 */
export function customRender(
  ui: ReactElement,
  options?: RenderOptions
): RenderResult {
  return render(ui, {
    wrapper: AllProviders,
    ...options,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };
