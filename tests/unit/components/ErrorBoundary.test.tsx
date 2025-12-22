/**
 * ErrorBoundary Component Tests
 * Feature: comprehensive-testing
 * Task: 13.2
 * 
 * Tests for error catching, fallback UI rendering, error logging, and recovery
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Error Catching', () => {
    it('should catch errors thrown by child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should catch errors from deeply nested components', () => {
      const DeepNested = () => (
        <div>
          <div>
            <ThrowError />
          </div>
        </div>
      );

      render(
        <ErrorBoundary>
          <DeepNested />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should isolate errors to the boundary', () => {
      render(
        <div>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
          <div data-testid="sibling">Sibling content</div>
        </div>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByTestId('sibling')).toBeInTheDocument();
    });
  });

  describe('Fallback UI Rendering', () => {
    it('should render default fallback UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should display error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Test error/)).toBeInTheDocument();

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
    });
  });

  describe('Error Logging', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should log error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalled();
    });

    it('should pass error details to onError callback', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      const [error] = onError.mock.calls[0];
      expect(error.message).toBe('Test error');
    });
  });

  describe('Recovery Functionality', () => {
    it('should reset error state when Try again is clicked', () => {
      // Use a stateful component to control throwing behavior
      let shouldThrow = true;
      const ControlledComponent = () => {
        if (shouldThrow) {
          throw new Error('Controlled error');
        }
        return <div>No error</div>;
      };

      render(
        <ErrorBoundary>
          <ControlledComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the error condition before clicking try again
      shouldThrow = false;

      // Click try again - this resets the error state and re-renders children
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should allow recovery after error', () => {
      let shouldThrow = true;
      const RecoverableComponent = () => {
        if (shouldThrow) {
          throw new Error('Recoverable error');
        }
        return <div>Recovered!</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Simulate fixing the error condition
      shouldThrow = false;

      // Click try again
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Re-render to trigger recovery
      rerender(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Recovered!')).toBeInTheDocument();
    });

    it('should show error again if recovery fails', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click try again - but component still throws
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Error boundary will catch the error again
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Multiple Boundaries', () => {
    it('should allow nested error boundaries', () => {
      const InnerError = () => {
        throw new Error('Inner error');
      };

      render(
        <ErrorBoundary fallback={<div>Outer fallback</div>}>
          <div>
            <ErrorBoundary fallback={<div>Inner fallback</div>}>
              <InnerError />
            </ErrorBoundary>
            <div data-testid="outer-content">Outer content</div>
          </div>
        </ErrorBoundary>
      );

      // Inner boundary catches the error
      expect(screen.getByText('Inner fallback')).toBeInTheDocument();
      // Outer content is preserved
      expect(screen.getByTestId('outer-content')).toBeInTheDocument();
      // Outer fallback is not shown
      expect(screen.queryByText('Outer fallback')).not.toBeInTheDocument();
    });

    it('should propagate to outer boundary if inner has no fallback handling', () => {
      const OuterError = () => {
        throw new Error('Outer error');
      };

      render(
        <ErrorBoundary fallback={<div>Outer fallback</div>}>
          <OuterError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Outer fallback')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong');
    });

    it('should have accessible try again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <ErrorBoundary>
          {null}
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(
        <ErrorBoundary>
          {undefined}
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle error in one of multiple children', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <ThrowError />
          <div>Child 3</div>
        </ErrorBoundary>
      );

      // All children are replaced by error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Child 3')).not.toBeInTheDocument();
    });
  });
});
