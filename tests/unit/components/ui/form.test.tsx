/**
 * Form Component Unit Tests
 * Tests for form field rendering, validation, and accessibility
 * 
 * The Form components wrap react-hook-form with Radix UI primitives
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type TestFormValues = {
  username: string;
  email: string;
};

// Helper component to render a form with react-hook-form
const TestForm = ({
  onSubmit = jest.fn(),
  defaultValues = { username: '', email: '' },
  showDescription = false,
}: {
  onSubmit?: (data: TestFormValues) => void;
  defaultValues?: Partial<TestFormValues>;
  showDescription?: boolean;
}) => {
  const form = useForm<TestFormValues>({
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="username"
          rules={{
            required: 'Username is required',
            minLength: { value: 2, message: 'Username must be at least 2 characters' },
          }}
          render={({ field }) => (
            <FormItem data-testid="username-item">
              <FormLabel data-testid="username-label">Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter username"
                  data-testid="username-input"
                  {...field}
                />
              </FormControl>
              {showDescription && (
                <FormDescription data-testid="username-description">
                  Your public display name
                </FormDescription>
              )}
              <FormMessage data-testid="username-message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <FormItem data-testid="email-item">
              <FormLabel data-testid="email-label">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email"
                  data-testid="email-input"
                  {...field}
                />
              </FormControl>
              <FormMessage data-testid="email-message" />
            </FormItem>
          )}
        />
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    </Form>
  );
};

describe('Form Components', () => {
  // ==========================================================================
  // FormItem
  // ==========================================================================

  describe('FormItem', () => {
    it('should render form item container', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-item')).toBeInTheDocument();
    });

    it('should have spacing class', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-item')).toHaveClass('space-y-2');
    });

    it('should render multiple form items', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-item')).toBeInTheDocument();
      expect(screen.getByTestId('email-item')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FormLabel
  // ==========================================================================

  describe('FormLabel', () => {
    it('should render label text', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-label')).toHaveTextContent('Username');
    });

    it('should be associated with input via htmlFor', () => {
      render(<TestForm />);
      const label = screen.getByTestId('username-label');
      const input = screen.getByTestId('username-input');
      
      // Label should have htmlFor pointing to input's id
      expect(label).toHaveAttribute('for');
      expect(input).toHaveAttribute('id');
      expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    });

    it('should show error styling when field has error', async () => {
      render(<TestForm />);
      
      // Submit to trigger validation
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        const label = screen.getByTestId('username-label');
        expect(label).toHaveClass('text-destructive');
      });
    });
  });

  // ==========================================================================
  // FormControl
  // ==========================================================================

  describe('FormControl', () => {
    it('should render input within form control', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
    });

    it('should set aria-invalid when field has error', async () => {
      render(<TestForm />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby for description', () => {
      render(<TestForm showDescription />);
      const input = screen.getByTestId('username-input');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  // ==========================================================================
  // FormDescription
  // ==========================================================================

  describe('FormDescription', () => {
    it('should render description text', () => {
      render(<TestForm showDescription />);
      expect(screen.getByTestId('username-description')).toHaveTextContent(
        'Your public display name'
      );
    });

    it('should have muted text styling', () => {
      render(<TestForm showDescription />);
      const description = screen.getByTestId('username-description');
      expect(description).toHaveClass('text-xs');
      expect(description).toHaveClass('text-gray-500');
    });

    it('should have unique id for aria-describedby', () => {
      render(<TestForm showDescription />);
      const description = screen.getByTestId('username-description');
      expect(description).toHaveAttribute('id');
    });
  });

  // ==========================================================================
  // FormMessage
  // ==========================================================================

  describe('FormMessage', () => {
    it('should not render when no error', () => {
      render(<TestForm defaultValues={{ username: 'test', email: 'test@test.com' }} />);
      // Message should not be in the document when there's no error
      expect(screen.queryByTestId('username-message')).not.toBeInTheDocument();
    });

    it('should render error message on validation failure', async () => {
      render(<TestForm />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('username-message')).toHaveTextContent(
          'Username is required'
        );
      });
    });

    it('should have error styling', async () => {
      render(<TestForm />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        const message = screen.getByTestId('username-message');
        expect(message).toHaveClass('text-destructive');
        expect(message).toHaveClass('text-xs');
        expect(message).toHaveClass('font-medium');
      });
    });

    it('should show email validation error', async () => {
      render(<TestForm defaultValues={{ username: 'validuser', email: '' }} />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-message')).toHaveTextContent('Email is required');
      });
    });

    it('should show minLength validation error', async () => {
      render(<TestForm defaultValues={{ username: 'a', email: 'test@test.com' }} />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('username-message')).toHaveTextContent(
          'Username must be at least 2 characters'
        );
      });
    });
  });

  // ==========================================================================
  // Form Submission
  // ==========================================================================

  describe('Form Submission', () => {
    it('should call onSubmit with valid data', async () => {
      const handleSubmit = jest.fn();
      render(
        <TestForm
          onSubmit={handleSubmit}
          defaultValues={{ username: 'testuser', email: 'test@example.com' }}
        />
      );
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          { username: 'testuser', email: 'test@example.com' },
          expect.anything()
        );
      });
    });

    it('should not call onSubmit with invalid data', async () => {
      const handleSubmit = jest.fn();
      render(<TestForm onSubmit={handleSubmit} />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });

    it('should submit after fixing validation errors', async () => {
      const handleSubmit = jest.fn();
      render(<TestForm onSubmit={handleSubmit} />);
      
      // First submit - should fail
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('username-message')).toHaveTextContent(
          'Username is required'
        );
      });
      
      // Fix the errors
      await userEvent.type(screen.getByTestId('username-input'), 'validuser');
      await userEvent.type(screen.getByTestId('email-input'), 'valid@email.com');
      
      // Submit again
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // Input Interaction
  // ==========================================================================

  describe('Input Interaction', () => {
    it('should update field value on input', async () => {
      render(<TestForm />);
      
      const input = screen.getByTestId('username-input');
      await userEvent.type(input, 'newuser');
      
      expect(input).toHaveValue('newuser');
    });

    it('should clear validation error when input becomes valid', async () => {
      render(<TestForm />);
      
      // Trigger validation error
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('username-message')).toHaveTextContent(
          'Username is required'
        );
      });
      
      // Type valid input
      await userEvent.type(screen.getByTestId('username-input'), 'validuser');
      
      // Error should clear (on blur or change depending on mode)
      await waitFor(() => {
        expect(screen.queryByTestId('username-message')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have proper label-input association', () => {
      render(<TestForm />);
      
      const usernameLabel = screen.getByTestId('username-label');
      const usernameInput = screen.getByTestId('username-input');
      
      expect(usernameLabel.getAttribute('for')).toBe(usernameInput.getAttribute('id'));
    });

    it('should have aria-invalid on invalid fields', async () => {
      render(<TestForm />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByTestId('email-input')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby linking to error message', async () => {
      render(<TestForm />);
      
      await userEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        const input = screen.getByTestId('username-input');
        const message = screen.getByTestId('username-message');
        
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toContain(message.getAttribute('id'));
      });
    });

    it('should be keyboard navigable', async () => {
      render(<TestForm />);
      
      // Tab to first input
      await userEvent.tab();
      expect(screen.getByTestId('username-input')).toHaveFocus();
      
      // Tab to second input
      await userEvent.tab();
      expect(screen.getByTestId('email-input')).toHaveFocus();
      
      // Tab to submit button
      await userEvent.tab();
      expect(screen.getByTestId('submit-button')).toHaveFocus();
    });
  });

  // ==========================================================================
  // Custom Styling
  // ==========================================================================

  describe('Custom Styling', () => {
    it('should accept custom className on FormItem', () => {
      const CustomForm = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={({ field }) => (
                <FormItem className="custom-item" data-testid="custom-item">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
        );
      };
      
      render(<CustomForm />);
      expect(screen.getByTestId('custom-item')).toHaveClass('custom-item');
    });

    it('should accept custom className on FormLabel', () => {
      const CustomForm = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="custom-label" data-testid="custom-label">
                    Label
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
        );
      };
      
      render(<CustomForm />);
      expect(screen.getByTestId('custom-label')).toHaveClass('custom-label');
    });

    it('should accept custom className on FormDescription', () => {
      const CustomForm = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription className="custom-desc" data-testid="custom-desc">
                    Description
                  </FormDescription>
                </FormItem>
              )}
            />
          </Form>
        );
      };
      
      render(<CustomForm />);
      expect(screen.getByTestId('custom-desc')).toHaveClass('custom-desc');
    });

    it('should accept custom className on FormMessage', () => {
      const CustomForm = () => {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <FormField
              control={form.control}
              name="test"
              render={() => (
                <FormItem>
                  <FormMessage className="custom-message" data-testid="custom-message">
                    Custom error
                  </FormMessage>
                </FormItem>
              )}
            />
          </Form>
        );
      };
      
      render(<CustomForm />);
      expect(screen.getByTestId('custom-message')).toHaveClass('custom-message');
    });
  });
});
