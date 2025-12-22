/**
 * Select Component Unit Tests
 * Tests for rendering, states, and styling
 * 
 * Note: Radix UI Select uses browser APIs (hasPointerCapture, scrollIntoView)
 * that are not available in jsdom. Interactive tests (opening dropdown, selection)
 * should be covered by E2E tests with Playwright.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

// Helper to render a basic select
const renderSelect = (props: {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
} = {}) => {
  return render(
    <Select
      defaultValue={props.defaultValue}
      value={props.value}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
    >
      <SelectTrigger data-testid="select-trigger">
        <SelectValue placeholder={props.placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );
};

describe('Select Component', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('should render select trigger', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      renderSelect({ placeholder: 'Choose an option' });
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      renderSelect({ defaultValue: 'option1' });
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should apply custom className to trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-class" data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-trigger')).toHaveClass('custom-class');
    });

    it('should render chevron icon', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have combobox role on trigger', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  describe('Disabled State', () => {
    it('should render disabled trigger', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-trigger')).toBeDisabled();
    });

    it('should have disabled styling classes', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-trigger')).toHaveClass('disabled:cursor-not-allowed');
      expect(screen.getByTestId('select-trigger')).toHaveClass('disabled:opacity-50');
    });

    it('should have aria-disabled when disabled', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-trigger')).toHaveAttribute('disabled');
    });
  });

  // ==========================================================================
  // TOON Compliance Styling
  // ==========================================================================

  describe('TOON Compliance Styling', () => {
    it('should have TOON-compliant height (40px)', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('min-h-[40px]');
    });

    it('should have TOON-compliant border-radius (10px)', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('rounded-[10px]');
    });

    it('should have TOON-compliant font-size (14px)', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('text-[14px]');
    });

    it('should have focus ring styling', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('focus:ring-2');
      expect(trigger).toHaveClass('focus:ring-orange-500/20');
      expect(trigger).toHaveClass('focus:border-orange-500');
    });

    it('should have transition styling', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('transition-all');
      expect(screen.getByTestId('select-trigger')).toHaveClass('duration-150');
    });

    it('should have border styling', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('border');
      expect(trigger).toHaveClass('border-gray-300');
    });

    it('should have background styling', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('bg-white');
    });

    it('should have padding styling', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('px-3');
      expect(trigger).toHaveClass('py-2');
    });
  });

  // ==========================================================================
  // Controlled Component
  // ==========================================================================

  describe('Controlled Component', () => {
    it('should display controlled value', () => {
      render(
        <Select value="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should update when controlled value changes', () => {
      const { rerender } = render(
        <Select value="option1">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      
      rerender(
        <Select value="option2">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility Attributes
  // ==========================================================================

  describe('Accessibility Attributes', () => {
    it('should be focusable', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
    });

    it('should support aria-label', () => {
      render(
        <Select>
          <SelectTrigger aria-label="Select a fruit" data-testid="select-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByTestId('select-trigger')).toHaveAttribute('aria-label', 'Select a fruit');
    });

    it('should have aria-expanded attribute', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-autocomplete attribute', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-autocomplete', 'none');
    });

    it('should have data-state attribute', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });
  });

  // ==========================================================================
  // Placeholder Styling
  // ==========================================================================

  describe('Placeholder Styling', () => {
    it('should have placeholder data attribute when showing placeholder', () => {
      renderSelect({ placeholder: 'Select something' });
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('data-placeholder');
    });

    it('should have placeholder styling class', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('data-[placeholder]:text-gray-500');
    });

    it('should not have placeholder attribute when value is selected', () => {
      renderSelect({ defaultValue: 'option1' });
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).not.toHaveAttribute('data-placeholder');
    });
  });

  // ==========================================================================
  // Layout and Structure
  // ==========================================================================

  describe('Layout and Structure', () => {
    it('should have flex layout', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('justify-between');
    });

    it('should have full width', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('w-full');
    });

    it('should have whitespace-nowrap', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('whitespace-nowrap');
    });

    it('should have line-clamp on span', () => {
      renderSelect();
      expect(screen.getByTestId('select-trigger')).toHaveClass('[&>span]:line-clamp-1');
    });
  });

  // ==========================================================================
  // Icon Styling
  // ==========================================================================

  describe('Icon Styling', () => {
    it('should render chevron down icon', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      const svg = trigger.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('lucide-chevron-down');
    });

    it('should have icon size classes', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      const svg = trigger.querySelector('svg');
      
      expect(svg).toHaveClass('h-4');
      expect(svg).toHaveClass('w-4');
    });

    it('should have icon opacity', () => {
      renderSelect();
      const trigger = screen.getByTestId('select-trigger');
      const svg = trigger.querySelector('svg');
      
      expect(svg).toHaveClass('opacity-50');
    });
  });
});
