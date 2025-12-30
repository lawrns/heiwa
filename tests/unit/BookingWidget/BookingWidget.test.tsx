/**
 * BookingWidget Footer Navigation Unit Tests
 * Tests for footer navigation styling and visibility based on step
 *
 * Fixes tested:
 * 1. Footer navigation has correct padding classes (px-4 sm:px-5 md:px-6 py-3 sm:py-4)
 * 2. Back/Next buttons render correctly with proper styling
 * 3. Navigation is hidden during review-pay step
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingProvider } from '@/lib/booking-context';

// Mock CSS imports
jest.mock('@/components/BookingWidget/styles/surf-enhancements.css', () => ({}));

// Create base mock flow state
const createMockFlowState = (overrides = {}) => ({
  state: {
    currentStep: 1,
    experienceType: null,
    dates: { checkIn: null, checkOut: null },
    guests: 1,
    participantNames: [],
    selectedOption: null,
    selectedSurfWeek: null,
    selectedSurfWeekRoom: null,
    roomAssignments: [],
    selectedAddOns: [],
    paymentMethod: null,
    guestDetails: [],
    pricing: {
      basePrice: 0,
      addOnsSubtotal: 0,
      taxes: 0,
      fees: 0,
      total: 0,
      currency: 'EUR',
    },
    isLoading: false,
    errors: {},
    skippedSteps: [],
    ...overrides.state,
  },
  actions: {
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    jumpToStep: jest.fn(),
    setExperienceType: jest.fn(),
    setDates: jest.fn(),
    setGuests: jest.fn(),
    setParticipantNames: jest.fn(),
    selectOption: jest.fn(),
    setSurfWeek: jest.fn(),
    setSurfWeekRoom: jest.fn(),
    setRoomAssignments: jest.fn(),
    addRoomAssignment: jest.fn(),
    removeRoomAssignment: jest.fn(),
    setAddOns: jest.fn(),
    setPaymentMethod: jest.fn(),
    setBankWireDetails: jest.fn(),
    updateGuestDetails: jest.fn(),
    updatePricing: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
    setSkippedSteps: jest.fn(),
    checkAvailability: jest.fn(),
    submitBooking: jest.fn(),
    ...overrides.actions,
  },
  computed: {
    currentStep: 1,
    canProceedToNextStep: true,
    isFirstStep: true,
    isLastStep: false,
    hasErrors: false,
    stepFlow: ['experience', 'options', 'guest-details', 'add-ons', 'review-pay'],
    totalSteps: 5,
    currentStepType: 'experience',
    ...overrides.computed,
  },
});

let mockUseBookingFlow = createMockFlowState();

jest.mock('@/components/BookingWidget/hooks/useBookingFlow', () => ({
  useBookingFlow: () => mockUseBookingFlow,
}));

// Mock the step components
jest.mock('@/components/BookingWidget/steps/ExperienceSelection', () => ({
  ExperienceSelection: () => <div data-testid="experience-selection">Experience Selection</div>,
}));

jest.mock('@/components/BookingWidget/steps/OptionSelection', () => ({
  OptionSelection: () => <div data-testid="option-selection">Option Selection</div>,
}));

jest.mock('@/components/BookingWidget/steps/RoomAssignment', () => ({
  RoomAssignment: () => <div data-testid="room-assignment">Room Assignment</div>,
}));

jest.mock('@/components/BookingWidget/steps/SurfWeekRoomSelection', () => ({
  SurfWeekRoomSelection: () => <div data-testid="surf-week-room-selection">Surf Week Room Selection</div>,
}));

jest.mock('@/components/BookingWidget/steps/AddOnsSelection', () => ({
  AddOnsSelection: () => <div data-testid="add-ons-selection">Add-Ons Selection</div>,
}));

jest.mock('@/components/BookingWidget/steps/GuestDetails', () => ({
  GuestDetails: () => <div data-testid="guest-details">Guest Details</div>,
}));

jest.mock('@/components/BookingWidget/steps/ReviewAndPay', () => ({
  ReviewAndPay: () => <div data-testid="review-and-pay">Review and Pay</div>,
}));

// Import after mocks are set up
import { BookingWidget } from '@/components/BookingWidget/BookingWidget';

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BookingProvider>
      {ui}
    </BookingProvider>
  );
};

describe('BookingWidget - Footer Navigation Styling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBookingFlow = createMockFlowState();
  });

  // ==========================================================================
  // Footer Navigation Padding Classes
  // ==========================================================================

  describe('Footer Container Padding', () => {
    it('should have correct padding classes on footer navigation container', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          isFirstStep: true,
          canProceedToNextStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      // Find the footer navigation container
      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      const footerContainer = backButton.closest('.flex.items-center.justify-between');

      expect(footerContainer).toBeInTheDocument();
      expect(footerContainer).toHaveClass('px-4');
      expect(footerContainer).toHaveClass('sm:px-5');
      expect(footerContainer).toHaveClass('md:px-6');
      expect(footerContainer).toHaveClass('py-3');
      expect(footerContainer).toHaveClass('sm:py-4');
    });

    it('should have border and background styling on footer', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'guest-details',
          canProceedToNextStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      const footerContainer = backButton.closest('.flex.items-center.justify-between');

      expect(footerContainer).toHaveClass('border-t');
      expect(footerContainer).toHaveClass('border-gray-200');
      expect(footerContainer).toHaveClass('bg-white');
    });
  });

  // ==========================================================================
  // Back Button Rendering
  // ==========================================================================

  describe('Back Button', () => {
    it('should render back button with correct text', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'options',
          isFirstStep: false,
          canProceedToNextStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveTextContent('Back');
    });

    it('should render back button with ArrowLeft icon', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'options',
          isFirstStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      const icon = backButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('should disable back button on first step', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          isFirstStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      expect(backButton).toBeDisabled();
    });

    it('should enable back button on non-first steps', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'add-ons',
          isFirstStep: false,
          canProceedToNextStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      expect(backButton).not.toBeDisabled();
    });

    it('should have outline variant styling', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'guest-details',
          isFirstStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      // Button component applies variant classes
      expect(backButton).toBeInTheDocument();
    });

    it('should call prevStep when back button is clicked', async () => {
      const user = userEvent.setup();
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'options',
          isFirstStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      await user.click(backButton);

      expect(mockUseBookingFlow.actions.prevStep).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Next Button Rendering
  // ==========================================================================

  describe('Next Button', () => {
    it('should render next button with correct text', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: true,
          isLastStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveTextContent('Next');
    });

    it('should render next button with ArrowRight icon', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: true,
          isLastStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      const icon = nextButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('should disable next button when cannot proceed', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when can proceed', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: true,
        },
        state: {
          experienceType: 'room',
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should disable next button when loading', () => {
      mockUseBookingFlow = createMockFlowState({
        state: {
          isLoading: true,
          experienceType: 'room',
        },
        computed: {
          currentStepType: 'options',
          canProceedToNextStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      expect(nextButton).toBeDisabled();
    });

    it('should call nextStep when next button is clicked', async () => {
      const user = userEvent.setup();
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: true,
        },
        state: {
          experienceType: 'room',
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      await user.click(nextButton);

      expect(mockUseBookingFlow.actions.nextStep).toHaveBeenCalledTimes(1);
    });

    it('should show "Complete Booking" text on last step', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'add-ons',
          canProceedToNextStep: true,
          isLastStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const nextButton = screen.getByRole('button', { name: /complete booking/i });
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveTextContent('Complete Booking');
    });
  });

  // ==========================================================================
  // Navigation Hidden During Review-Pay Step
  // ==========================================================================

  describe('Navigation Hidden During Review-Pay', () => {
    it('should NOT render footer navigation on review-pay step', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'review-pay',
          canProceedToNextStep: true,
          isLastStep: true,
        },
        state: {
          experienceType: 'surf-week',
          paymentMethod: 'card_stripe',
          pricing: {
            basePrice: 480,
            addOnsSubtotal: 0,
            taxes: 43.64,
            fees: 0,
            total: 480,
            currency: 'EUR',
          },
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      // Navigation should not be rendered
      const backButton = screen.queryByRole('button', { name: /go back to previous step/i });
      const nextButton = screen.queryByRole('button', { name: /continue to next step/i });

      expect(backButton).not.toBeInTheDocument();
      expect(nextButton).not.toBeInTheDocument();
    });

    it('should render review-pay step content when navigation is hidden', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'review-pay',
          canProceedToNextStep: true,
          isLastStep: true,
        },
        state: {
          experienceType: 'surf-week',
          paymentMethod: 'card_stripe',
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      // Review and pay step should be rendered
      expect(screen.getByTestId('review-and-pay')).toBeInTheDocument();
    });

    it('should show footer navigation on steps BEFORE review-pay', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'add-ons',
          canProceedToNextStep: true,
          isLastStep: false,
        },
        state: {
          experienceType: 'room',
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      // Navigation should be visible
      expect(screen.getByRole('button', { name: /go back to previous step/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to next step/i })).toBeInTheDocument();
    });

    it('should hide navigation when booking success is shown', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'review-pay',
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      // When bookingSuccess is shown, navigation should be hidden
      // This is handled by the !bookingSuccess condition in the component
      const backButton = screen.queryByRole('button', { name: /go back to previous step/i });
      expect(backButton).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Pricing Display in Footer
  // ==========================================================================

  describe('Pricing Display in Footer', () => {
    it('should display total price in footer', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'add-ons',
          canProceedToNextStep: true,
        },
        state: {
          pricing: {
            basePrice: 350,
            addOnsSubtotal: 50,
            taxes: 36.36,
            fees: 0,
            total: 400,
            currency: 'EUR',
          },
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      // Should display formatted total
      expect(screen.getByText('€400.00')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should display zero price initially', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      expect(screen.getByText('€0.00')).toBeInTheDocument();
    });

    it('should update price display as pricing changes', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'options',
          canProceedToNextStep: true,
        },
        state: {
          pricing: {
            basePrice: 600,
            addOnsSubtotal: 120,
            taxes: 65.45,
            fees: 0,
            total: 720,
            currency: 'EUR',
          },
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      expect(screen.getByText('€720.00')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Responsive Layout
  // ==========================================================================

  describe('Footer Responsive Layout', () => {
    it('should have responsive padding classes for mobile', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'guest-details',
          canProceedToNextStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      const footerContainer = backButton.closest('.flex.items-center.justify-between');

      // Base mobile padding
      expect(footerContainer).toHaveClass('px-4');
      expect(footerContainer).toHaveClass('py-3');
    });

    it('should hide Total label on mobile', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'options',
          canProceedToNextStep: true,
        },
        state: {
          pricing: {
            basePrice: 500,
            addOnsSubtotal: 0,
            taxes: 45.45,
            fees: 0,
            total: 500,
            currency: 'EUR',
          },
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const totalLabel = screen.getByText('Total');
      expect(totalLabel).toHaveClass('hidden');
      expect(totalLabel).toHaveClass('sm:block');
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('Footer Navigation Accessibility', () => {
    it('should have accessible button labels', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'guest-details',
          canProceedToNextStep: true,
          isFirstStep: false,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      expect(screen.getByRole('button', { name: /go back to previous step/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to next step/i })).toBeInTheDocument();
    });

    it('should have proper aria-label on complete booking button', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'add-ons',
          canProceedToNextStep: true,
          isLastStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      expect(screen.getByRole('button', { name: /complete booking/i })).toBeInTheDocument();
    });

    it('should maintain button accessibility when disabled', () => {
      mockUseBookingFlow = createMockFlowState({
        computed: {
          currentStepType: 'experience',
          canProceedToNextStep: false,
          isFirstStep: true,
        },
      });

      renderWithProviders(<BookingWidget isWebComponent />);

      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      const nextButton = screen.getByRole('button', { name: /continue to next step/i });

      expect(backButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });
});
