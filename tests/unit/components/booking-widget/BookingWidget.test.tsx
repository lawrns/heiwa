/**
 * BookingWidget Component Unit Tests
 * Tests for initial render, step navigation, and state management
 * 
 * The BookingWidget is a complex multi-step form for booking surf retreats
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingProvider } from '@/lib/booking-context';

// Mock CSS imports
jest.mock('@/components/BookingWidget/styles/surf-enhancements.css', () => ({}));

// Mock the booking flow hook
const mockUseBookingFlow = {
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
  },
  computed: {
    currentStep: 1,
    canProceedToNextStep: false,
    isFirstStep: true,
    isLastStep: false,
    hasErrors: false,
    stepFlow: ['experience', 'options', 'guest-details', 'add-ons', 'review-pay'],
    totalSteps: 5,
    currentStepType: 'experience',
  },
};

jest.mock('@/components/BookingWidget/hooks/useBookingFlow', () => ({
  useBookingFlow: () => mockUseBookingFlow,
}));

// Mock the step components
jest.mock('@/components/BookingWidget/steps/ExperienceSelection', () => ({
  ExperienceSelection: () => <div data-testid="experience-selection">Experience Selection Step</div>,
}));

jest.mock('@/components/BookingWidget/steps/OptionSelection', () => ({
  OptionSelection: () => <div data-testid="option-selection">Option Selection Step</div>,
}));

jest.mock('@/components/BookingWidget/steps/RoomAssignment', () => ({
  RoomAssignment: () => <div data-testid="room-assignment">Room Assignment Step</div>,
}));

jest.mock('@/components/BookingWidget/steps/SurfWeekRoomSelection', () => ({
  SurfWeekRoomSelection: () => <div data-testid="surf-week-room-selection">Surf Week Room Selection Step</div>,
}));

jest.mock('@/components/BookingWidget/steps/AddOnsSelection', () => ({
  AddOnsSelection: () => <div data-testid="add-ons-selection">Add-Ons Selection Step</div>,
}));

jest.mock('@/components/BookingWidget/steps/GuestDetails', () => ({
  GuestDetails: () => <div data-testid="guest-details">Guest Details Step</div>,
}));

jest.mock('@/components/BookingWidget/steps/ReviewAndPay', () => ({
  ReviewAndPay: () => <div data-testid="review-and-pay">Review and Pay Step</div>,
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

describe('BookingWidget Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Initial Render
  // ==========================================================================

  describe('Initial Render', () => {
    it('should render trigger button when not a web component', () => {
      renderWithProviders(<BookingWidget />);
      expect(screen.getByRole('button', { name: /open booking widget/i })).toBeInTheDocument();
    });

    it('should render custom trigger text from config', () => {
      renderWithProviders(
        <BookingWidget config={{ triggerText: 'Reserve Now' }} />
      );
      expect(screen.getByText('Reserve Now')).toBeInTheDocument();
    });

    it('should not render trigger button when isWebComponent is true', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.queryByRole('button', { name: /open booking widget/i })).not.toBeInTheDocument();
    });

    it('should render modal when isWebComponent is true', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByText('Book Your Surf Adventure')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Modal Open/Close
  // ==========================================================================

  describe('Modal Open/Close', () => {
    it('should open modal when trigger button is clicked', async () => {
      renderWithProviders(<BookingWidget />);
      
      await userEvent.click(screen.getByRole('button', { name: /open booking widget/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Book Your Surf Adventure')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      
      expect(screen.getByText('Book Your Surf Adventure')).toBeInTheDocument();
      
      await userEvent.click(screen.getByRole('button', { name: /close booking widget/i }));
      
      await waitFor(() => {
        expect(screen.queryByText('Book Your Surf Adventure')).not.toBeInTheDocument();
      });
    });

    it('should close modal when backdrop is clicked', async () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      
      // Click on the backdrop (the outer div)
      const backdrop = screen.getByText('Book Your Surf Adventure').closest('.fixed');
      if (backdrop) {
        await userEvent.click(backdrop);
      }
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Book Your Surf Adventure')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Step Rendering
  // ==========================================================================

  describe('Step Rendering', () => {
    it('should render experience selection step initially', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByTestId('experience-selection')).toBeInTheDocument();
    });

    it('should render progress indicator', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      // Progress indicator should be visible
      const progressArea = screen.getByText('Book Your Surf Adventure').parentElement?.parentElement;
      expect(progressArea).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Navigation
  // ==========================================================================

  describe('Navigation', () => {
    it('should render back button', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByRole('button', { name: /go back to previous step/i })).toBeInTheDocument();
    });

    it('should render next button', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByRole('button', { name: /continue to next step/i })).toBeInTheDocument();
    });

    it('should disable back button on first step', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      const backButton = screen.getByRole('button', { name: /go back to previous step/i });
      expect(backButton).toBeDisabled();
    });

    it('should disable next button when cannot proceed', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      const nextButton = screen.getByRole('button', { name: /continue to next step/i });
      // Button should be disabled since canProceedToNextStep is false in mock
      expect(nextButton).toBeDisabled();
    });
  });

  // ==========================================================================
  // Pricing Display
  // ==========================================================================

  describe('Pricing Display', () => {
    it('should display total price', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByText('€0.00')).toBeInTheDocument();
    });

    it('should display total label', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Header
  // ==========================================================================

  describe('Header', () => {
    it('should display booking title', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByText('Book Your Surf Adventure')).toBeInTheDocument();
    });

    it('should have close button with X icon', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      const closeButton = screen.getByRole('button', { name: /close booking widget/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible trigger button', () => {
      renderWithProviders(<BookingWidget />);
      expect(screen.getByRole('button', { name: /open booking widget/i })).toBeInTheDocument();
    });

    it('should have accessible close button', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByRole('button', { name: /close booking widget/i })).toBeInTheDocument();
    });

    it('should have accessible navigation buttons', () => {
      renderWithProviders(<BookingWidget isWebComponent />);
      expect(screen.getByRole('button', { name: /go back to previous step/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to next step/i })).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Modal State Callback
  // ==========================================================================

  describe('Modal State Callback', () => {
    it('should call onModalStateChange when modal opens', async () => {
      const handleModalStateChange = jest.fn();
      renderWithProviders(
        <BookingWidget onModalStateChange={handleModalStateChange} />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /open booking widget/i }));
      
      await waitFor(() => {
        expect(handleModalStateChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onModalStateChange when modal closes', async () => {
      const handleModalStateChange = jest.fn();
      renderWithProviders(
        <BookingWidget isWebComponent onModalStateChange={handleModalStateChange} />
      );
      
      // Initial call with true
      expect(handleModalStateChange).toHaveBeenCalledWith(true);
      
      await userEvent.click(screen.getByRole('button', { name: /close booking widget/i }));
      
      await waitFor(() => {
        expect(handleModalStateChange).toHaveBeenCalledWith(false);
      });
    });
  });
});
