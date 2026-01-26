/**
 * Input Component Unit Tests
 * Tests for rendering, types, states, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('should render an input element', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
      expect(screen.getByTestId('input').tagName).toBe('INPUT');
    });

    it('should render without explicit type attribute when not specified', () => {
      render(<Input data-testid="input" />);
      // HTML inputs default to type="text" even without explicit attribute
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should apply custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should spread additional props', () => {
      render(<Input data-testid="input" aria-label="Test input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-label', 'Test input');
    });
  });

  // ==========================================================================
  // Input Types
  // ==========================================================================

  describe('Input Types', () => {
    it('should render text input', () => {
      render(<Input type="text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('should render email input', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('should render tel input', () => {
      render(<Input type="tel" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
    });

    it('should render url input', () => {
      render(<Input type="url" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'url');
    });

    it('should render search input', () => {
      render(<Input type="search" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'search');
    });

    it('should render date input', () => {
      render(<Input type="date" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'date');
    });

    it('should render file input', () => {
      render(<Input type="file" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'file');
    });
  });

  // ==========================================================================
  // Value and onChange
  // ==========================================================================

  describe('Value and onChange', () => {
    it('should display initial value', () => {
      render(<Input defaultValue="initial value" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('initial value');
    });

    it('should call onChange when value changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} data-testid="input" />);
      
      await userEvent.type(screen.getByTestId('input'), 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on user input', async () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      
      await userEvent.type(input, 'hello');
      expect(input).toHaveValue('hello');
    });

    it('should work as controlled input', () => {
      const { rerender } = render(<Input value="controlled" onChange={() => {}} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('controlled');
      
      rerender(<Input value="updated" onChange={() => {}} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('updated');
    });

    it('should handle number input values', async () => {
      render(<Input type="number" data-testid="input" />);
      const input = screen.getByTestId('input');
      
      await userEvent.type(input, '123');
      expect(input).toHaveValue(123);
    });
  });

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  describe('Disabled State', () => {
    it('should render disabled input', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('should have disabled styling', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('disabled:cursor-not-allowed');
      expect(screen.getByTestId('input')).toHaveClass('disabled:opacity-50');
    });

    it('should not allow input when disabled', async () => {
      const handleChange = jest.fn();
      render(<Input disabled onChange={handleChange} data-testid="input" />);
      
      await userEvent.type(screen.getByTestId('input'), 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Readonly State
  // ==========================================================================

  describe('Readonly State', () => {
    it('should render readonly input', () => {
      render(<Input readOnly data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('readonly');
    });

    it('should display value but not allow editing', async () => {
      render(<Input readOnly defaultValue="readonly value" data-testid="input" />);
      const input = screen.getByTestId('input');
      
      expect(input).toHaveValue('readonly value');
      await userEvent.type(input, 'new text');
      expect(input).toHaveValue('readonly value');
    });
  });

  // ==========================================================================
  // Placeholder
  // ==========================================================================

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      render(<Input placeholder="Enter your name" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter your name');
    });

    it('should have placeholder styling', () => {
      render(<Input placeholder="Test" data-testid="input" />);
      // Component uses gray-400 for placeholder text
      expect(screen.getByTestId('input')).toHaveClass('placeholder:text-gray-400');
    });
  });

  // ==========================================================================
  // TOON Compliance Styling
  // ==========================================================================

  describe('TOON Compliance Styling', () => {
    it('should have TOON-compliant height (40px)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('min-h-[40px]');
    });

    it('should have TOON-compliant border-radius (10px)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('rounded-[10px]');
    });

    it('should have TOON-compliant font-size (14px)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('text-[14px]');
    });

    it('should have focus ring styling', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-2');
      // Component uses accent color for focus ring
      expect(input).toHaveClass('focus-visible:ring-accent/20');
      expect(input).toHaveClass('focus-visible:border-accent');
    });

    it('should have transition styling', () => {
      render(<Input data-testid="input" />);
      // Component uses motion-safe prefix for transitions
      expect(screen.getByTestId('input').className).toMatch(/motion-safe:transition-\[/);
    });
  });

  // ==========================================================================
  // Validation Attributes
  // ==========================================================================

  describe('Validation Attributes', () => {
    it('should accept required attribute', () => {
      render(<Input required data-testid="input" />);
      expect(screen.getByTestId('input')).toBeRequired();
    });

    it('should accept minLength attribute', () => {
      render(<Input minLength={5} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('minLength', '5');
    });

    it('should accept maxLength attribute', () => {
      render(<Input maxLength={100} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('maxLength', '100');
    });

    it('should accept pattern attribute', () => {
      render(<Input pattern="[A-Za-z]+" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('pattern', '[A-Za-z]+');
    });

    it('should accept min/max for number inputs', () => {
      render(<Input type="number" min={0} max={100} data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('Accessibility', () => {
    it('should accept aria-label', () => {
      render(<Input aria-label="Email address" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-label', 'Email address');
    });

    it('should accept aria-describedby', () => {
      render(<Input aria-describedby="help-text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should accept aria-invalid', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should be focusable', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('should support id for label association', () => {
      render(
        <>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" data-testid="input" />
        </>
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // asChild Prop
  // ==========================================================================

  describe('asChild Prop', () => {
    it('should render as Slot when asChild is true', () => {
      render(
        <Input asChild data-testid="input">
          <input type="text" className="custom-input" />
        </Input>
      );
      // When asChild is true, it uses Slot which merges props
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  describe('Event Handlers', () => {
    it('should call onFocus when focused', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} data-testid="input" />);
      
      fireEvent.focus(screen.getByTestId('input'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should call onKeyDown on key press', () => {
      const handleKeyDown = jest.fn();
      render(<Input onKeyDown={handleKeyDown} data-testid="input" />);
      
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('should call onKeyUp on key release', () => {
      const handleKeyUp = jest.fn();
      render(<Input onKeyUp={handleKeyUp} data-testid="input" />);
      
      fireEvent.keyUp(screen.getByTestId('input'), { key: 'Enter' });
      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });
  });
});
