/**
 * PaymentMethodSelector Component Tests
 * Feature: comprehensive-testing
 * 
 * Tests for the PaymentMethodSelector component in the BookingWidget
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentMethodSelector } from '@/components/BookingWidget/components/PaymentMethodSelector';

describe('PaymentMethodSelector Component', () => {
  const mockOnMethodChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the payment method header', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('should render credit card option', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      expect(screen.getByText('Credit/Debit Card')).toBeInTheDocument();
      expect(screen.getByText('Pay securely with Stripe')).toBeInTheDocument();
    });

    it('should render bank wire option', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      expect(screen.getByText('Bank Wire Transfer')).toBeInTheDocument();
      expect(screen.getByText('Direct bank transfer')).toBeInTheDocument();
    });

    it('should render instant badge for card payment', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      expect(screen.getByText('Instant')).toBeInTheDocument();
    });

    it('should render manual badge for bank wire', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      expect(screen.getByText('Manual')).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('should highlight card option when selected', () => {
      render(
        <PaymentMethodSelector
          selectedMethod="card_stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const cardButton = buttons.find(btn => btn.textContent?.includes('Credit/Debit Card'));
      
      // Component uses border-accent for selected state
      expect(cardButton).toHaveClass('border-accent');
      expect(cardButton).toHaveClass('bg-orange-50');
    });

    it('should highlight bank wire option when selected', () => {
      render(
        <PaymentMethodSelector
          selectedMethod="bank_wire"
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const bankButton = buttons.find(btn => btn.textContent?.includes('Bank Wire Transfer'));
      
      // Component uses border-accent for selected state
      expect(bankButton).toHaveClass('border-accent');
      expect(bankButton).toHaveClass('bg-orange-50');
    });

    it('should not highlight any option when none selected', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveClass('border-orange-500');
      });
    });
  });

  describe('Selection Handling', () => {
    it('should call onMethodChange with card_stripe when card is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const cardButton = buttons.find(btn => btn.textContent?.includes('Credit/Debit Card'));
      
      await user.click(cardButton!);

      expect(mockOnMethodChange).toHaveBeenCalledWith('card_stripe');
    });

    it('should call onMethodChange with bank_wire when bank is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const bankButton = buttons.find(btn => btn.textContent?.includes('Bank Wire Transfer'));
      
      await user.click(bankButton!);

      expect(mockOnMethodChange).toHaveBeenCalledWith('bank_wire');
    });

    it('should allow switching from card to bank', async () => {
      const user = userEvent.setup();
      
      render(
        <PaymentMethodSelector
          selectedMethod="card_stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const bankButton = buttons.find(btn => btn.textContent?.includes('Bank Wire Transfer'));
      
      await user.click(bankButton!);

      expect(mockOnMethodChange).toHaveBeenCalledWith('bank_wire');
    });

    it('should allow switching from bank to card', async () => {
      const user = userEvent.setup();
      
      render(
        <PaymentMethodSelector
          selectedMethod="bank_wire"
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const cardButton = buttons.find(btn => btn.textContent?.includes('Credit/Debit Card'));
      
      await user.click(cardButton!);

      expect(mockOnMethodChange).toHaveBeenCalledWith('card_stripe');
    });
  });

  describe('Visual Indicators', () => {
    it('should show pulse indicator for selected card option', () => {
      const { container } = render(
        <PaymentMethodSelector
          selectedMethod="card_stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      const pulseIndicator = container.querySelector('.animate-pulse');
      expect(pulseIndicator).toBeInTheDocument();
    });

    it('should show pulse indicator for selected bank option', () => {
      const { container } = render(
        <PaymentMethodSelector
          selectedMethod="bank_wire"
          onMethodChange={mockOnMethodChange}
        />
      );

      const pulseIndicator = container.querySelector('.animate-pulse');
      expect(pulseIndicator).toBeInTheDocument();
    });

    it('should not show pulse indicator when nothing selected', () => {
      const { container } = render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      const pulseIndicator = container.querySelector('.animate-pulse');
      expect(pulseIndicator).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      // Tab to first button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');

      expect(mockOnMethodChange).toHaveBeenCalled();
    });

    it('should have focus ring styles', () => {
      render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:ring-2');
      });
    });
  });

  describe('Icon Display', () => {
    it('should render icons for both payment methods', () => {
      const { container } = render(
        <PaymentMethodSelector
          selectedMethod={null}
          onMethodChange={mockOnMethodChange}
        />
      );

      // Check for SVG icons (lucide-react renders as SVG)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should style icon container differently when selected', () => {
      const { container } = render(
        <PaymentMethodSelector
          selectedMethod="card_stripe"
          onMethodChange={mockOnMethodChange}
        />
      );

      // Selected icon should have accent background
      const accentIcon = container.querySelector('.bg-accent');
      expect(accentIcon).toBeInTheDocument();
    });
  });
});
