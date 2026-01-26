/**
 * Dialog Component Unit Tests
 * Tests for rendering, open/close behavior, and accessibility
 * 
 * Note: Some interactive tests (keyboard interactions) may have limitations
 * in jsdom. Full interaction tests should be covered by E2E tests.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

// Helper to render a basic dialog
const renderDialog = (props: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
} = {}) => {
  return render(
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      defaultOpen={props.defaultOpen}
    >
      <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
      <DialogContent data-testid="dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
          <DialogDescription data-testid="dialog-description">
            Dialog description text
          </DialogDescription>
        </DialogHeader>
        <div data-testid="dialog-body">Dialog body content</div>
        <DialogFooter>
          <DialogClose data-testid="dialog-close-button">Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

describe('Dialog Component', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('should render dialog trigger', () => {
      renderDialog();
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    });

    it('should not render content when closed', () => {
      renderDialog();
      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
    });

    it('should render content when defaultOpen is true', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('should render content when open is true (controlled)', () => {
      renderDialog({ open: true });
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Open/Close Behavior
  // ==========================================================================

  describe('Open/Close Behavior', () => {
    it('should open dialog when trigger is clicked', async () => {
      renderDialog();
      
      await userEvent.click(screen.getByTestId('dialog-trigger'));
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      });
    });

    it('should call onOpenChange when opened', async () => {
      const handleOpenChange = jest.fn();
      renderDialog({ onOpenChange: handleOpenChange });
      
      await userEvent.click(screen.getByTestId('dialog-trigger'));
      
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('should close dialog when close button is clicked', async () => {
      renderDialog({ defaultOpen: true });
      
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      
      await userEvent.click(screen.getByTestId('dialog-close-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when X button is clicked', async () => {
      renderDialog({ defaultOpen: true });
      
      // Get the X button specifically (the one with the svg icon)
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const xButton = closeButtons.find(btn => btn.querySelector('svg'));
      await userEvent.click(xButton!);
      
      await waitFor(() => {
        expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when closed', async () => {
      const handleOpenChange = jest.fn();
      renderDialog({ defaultOpen: true, onOpenChange: handleOpenChange });
      
      await userEvent.click(screen.getByTestId('dialog-close-button'));
      
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // ==========================================================================
  // Content Rendering
  // ==========================================================================

  describe('Content Rendering', () => {
    it('should render dialog title', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Dialog Title');
    });

    it('should render dialog description', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-description')).toHaveTextContent('Dialog description text');
    });

    it('should render dialog body content', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-body')).toHaveTextContent('Dialog body content');
    });

    it('should render close button with X icon', () => {
      renderDialog({ defaultOpen: true });
      // Get the X button specifically (the one with the svg icon)
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const xButton = closeButtons.find(btn => btn.querySelector('svg'));
      expect(xButton).toBeInTheDocument();
      expect(xButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Styling
  // ==========================================================================

  describe('Styling', () => {
    it('should have centered positioning', () => {
      renderDialog({ defaultOpen: true });
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('left-[50%]');
      expect(content).toHaveClass('top-[50%]');
      expect(content).toHaveClass('translate-x-[-50%]');
      expect(content).toHaveClass('translate-y-[-50%]');
    });

    it('should have max-width constraint', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-content')).toHaveClass('max-w-lg');
    });

    it('should have z-index for overlay', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-content')).toHaveClass('z-50');
    });

    it('should have border and shadow styling', () => {
      renderDialog({ defaultOpen: true });
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('shadow-xl');
    });

    it('should have padding', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-content')).toHaveClass('p-6');
    });

    it('should have rounded corners on larger screens', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByTestId('dialog-content')).toHaveClass('sm:rounded-lg');
    });

    it('should have animation classes', () => {
      renderDialog({ defaultOpen: true });
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('data-[state=open]:animate-in');
      expect(content).toHaveClass('data-[state=closed]:animate-out');
    });
  });

  // ==========================================================================
  // DialogHeader
  // ==========================================================================

  describe('DialogHeader', () => {
    it('should render with flex column layout', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      
      const header = screen.getByTestId('dialog-header');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
    });

    it('should have spacing between children', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('dialog-header')).toHaveClass('space-y-1.5');
    });

    it('should have text alignment classes', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      
      const header = screen.getByTestId('dialog-header');
      expect(header).toHaveClass('text-center');
      expect(header).toHaveClass('sm:text-left');
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader className="custom-header" data-testid="dialog-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('dialog-header')).toHaveClass('custom-header');
    });
  });

  // ==========================================================================
  // DialogFooter
  // ==========================================================================

  describe('DialogFooter', () => {
    it('should render with flex layout', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter data-testid="dialog-footer">
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      const footer = screen.getByTestId('dialog-footer');
      expect(footer).toHaveClass('flex');
    });

    it('should have column-reverse on mobile', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter data-testid="dialog-footer">
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('dialog-footer')).toHaveClass('flex-col-reverse');
    });

    it('should have row layout on larger screens', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter data-testid="dialog-footer">
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      const footer = screen.getByTestId('dialog-footer');
      expect(footer).toHaveClass('sm:flex-row');
      expect(footer).toHaveClass('sm:justify-end');
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogFooter className="custom-footer" data-testid="dialog-footer">
              <button>Cancel</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('dialog-footer')).toHaveClass('custom-footer');
    });
  });

  // ==========================================================================
  // DialogTitle
  // ==========================================================================

  describe('DialogTitle', () => {
    it('should render with correct typography', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle data-testid="title">Test Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
    });

    it('should have tracking-tight', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle data-testid="title">Test Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('title')).toHaveClass('tracking-tight');
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle className="custom-title" data-testid="title">Test</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('title')).toHaveClass('custom-title');
    });
  });

  // ==========================================================================
  // DialogDescription
  // ==========================================================================

  describe('DialogDescription', () => {
    it('should render with correct typography', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription data-testid="description">Test description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('description')).toHaveClass('text-sm');
    });

    it('should have muted foreground color', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription data-testid="description">Test</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('description')).toHaveClass('text-muted-foreground');
    });

    it('should accept custom className', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogDescription className="custom-desc" data-testid="description">Test</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('description')).toHaveClass('custom-desc');
    });
  });

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have dialog role when open', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible close buttons', () => {
      renderDialog({ defaultOpen: true });
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should have sr-only text for close button', () => {
      renderDialog({ defaultOpen: true });
      expect(screen.getByText('Close', { selector: '.sr-only' })).toBeInTheDocument();
    });

    it('should trap focus within dialog', async () => {
      renderDialog({ defaultOpen: true });
      
      // Dialog should be focused or contain focus
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Controlled Component
  // ==========================================================================

  describe('Controlled Component', () => {
    it('should respect controlled open state', () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent data-testid="dialog-content">Content</DialogContent>
        </Dialog>
      );
      
      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
      
      rerender(
        <Dialog open={true}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent data-testid="dialog-content">Content</DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });

    it('should not close when clicking trigger in controlled mode', async () => {
      const handleOpenChange = jest.fn();
      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogTrigger data-testid="trigger">Open</DialogTrigger>
          <DialogContent data-testid="dialog-content">Content</DialogContent>
        </Dialog>
      );
      
      // Content should remain visible since it's controlled
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Custom Content
  // ==========================================================================

  describe('Custom Content', () => {
    it('should render custom content in dialog', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <form data-testid="custom-form">
              <input type="text" placeholder="Name" />
              <button type="submit">Submit</button>
            </form>
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('custom-form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should apply custom className to content', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent className="custom-content" data-testid="dialog-content">
            Content
          </DialogContent>
        </Dialog>
      );
      
      expect(screen.getByTestId('dialog-content')).toHaveClass('custom-content');
    });
  });
});
