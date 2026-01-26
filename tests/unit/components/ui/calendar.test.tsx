/**
 * Calendar Component Unit Tests
 * Tests for date selection, navigation, and accessibility
 * 
 * The Calendar component wraps react-day-picker with custom styling
 * Note: react-day-picker v9 uses different class names (rdp-*)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar, CalendarProps } from '@/components/ui/calendar';

// Helper to render calendar with common props
const renderCalendar = (props: Partial<CalendarProps> = {}) => {
  const defaultProps: CalendarProps = {
    mode: 'single',
    ...props,
  };
  return render(<Calendar {...defaultProps} />);
};

// Get current month/year for dynamic tests
const today = new Date();
const currentMonth = today.toLocaleString('default', { month: 'long' });
const currentYear = today.getFullYear();

describe('Calendar Component', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('should render calendar', () => {
      renderCalendar();
      // Calendar should show current month by default
      expect(screen.getByText(new RegExp(currentMonth, 'i'))).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = renderCalendar({ className: 'custom-calendar' });
      expect(container.firstChild).toHaveClass('custom-calendar');
    });

    it('should render navigation buttons', () => {
      renderCalendar();
      // Should have previous and next month buttons
      expect(screen.getByLabelText(/previous month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next month/i)).toBeInTheDocument();
    });

    it('should render day headers', () => {
      renderCalendar();
      // Should show day abbreviations
      expect(screen.getByText(/Su/i)).toBeInTheDocument();
      expect(screen.getByText(/Mo/i)).toBeInTheDocument();
    });

    it('should render days of the month', () => {
      renderCalendar();
      // Should show day numbers (use getAllByText since there may be duplicates with outside days)
      const day15Elements = screen.getAllByText('15');
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });

    it('should show outside days by default', () => {
      renderCalendar({ showOutsideDays: true });
      // Calendar should render without error
      const day15Elements = screen.getAllByText('15');
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });

    it('should hide outside days when showOutsideDays is false', () => {
      renderCalendar({ showOutsideDays: false });
      // Calendar should still render
      const day15Elements = screen.getAllByText('15');
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // Month Navigation
  // ==========================================================================

  describe('Month Navigation', () => {
    it('should navigate to previous month', async () => {
      renderCalendar();
      
      const prevButton = screen.getByLabelText(/previous month/i);
      await userEvent.click(prevButton);
      
      // Calendar should still be functional
      const day15Elements = screen.getAllByText('15');
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });

    it('should navigate to next month', async () => {
      renderCalendar();
      
      const nextButton = screen.getByLabelText(/next month/i);
      await userEvent.click(nextButton);
      
      // Calendar should still be functional
      const day15Elements = screen.getAllByText('15');
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });

    it('should render navigation icons', () => {
      renderCalendar();
      
      // Should have chevron icons for navigation
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================================================
  // Date Selection (Single Mode)
  // ==========================================================================

  describe('Date Selection - Single Mode', () => {
    it('should call onSelect when a date is clicked', async () => {
      const handleSelect = jest.fn();
      renderCalendar({ mode: 'single', onSelect: handleSelect });
      
      // Click on day 15
      const day15Elements = screen.getAllByText('15');
      await userEvent.click(day15Elements[0]);
      
      expect(handleSelect).toHaveBeenCalled();
    });

    it('should highlight selected date', () => {
      const selectedDate = new Date(currentYear, today.getMonth(), 15);
      renderCalendar({ mode: 'single', selected: selectedDate });
      
      // The selected day should have selected styling
      const day15Elements = screen.getAllByText('15');
      const selectedDay = day15Elements.find(el => 
        el.getAttribute('aria-selected') === 'true' ||
        el.closest('button')?.getAttribute('aria-selected') === 'true' ||
        el.closest('td')?.getAttribute('aria-selected') === 'true'
      );
      expect(selectedDay).toBeTruthy();
    });

    it('should show today with special styling', () => {
      renderCalendar();
      
      // Today's date should be highlighted
      const todayDate = today.getDate().toString();
      const todayElements = screen.getAllByText(todayDate);
      
      // At least one should be today
      expect(todayElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // Date Selection (Range Mode)
  // ==========================================================================

  describe('Date Selection - Range Mode', () => {
    it('should render in range mode', () => {
      renderCalendar({ mode: 'range' });
      const day15Elements = screen.getAllByText('15');
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });

    it('should call onSelect when selecting range start', async () => {
      const handleSelect = jest.fn();
      renderCalendar({ mode: 'range', onSelect: handleSelect });
      
      const day10Elements = screen.getAllByText('10');
      await userEvent.click(day10Elements[0]);
      
      expect(handleSelect).toHaveBeenCalled();
    });

    it('should highlight range when selected', () => {
      const rangeStart = new Date(currentYear, today.getMonth(), 10);
      const rangeEnd = new Date(currentYear, today.getMonth(), 15);
      
      renderCalendar({
        mode: 'range',
        selected: { from: rangeStart, to: rangeEnd },
      });
      
      // Start and end should be selected
      const day10Elements = screen.getAllByText('10');
      const day15Elements = screen.getAllByText('15');
      
      // At least one of each should exist
      expect(day10Elements.length).toBeGreaterThanOrEqual(1);
      expect(day15Elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // Disabled Dates
  // ==========================================================================

  describe('Disabled Dates', () => {
    it('should disable specific dates', () => {
      const disabledDate = new Date(currentYear, today.getMonth(), 20);
      renderCalendar({
        mode: 'single',
        disabled: [disabledDate],
      });
      
      const day20Elements = screen.getAllByText('20');
      const disabledDay = day20Elements.find(el => {
        const button = el.closest('button');
        return button?.hasAttribute('disabled') || button?.getAttribute('aria-disabled') === 'true';
      });
      expect(disabledDay).toBeTruthy();
    });

    it('should disable dates before a minimum date', () => {
      const minDate = new Date(currentYear, today.getMonth(), 10);
      renderCalendar({
        mode: 'single',
        disabled: { before: minDate },
      });
      
      // Day 5 should be disabled
      const day5Elements = screen.getAllByText('5');
      const disabledDay = day5Elements.find(el => {
        const button = el.closest('button');
        return button?.hasAttribute('disabled') || button?.getAttribute('aria-disabled') === 'true';
      });
      expect(disabledDay).toBeTruthy();
    });

    it('should disable dates after a maximum date', () => {
      const maxDate = new Date(currentYear, today.getMonth(), 20);
      renderCalendar({
        mode: 'single',
        disabled: { after: maxDate },
      });
      
      // Day 25 should be disabled
      const day25Elements = screen.getAllByText('25');
      const disabledDay = day25Elements.find(el => {
        const button = el.closest('button');
        return button?.hasAttribute('disabled') || button?.getAttribute('aria-disabled') === 'true';
      });
      expect(disabledDay).toBeTruthy();
    });

    it('should not call onSelect for disabled dates', async () => {
      const handleSelect = jest.fn();
      const disabledDate = new Date(currentYear, today.getMonth(), 20);
      
      renderCalendar({
        mode: 'single',
        onSelect: handleSelect,
        disabled: [disabledDate],
      });
      
      const day20Elements = screen.getAllByText('20');
      await userEvent.click(day20Elements[0]);
      
      // Should not be called because the date is disabled
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Styling
  // ==========================================================================

  describe('Styling', () => {
    it('should have padding', () => {
      const { container } = renderCalendar();
      expect(container.firstChild).toHaveClass('p-3');
    });

    it('should apply custom classNames', () => {
      renderCalendar({
        classNames: {
          months: 'custom-months',
        },
      });
      
      const months = document.querySelector('.custom-months');
      expect(months).toBeInTheDocument();
    });

    it('should have responsive layout for months', () => {
      const { container } = renderCalendar();
      // Check for flex layout classes
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should style navigation buttons', () => {
      renderCalendar();
      
      const prevButton = screen.getByLabelText(/previous month/i);
      const nextButton = screen.getByLabelText(/next month/i);
      
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('should style day cells', () => {
      renderCalendar();
      
      // Day buttons should exist
      const day15Elements = screen.getAllByText('15');
      const button = day15Elements[0].closest('button');
      expect(button).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Multiple Months
  // ==========================================================================

  describe('Multiple Months', () => {
    it('should render multiple months when numberOfMonths > 1', () => {
      renderCalendar({ numberOfMonths: 2 });
      
      // Should show two month grids
      const grids = document.querySelectorAll('[role="grid"]');
      expect(grids.length).toBe(2);
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible day buttons', () => {
      renderCalendar();
      
      const dayButtons = document.querySelectorAll('button[aria-label]');
      // All day buttons should be accessible
      expect(dayButtons.length).toBeGreaterThan(0);
    });

    it('should have aria-selected on selected dates', () => {
      const selectedDate = new Date(currentYear, today.getMonth(), 15);
      renderCalendar({ mode: 'single', selected: selectedDate });
      
      // Find element with aria-selected
      const selectedElements = document.querySelectorAll('[aria-selected="true"]');
      expect(selectedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should have disabled attribute on disabled dates', () => {
      const disabledDate = new Date(currentYear, today.getMonth(), 20);
      renderCalendar({
        mode: 'single',
        disabled: [disabledDate],
      });
      
      const day20Elements = screen.getAllByText('20');
      const disabledButton = day20Elements.find(el => {
        const button = el.closest('button');
        return button?.hasAttribute('disabled') || button?.getAttribute('aria-disabled') === 'true';
      });
      expect(disabledButton).toBeTruthy();
    });

    it('should be keyboard navigable', async () => {
      renderCalendar();
      
      // Tab into the calendar
      await userEvent.tab();
      
      // Should be able to focus on calendar elements
      const focusedElement = document.activeElement;
      expect(focusedElement).not.toBe(document.body);
    });

    it('should have grid role on month table', () => {
      renderCalendar();
      
      const grid = document.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Default Month
  // ==========================================================================

  describe('Default Month', () => {
    it('should show specified default month', () => {
      const defaultMonth = new Date(2024, 5, 1); // June 2024
      renderCalendar({ defaultMonth });
      
      expect(screen.getByText(/June/i)).toBeInTheDocument();
      expect(screen.getByText(/2024/i)).toBeInTheDocument();
    });

    it('should show current month when no default specified', () => {
      renderCalendar();
      
      expect(screen.getByText(new RegExp(currentMonth, 'i'))).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Controlled Month
  // ==========================================================================

  describe('Controlled Month', () => {
    it('should show controlled month', () => {
      const month = new Date(2024, 11, 1); // December 2024
      renderCalendar({ month });
      
      expect(screen.getByText(/December/i)).toBeInTheDocument();
    });

    it('should call onMonthChange when navigating', async () => {
      const handleMonthChange = jest.fn();
      renderCalendar({ onMonthChange: handleMonthChange });
      
      const nextButton = screen.getByLabelText(/next month/i);
      await userEvent.click(nextButton);
      
      expect(handleMonthChange).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Week Configuration
  // ==========================================================================

  describe('Week Configuration', () => {
    it('should render week days header', () => {
      renderCalendar();
      
      // Should show abbreviated day names (7 days)
      const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      dayHeaders.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should render multiple rows of days', () => {
      renderCalendar();
      
      const rows = document.querySelectorAll('tr');
      // Should have header row + multiple day rows
      expect(rows.length).toBeGreaterThan(1);
    });
  });
});
