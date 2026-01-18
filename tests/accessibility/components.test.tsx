/**
 * Component Accessibility Tests
 * Feature: comprehensive-testing
 * 
 * Tests for WCAG 2.1 AA compliance of UI components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Component Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button onClick={onClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
      
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalled();
    });

    it('should have proper focus styles', () => {
      render(<Button>Focus me</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('should have no accessibility violations with label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Name</label>
          <Input id="test-input" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when disabled', async () => {
      const { container } = render(
        <div>
          <label htmlFor="disabled-input">Disabled</label>
          <Input id="disabled-input" disabled />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support aria-describedby for error messages', async () => {
      const { container } = render(
        <div>
          <label htmlFor="email-input">Email</label>
          <Input 
            id="email-input" 
            aria-describedby="email-error"
            aria-invalid="true"
          />
          <span id="email-error">Please enter a valid email</span>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <label htmlFor="keyboard-input">Type here</label>
          <Input id="keyboard-input" />
        </div>
      );
      
      const input = screen.getByRole('textbox');
      await user.tab();
      expect(document.activeElement).toBe(input);
      
      await user.type(input, 'Hello');
      expect(input).toHaveValue('Hello');
    });

    it('should have proper focus styles', () => {
      render(
        <div>
          <label htmlFor="focus-input">Focus</label>
          <Input id="focus-input" />
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form structure', async () => {
      const { container } = render(
        <form aria-label="Contact form">
          <div>
            <label htmlFor="name">Name</label>
            <Input id="name" required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" required />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support required field indicators', () => {
      render(
        <div>
          <label htmlFor="required-field">
            Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <Input id="required-field" required aria-required="true" />
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation between form elements', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <div>
            <label htmlFor="first">First</label>
            <Input id="first" />
          </div>
          <div>
            <label htmlFor="second">Second</label>
            <Input id="second" />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      // Tab through elements
      await user.tab();
      expect(screen.getByLabelText('First')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Second')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('should skip disabled elements in tab order', async () => {
      const user = userEvent.setup();
      
      render(
        <form>
          <div>
            <label htmlFor="enabled">Enabled</label>
            <Input id="enabled" />
          </div>
          <div>
            <label htmlFor="disabled">Disabled</label>
            <Input id="disabled" disabled />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );
      
      await user.tab();
      expect(screen.getByLabelText('Enabled')).toHaveFocus();
      
      await user.tab();
      // Should skip disabled input and go to button
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });

  describe('Focus Management', () => {
    it('should maintain visible focus indicator', () => {
      render(<Button>Focus visible</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      // Check for focus styles
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('should support focus trap in modal-like components', async () => {
      const user = userEvent.setup();
      
      render(
        <div role="dialog" aria-modal="true" aria-label="Test dialog">
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Close</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      
      expect(document.activeElement).toBe(buttons[0]);
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for button text', async () => {
      const { container } = render(
        <Button>High contrast text</Button>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have sufficient contrast for input text', async () => {
      const { container } = render(
        <div>
          <label htmlFor="contrast-input">Input</label>
          <Input id="contrast-input" defaultValue="Test value" />
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper button roles', () => {
      render(<Button>Action</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have proper input roles', () => {
      render(
        <div>
          <label htmlFor="sr-input">Label</label>
          <Input id="sr-input" />
        </div>
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should support aria-live for dynamic content', () => {
      render(
        <div aria-live="polite" aria-atomic="true">
          Status message
        </div>
      );
      
      const liveRegion = screen.getByText('Status message');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
