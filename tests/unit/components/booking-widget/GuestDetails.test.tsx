/**
 * GuestDetails Step Component Tests
 * Feature: comprehensive-testing
 * 
 * Tests for the GuestDetails step in the BookingWidget
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestDetails } from '@/components/BookingWidget/steps/GuestDetails';
import { BookingState, GuestInfo } from '@/components/BookingWidget/types';

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe('GuestDetails Step Component', () => {
  const createMockState = (overrides: Partial<BookingState> = {}): BookingState => ({
    experienceType: 'room',
    step: 3,
    dates: {
      checkIn: new Date('2025-02-01'),
      checkOut: new Date('2025-02-05'),
    },
    selectedOption: 'room-1',
    selectedSurfWeek: null,
    guests: 2,
    guestDetails: [],
    participantNames: [],
    roomAssignments: [],
    addOns: [],
    pricing: {
      basePrice: 400,
      addOnsSubtotal: 0,
      taxes: 40,
      fees: 0,
      total: 440,
      currency: 'EUR',
    },
    paymentMethod: null,
    errors: {},
    ...overrides,
  });

  const createMockActions = () => ({
    updateGuestDetails: jest.fn(),
    setParticipantNames: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the guest details header', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByText('Guest Details')).toBeInTheDocument();
    });

    it('should display correct guest count instruction', () => {
      const state = createMockState({ guests: 3 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByTestId('guest-count-instruction')).toHaveTextContent(
        'Please provide details for all 3 guests'
      );
    });

    it('should render correct number of guest forms', () => {
      const state = createMockState({ guests: 2 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Check for guest form containers
      expect(document.getElementById('guest-form-0')).toBeInTheDocument();
      expect(document.getElementById('guest-form-1')).toBeInTheDocument();
    });

    it('should mark first guest as primary', () => {
      const state = createMockState({ guests: 2 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByText(/Guest 1.*Primary Guest/)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render all required fields for each guest', () => {
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
    });

    it('should render optional fields', () => {
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByLabelText(/Dietary Requirements/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Special Requests/)).toBeInTheDocument();
    });

    it('should pre-fill firstName from participantNames', () => {
      const state = createMockState({
        guests: 1,
        participantNames: [{ id: 'guest-1', firstName: 'John' }],
      });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      const firstNameInput = screen.getByLabelText(/First Name/) as HTMLInputElement;
      expect(firstNameInput.value).toBe('John');
    });
  });

  describe('Input Handling', () => {
    it('should update input values on change', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      const firstNameInput = screen.getByLabelText(/First Name/);
      await user.type(firstNameInput, 'Jane');

      expect(firstNameInput).toHaveValue('Jane');
    });

    it('should sync firstName changes to participantNames', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      const firstNameInput = screen.getByLabelText(/First Name/);
      await user.type(firstNameInput, 'Jane');

      expect(actions.setParticipantNames).toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should show error when saving with empty required fields', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      const saveButton = screen.getByRole('button', { name: /Save Guest 1/ });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('guest-0-error')).toBeInTheDocument();
      });
    });

    it('should show email validation error for invalid email', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      const emailInput = screen.getByLabelText(/Email Address/);
      await user.type(emailInput, 'invalid-email');

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should not show email error for valid email', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      const emailInput = screen.getByLabelText(/Email Address/);
      await user.type(emailInput, 'valid@example.com');

      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  describe('Save Guest', () => {
    it('should call updateGuestDetails when form is valid', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Fill in all required fields
      await user.type(screen.getByLabelText(/First Name/), 'John');
      await user.type(screen.getByLabelText(/Last Name/), 'Doe');
      await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
      await user.type(screen.getByLabelText(/Phone Number/), '+1234567890');

      const saveButton = screen.getByRole('button', { name: /Save Guest 1/ });
      await user.click(saveButton);

      await waitFor(() => {
        expect(actions.updateGuestDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          })
        );
      });
    });

    it('should show success message after saving', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Fill in all required fields
      await user.type(screen.getByLabelText(/First Name/), 'John');
      await user.type(screen.getByLabelText(/Last Name/), 'Doe');
      await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
      await user.type(screen.getByLabelText(/Phone Number/), '+1234567890');

      const saveButton = screen.getByRole('button', { name: /Save Guest 1/ });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('guest-0-success')).toBeInTheDocument();
      });
    });
  });

  describe('Completion Status', () => {
    it('should show completion status', () => {
      const state = createMockState({ guests: 2 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByTestId('guest-completion-status')).toHaveTextContent(
        '0 of 2 guests completed'
      );
    });

    it('should update completion status when guests are saved', () => {
      const state = createMockState({
        guests: 2,
        guestDetails: [
          {
            id: 'guest-0',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
        ],
      });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      expect(screen.getByTestId('guest-completion-status')).toHaveTextContent(
        '1 of 2 guests completed'
      );
    });
  });

  describe('Collapsed State', () => {
    it('should show collapsed summary when all guests are completed', async () => {
      const state = createMockState({
        guests: 1,
        guestDetails: [
          {
            id: 'guest-0',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
        ],
      });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Wait for auto-collapse
      await waitFor(
        () => {
          expect(screen.getByText(/1 Participant Added/)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should expand when edit button is clicked', async () => {
      const user = userEvent.setup();
      const state = createMockState({
        guests: 1,
        guestDetails: [
          {
            id: 'guest-0',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
        ],
      });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Wait for auto-collapse
      await waitFor(
        () => {
          expect(screen.getByText(/1 Participant Added/)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Click edit button
      const editButton = screen.getByRole('button', { name: /Edit/ });
      await user.click(editButton);

      // Should show form again
      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
    });
  });

  describe('Multiple Guests', () => {
    it('should handle multiple guest forms independently', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 2 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Get all first name inputs
      const firstNameInputs = screen.getAllByLabelText(/First Name/);
      expect(firstNameInputs).toHaveLength(2);

      // Type in first guest
      await user.type(firstNameInputs[0], 'John');
      expect(firstNameInputs[0]).toHaveValue('John');
      expect(firstNameInputs[1]).toHaveValue('');

      // Type in second guest
      await user.type(firstNameInputs[1], 'Jane');
      expect(firstNameInputs[0]).toHaveValue('John');
      expect(firstNameInputs[1]).toHaveValue('Jane');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-invalid attributes on error', async () => {
      const user = userEvent.setup();
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // Type invalid email
      const emailInput = screen.getByLabelText(/Email Address/);
      await user.type(emailInput, 'invalid');

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper labels for all inputs', () => {
      const state = createMockState({ guests: 1 });
      const actions = createMockActions();

      render(<GuestDetails state={state} actions={actions} />);

      // All inputs should be accessible by label
      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dietary Requirements/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Special Requests/)).toBeInTheDocument();
    });
  });
});
