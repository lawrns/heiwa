/**
 * ReviewAndPay Step Component Tests
 * Feature: comprehensive-testing
 * 
 * Tests for the ReviewAndPay step in the BookingWidget
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewAndPay } from '@/components/BookingWidget/steps/ReviewAndPay';
import { BookingState, PricingBreakdown, GuestInfo } from '@/components/BookingWidget/types';

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock PaymentMethodSelector
jest.mock('@/components/BookingWidget/components/PaymentMethodSelector', () => ({
  PaymentMethodSelector: ({ selectedMethod, onMethodChange }: any) => (
    <div data-testid="payment-method-selector">
      <button 
        data-testid="select-card" 
        onClick={() => onMethodChange('card_stripe')}
        className={selectedMethod === 'card_stripe' ? 'selected' : ''}
      >
        Card
      </button>
      <button 
        data-testid="select-bank" 
        onClick={() => onMethodChange('bank_wire')}
        className={selectedMethod === 'bank_wire' ? 'selected' : ''}
      >
        Bank Wire
      </button>
    </div>
  ),
}));

// Mock BankWireInstructions
jest.mock('@/components/BookingWidget/components/BankWireInstructions', () => ({
  BankWireInstructions: ({ totalAmount, currency, bookingReference }: any) => (
    <div data-testid="bank-wire-instructions">
      <span data-testid="bank-amount">{totalAmount}</span>
      <span data-testid="bank-currency">{currency}</span>
      <span data-testid="bank-reference">{bookingReference}</span>
    </div>
  ),
}));

// Mock ScrollIndicator
jest.mock('@/components/BookingWidget/components/ScrollIndicator', () => ({
  ScrollIndicator: () => <div data-testid="scroll-indicator" />,
}));

// Mock useRooms hook
jest.mock('@/components/BookingWidget/hooks/useRooms', () => ({
  useRooms: () => ({
    rooms: [
      { id: 'room-1', name: 'Ocean View Suite', price: 150 },
      { id: 'room-2', name: 'Garden Room', price: 100 },
    ],
    loading: false,
    error: null,
  }),
}));

// Mock useSurfCamps hook
jest.mock('@/components/BookingWidget/hooks/useSurfCamps', () => ({
  useSurfCamps: () => ({
    surfCamps: [
      { id: 'camp-1', name: 'Beginner Surf Week' },
      { id: 'camp-2', name: 'Advanced Surf Week' },
    ],
    loading: false,
    error: null,
  }),
}));

// Mock apiFetch
jest.mock('@/components/BookingWidget/lib/api', () => ({
  apiFetch: jest.fn(),
}));

// Mock booking-utils
jest.mock('@/lib/booking-utils', () => ({
  validateBookingSubmission: jest.fn(() => ({ isValid: true, errors: [], missingFields: [] })),
  getValidationErrorMessage: jest.fn(() => 'Validation error'),
}));

// Mock error-handler
jest.mock('@/lib/error-handler', () => ({
  retryRequest: jest.fn((fn) => fn()),
}));

// Mock booking-persistence
jest.mock('@/lib/utils/booking-persistence', () => ({
  clearBookingProgress: jest.fn(),
}));

// Mock scroll-to-error
jest.mock('@/lib/utils/scroll-to-error', () => ({
  scrollToFirstError: jest.fn(),
}));

describe('ReviewAndPay Step Component', () => {
  const createMockGuestDetails = (): GuestInfo[] => [
    {
      id: 'guest-0',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      dietaryRequirements: 'Vegetarian',
      specialRequests: '',
    },
  ];

  const createMockPricing = (): PricingBreakdown => ({
    basePrice: 400,
    taxes: 36,
    fees: 0,
    total: 400,
    currency: 'EUR',
    addOnsSubtotal: 0,
  });

  const createMockState = (overrides: Partial<BookingState> = {}): BookingState => ({
    experienceType: 'room',
    currentStep: 5,
    dates: {
      checkIn: new Date('2025-02-01'),
      checkOut: new Date('2025-02-05'),
    },
    selectedOption: 'room-1',
    selectedSurfWeek: null,
    selectedSurfWeekRoom: null,
    guests: 1,
    guestDetails: createMockGuestDetails(),
    participantNames: [{ id: 'guest-1', firstName: 'John' }],
    roomAssignments: [],
    selectedAddOns: [],
    pricing: createMockPricing(),
    paymentMethod: null,
    isLoading: false,
    errors: {},
    ...overrides,
  });

  const createMockActions = () => ({
    updatePricing: jest.fn(),
    setPaymentMethod: jest.fn(),
    prevStep: jest.fn(),
  });

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the review and pay header', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByTestId('review-pay-title')).toHaveTextContent('Review & Pay');
    });

    it('should render booking summary section', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByTestId('booking-summary-title')).toHaveTextContent('Booking Summary');
    });

    it('should display experience type for room booking', () => {
      const state = createMockState({ experienceType: 'room' });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Room Booking')).toBeInTheDocument();
    });

    it('should display experience type for surf week', () => {
      const state = createMockState({ 
        experienceType: 'surf-week',
        selectedSurfWeek: 'camp-1',
        selectedOption: 'camp-1',
      });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Surf Week Package')).toBeInTheDocument();
    });

    it('should display dates correctly', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Dates')).toBeInTheDocument();
    });

    it('should display guest count', () => {
      const state = createMockState({ guests: 2 });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Guests')).toBeInTheDocument();
      expect(screen.getByText('2 guests')).toBeInTheDocument();
    });

    it('should display location', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Location')).toBeInTheDocument();
    });
  });

  describe('Guest Details Summary', () => {
    it('should display guest information', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Guest Information')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show dietary requirements when present', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText(/Dietary: Vegetarian/)).toBeInTheDocument();
    });

    it('should show completion status for guests', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  describe('Pricing Breakdown', () => {
    it('should display pricing breakdown title', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByTestId('pricing-breakdown-title')).toHaveTextContent('Pricing Breakdown');
    });

    it('should display base price', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Base Price')).toBeInTheDocument();
    });

    it('should display total price', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Add-ons Summary', () => {
    it('should display add-ons when present', () => {
      const state = createMockState({
        selectedAddOns: [
          { id: 'addon-1', name: 'Airport Transfer', price: 50, quantity: 1 },
        ],
      });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Selected Add-ons')).toBeInTheDocument();
      expect(screen.getByText('Airport Transfer')).toBeInTheDocument();
    });

    it('should not display add-ons section when empty', () => {
      const state = createMockState({ selectedAddOns: [] });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.queryByText('Selected Add-ons')).not.toBeInTheDocument();
    });
  });

  describe('Room Assignments', () => {
    it('should display room assignments when present', () => {
      const state = createMockState({
        roomAssignments: [
          { id: 'assignment-1', roomId: 'room-1', guestIds: ['guest-1'] },
        ],
      });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('Room Assignments')).toBeInTheDocument();
    });

    it('should not display room assignments when empty', () => {
      const state = createMockState({ roomAssignments: [] });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.queryByText('Room Assignments')).not.toBeInTheDocument();
    });
  });

  describe('Payment Method Selection', () => {
    it('should render payment method selector', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
    });

    it('should call setPaymentMethod when card is selected', async () => {
      const user = userEvent.setup();
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      await user.click(screen.getByTestId('select-card'));

      expect(actions.setPaymentMethod).toHaveBeenCalledWith('card_stripe');
    });

    it('should call setPaymentMethod when bank wire is selected', async () => {
      const user = userEvent.setup();
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      await user.click(screen.getByTestId('select-bank'));

      expect(actions.setPaymentMethod).toHaveBeenCalledWith('bank_wire');
    });
  });

  describe('Terms and Conditions', () => {
    it('should render terms checkbox', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByLabelText(/I agree to the/)).toBeInTheDocument();
    });

    it('should toggle terms acceptance', async () => {
      const user = userEvent.setup();
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Bank Wire Instructions', () => {
    it('should show bank wire instructions when bank_wire is selected', () => {
      const state = createMockState({ paymentMethod: 'bank_wire' });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByTestId('bank-wire-instructions')).toBeInTheDocument();
    });

    it('should not show bank wire instructions when card is selected', () => {
      const state = createMockState({ paymentMethod: 'card_stripe' });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.queryByTestId('bank-wire-instructions')).not.toBeInTheDocument();
    });
  });

  describe('Payment Button', () => {
    it('should show payment button when payment method is selected', () => {
      const state = createMockState({ paymentMethod: 'card_stripe' });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByRole('button', { name: /Pay.*Now/ })).toBeInTheDocument();
    });

    it('should show complete booking button for bank wire', () => {
      const state = createMockState({ paymentMethod: 'bank_wire' });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByRole('button', { name: /Complete Booking/ })).toBeInTheDocument();
    });

    it('should disable payment button when terms not accepted', () => {
      const state = createMockState({ paymentMethod: 'card_stripe' });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      const payButton = screen.getByRole('button', { name: /Pay.*Now/ });
      expect(payButton).toBeDisabled();
    });

    it('should not show payment button when no payment method selected', () => {
      const state = createMockState({ paymentMethod: null });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.queryByRole('button', { name: /Pay.*Now/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Complete Booking/ })).not.toBeInTheDocument();
    });
  });

  describe('Multiple Guests', () => {
    it('should display all guests in summary', () => {
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
          {
            id: 'guest-1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
          },
        ],
      });
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible terms checkbox', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'terms');
    });

    it('should have proper heading hierarchy', () => {
      const state = createMockState();
      const actions = createMockActions();

      render(<ReviewAndPay state={state} actions={actions} onComplete={mockOnComplete} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
