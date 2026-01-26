/**
 * Type declarations for jest-axe
 * Provides TypeScript support for axe accessibility testing with Jest
 */

declare module 'jest-axe' {
  import { AxeResults, RunOptions, Spec } from 'axe-core';

  export interface JestAxeConfigureOptions {
    globalOptions?: Spec;
    impactLevels?: string[];
    rules?: RunOptions['rules'];
  }

  export function axe(
    html: Element | string,
    options?: RunOptions
  ): Promise<AxeResults>;

  export function configureAxe(
    options?: JestAxeConfigureOptions
  ): (html: Element | string, options?: RunOptions) => Promise<AxeResults>;

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): {
      pass: boolean;
      message: () => string;
    };
  };
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

export {};
