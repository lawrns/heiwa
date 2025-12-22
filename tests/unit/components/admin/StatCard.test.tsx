/**
 * StatCard Component Tests
 * Feature: comprehensive-testing
 * 
 * Tests for the StatCard component used in admin dashboard
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatCard } from '@/components/admin/StatCard';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

describe('StatCard Component', () => {
  describe('Rendering', () => {
    it('should render title and value', () => {
      render(
        <StatCard
          title="Total Bookings"
          value={42}
          icon={Calendar}
        />
      );

      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render string value', () => {
      render(
        <StatCard
          title="Revenue"
          value="€12,500"
          icon={DollarSign}
        />
      );

      expect(screen.getByText('€12,500')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <StatCard
          title="Active Users"
          value={150}
          icon={Users}
          description="Last 30 days"
        />
      );

      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={100}
          icon={Users}
        />
      );

      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('should apply orange color by default', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={100}
          icon={Users}
        />
      );

      expect(container.querySelector('.bg-orange-50')).toBeInTheDocument();
    });

    it('should apply green color', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={100}
          icon={Users}
          color="green"
        />
      );

      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    it('should apply blue color', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={100}
          icon={Users}
          color="blue"
        />
      );

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('should apply purple color', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={100}
          icon={Users}
          color="purple"
        />
      );

      expect(container.querySelector('.bg-purple-50')).toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should display upward trend', () => {
      render(
        <StatCard
          title="Revenue"
          value={1000}
          icon={TrendingUp}
          trend={{ value: 15, direction: 'up' }}
        />
      );

      expect(screen.getByText(/↑ 15%/)).toBeInTheDocument();
    });

    it('should display downward trend', () => {
      render(
        <StatCard
          title="Cancellations"
          value={5}
          icon={Calendar}
          trend={{ value: 10, direction: 'down' }}
        />
      );

      expect(screen.getByText(/↓ 10%/)).toBeInTheDocument();
    });

    it('should apply green color for upward trend', () => {
      const { container } = render(
        <StatCard
          title="Revenue"
          value={1000}
          icon={TrendingUp}
          trend={{ value: 15, direction: 'up' }}
        />
      );

      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply red color for downward trend', () => {
      const { container } = render(
        <StatCard
          title="Cancellations"
          value={5}
          icon={Calendar}
          trend={{ value: 10, direction: 'down' }}
        />
      );

      expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <StatCard
          title="Clickable"
          value={100}
          icon={Users}
          onClick={onClick}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should render as button when onClick provided', () => {
      render(
        <StatCard
          title="Clickable"
          value={100}
          icon={Users}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have hover styles when clickable', () => {
      const { container } = render(
        <StatCard
          title="Clickable"
          value={100}
          icon={Users}
          onClick={() => {}}
        />
      );

      expect(container.querySelector('.hover\\:shadow-md')).toBeInTheDocument();
    });
  });

  describe('Link Behavior', () => {
    it('should render as link when href provided', () => {
      render(
        <StatCard
          title="Link Card"
          value={100}
          icon={Users}
          href="/admin/users"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/admin/users');
    });

    it('should have hover styles when href provided', () => {
      const { container } = render(
        <StatCard
          title="Link Card"
          value={100}
          icon={Users}
          href="/admin/users"
        />
      );

      expect(container.querySelector('.hover\\:shadow-md')).toBeInTheDocument();
    });
  });

  describe('Non-Interactive', () => {
    it('should not render as button or link when neither onClick nor href provided', () => {
      render(
        <StatCard
          title="Static"
          value={100}
          icon={Users}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should not have hover styles when not interactive', () => {
      const { container } = render(
        <StatCard
          title="Static"
          value={100}
          icon={Users}
        />
      );

      // The card itself should not have cursor-pointer
      const card = container.querySelector('.rounded-lg');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('should have button type when clickable', () => {
      render(
        <StatCard
          title="Clickable"
          value={100}
          icon={Users}
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible when clickable', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <StatCard
          title="Clickable"
          value={100}
          icon={Users}
          onClick={onClick}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalled();
    });
  });
});
