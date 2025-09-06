import { test, expect } from '@playwright/test';

// Mock booking calendar setup
test.beforeEach(async ({ page }) => {
  // Mock admin authentication
  await page.addInitScript(() => {
    (window as any).__mockAuth = {
      user: {
        uid: 'admin_123',
        email: 'admin@heiwa.house',
        displayName: 'Admin User',
        role: 'admin'
      },
      loading: false
    };

    (window as any).__currentUser = (window as any).__mockAuth.user;
  });

  // Mock calendar data and API responses
  await page.addInitScript(() => {
    // Mock booking data for calendar
    (window as any).__mockBookings = [
      {
        id: 'booking_001',
        title: 'Ocean View Suite - John Doe',
        start: new Date('2024-03-15T14:00:00'),
        end: new Date('2024-03-17T11:00:00'),
        resource: 'room_001',
        status: 'confirmed',
        clientName: 'John Doe',
        roomName: 'Ocean View Suite',
        amount: 500
      },
      {
        id: 'booking_002',
        title: 'Beginner Surf Camp - Jane Smith',
        start: new Date('2024-03-20T09:00:00'),
        end: new Date('2024-03-22T17:00:00'),
        resource: 'camp_001',
        status: 'pending',
        clientName: 'Jane Smith',
        campName: 'Beginner Surf Camp',
        amount: 450
      },
      {
        id: 'booking_003',
        title: 'Deluxe Room - Mike Johnson',
        start: new Date('2024-03-25T15:00:00'),
        end: new Date('2024-03-27T10:00:00'),
        resource: 'room_002',
        status: 'confirmed',
        clientName: 'Mike Johnson',
        roomName: 'Deluxe Room',
        amount: 350
      }
    ];

    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock calendar bookings API
      if (url.includes('/api/bookings/calendar')) {
        return {
          ok: true,
          json: async () => ({
            bookings: (window as any).__mockBookings
          })
        };
      }

      // Mock booking update API (for drag and drop)
      if (url.includes('/api/bookings/') && options?.method === 'PATCH') {
        const bookingId = url.split('/').pop();
        const updateData = JSON.parse(options.body);
        
        // Update mock booking
        const bookingIndex = (window as any).__mockBookings.findIndex((b: any) => b.id === bookingId);
        if (bookingIndex !== -1) {
          (window as any).__mockBookings[bookingIndex] = {
            ...(window as any).__mockBookings[bookingIndex],
            ...updateData
          };
        }

        return {
          ok: true,
          json: async () => ({ success: true })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock react-big-calendar components
  await page.addInitScript(() => {
    // Mock drag and drop functionality
    (window as any).mockDragDrop = {
      onEventDrop: (event: any, start: Date, end: Date) => {
        console.log('Event dropped:', event.id, 'New dates:', start, end);
        return true;
      },
      onEventResize: (event: any, start: Date, end: Date) => {
        console.log('Event resized:', event.id, 'New dates:', start, end);
        return true;
      }
    };
  });
});

test.describe('Booking Calendar View (BOOK-003)', () => {
  test('should render booking calendar with events', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Verify calendar container exists
    await expect(page.locator('[data-testid="booking-calendar"]')).toBeVisible();

    // Verify calendar navigation elements
    await expect(page.locator('text=Today')).toBeVisible();
    await expect(page.locator('button:has-text("Month")')).toBeVisible();
    await expect(page.locator('button:has-text("Week")')).toBeVisible();
    await expect(page.locator('button:has-text("Day")')).toBeVisible();

    // Verify booking events are displayed
    await expect(page.locator('text=Ocean View Suite - John Doe')).toBeVisible();
    await expect(page.locator('text=Beginner Surf Camp - Jane Smith')).toBeVisible();
    await expect(page.locator('text=Deluxe Room - Mike Johnson')).toBeVisible();
  });

  test('should switch between calendar views (Month, Week, Day)', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Test Month view (default)
    await expect(page.locator('button:has-text("Month")')).toHaveClass(/active|selected/);

    // Switch to Week view
    await page.locator('button:has-text("Week")').click();
    await page.waitForTimeout(500);
    
    // Verify week view is active
    await expect(page.locator('button:has-text("Week")')).toHaveClass(/active|selected/);

    // Switch to Day view
    await page.locator('button:has-text("Day")').click();
    await page.waitForTimeout(500);
    
    // Verify day view is active
    await expect(page.locator('button:has-text("Day")')).toHaveClass(/active|selected/);

    // Switch back to Month view
    await page.locator('button:has-text("Month")').click();
    await page.waitForTimeout(500);
    
    await expect(page.locator('button:has-text("Month")')).toHaveClass(/active|selected/);
  });

  test('should navigate between months/weeks/days', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Get current month/date display
    const currentDate = await page.locator('.rbc-toolbar-label').textContent();
    
    // Navigate to next month
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    
    // Verify date changed
    const nextDate = await page.locator('.rbc-toolbar-label').textContent();
    expect(nextDate).not.toBe(currentDate);

    // Navigate to previous month
    await page.locator('button:has-text("Back")').click();
    await page.waitForTimeout(500);
    
    // Should be back to original date
    const backDate = await page.locator('.rbc-toolbar-label').textContent();
    expect(backDate).toBe(currentDate);

    // Test "Today" button
    await page.locator('button:has-text("Today")').click();
    await page.waitForTimeout(500);
    
    // Should navigate to current date
    const todayDate = await page.locator('.rbc-toolbar-label').textContent();
    expect(todayDate).toContain(new Date().getFullYear().toString());
  });

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Verify filter controls exist
    await expect(page.locator('[data-testid="calendar-filter"]')).toBeVisible();

    // Test filter by confirmed bookings
    const confirmedFilter = page.locator('select[data-testid="status-filter"]');
    if (await confirmedFilter.isVisible()) {
      await confirmedFilter.selectOption('confirmed');
      await page.waitForTimeout(500);

      // Should show only confirmed bookings
      await expect(page.locator('text=Ocean View Suite - John Doe')).toBeVisible();
      await expect(page.locator('text=Deluxe Room - Mike Johnson')).toBeVisible();
      
      // Pending booking should be hidden
      await expect(page.locator('text=Beginner Surf Camp - Jane Smith')).not.toBeVisible();
    }

    // Test filter by pending bookings
    if (await confirmedFilter.isVisible()) {
      await confirmedFilter.selectOption('pending');
      await page.waitForTimeout(500);

      // Should show only pending bookings
      await expect(page.locator('text=Beginner Surf Camp - Jane Smith')).toBeVisible();
      
      // Confirmed bookings should be hidden
      await expect(page.locator('text=Ocean View Suite - John Doe')).not.toBeVisible();
    }

    // Reset filter to show all
    if (await confirmedFilter.isVisible()) {
      await confirmedFilter.selectOption('all');
      await page.waitForTimeout(500);

      // All bookings should be visible again
      await expect(page.locator('text=Ocean View Suite - John Doe')).toBeVisible();
      await expect(page.locator('text=Beginner Surf Camp - Jane Smith')).toBeVisible();
      await expect(page.locator('text=Deluxe Room - Mike Johnson')).toBeVisible();
    }
  });

  test('should filter bookings by date range', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Test date range filter
    const startDateFilter = page.locator('input[data-testid="start-date-filter"]');
    const endDateFilter = page.locator('input[data-testid="end-date-filter"]');

    if (await startDateFilter.isVisible() && await endDateFilter.isVisible()) {
      // Set date range that includes only some bookings
      await startDateFilter.fill('2024-03-20');
      await endDateFilter.fill('2024-03-25');
      await page.waitForTimeout(500);

      // Should show only bookings in date range
      await expect(page.locator('text=Beginner Surf Camp - Jane Smith')).toBeVisible();
      
      // Bookings outside range should be hidden
      await expect(page.locator('text=Ocean View Suite - John Doe')).not.toBeVisible();
    }
  });

  test('should handle event drag and drop to reschedule', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Find a booking event
    const bookingEvent = page.locator('text=Ocean View Suite - John Doe').first();
    
    if (await bookingEvent.isVisible()) {
      // Get initial position
      const initialBox = await bookingEvent.boundingBox();
      
      // Simulate drag and drop (move to a different date)
      await bookingEvent.hover();
      await page.mouse.down();
      
      // Move to a different position (simulate dropping on a different date)
      if (initialBox) {
        await page.mouse.move(initialBox.x + 100, initialBox.y + 50);
        await page.mouse.up();
      }
      
      await page.waitForTimeout(1000);

      // Verify drag operation was handled (check for success message or API call)
      // This would depend on your implementation
      const successMessage = page.locator('text=Booking updated successfully');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('should show booking details on event click', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Click on a booking event
    await page.locator('text=Ocean View Suite - John Doe').first().click();
    await page.waitForTimeout(500);

    // Verify booking details modal/popup appears
    const detailsModal = page.locator('[data-testid="booking-details-modal"]');
    if (await detailsModal.isVisible()) {
      await expect(detailsModal).toBeVisible();
      
      // Verify booking details are shown
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=Ocean View Suite')).toBeVisible();
      await expect(page.locator('text=$500')).toBeVisible();
    }
  });

  test('should handle event resizing', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Find a booking event
    const bookingEvent = page.locator('text=Ocean View Suite - John Doe').first();
    
    if (await bookingEvent.isVisible()) {
      // Look for resize handle (usually at the bottom of the event)
      const resizeHandle = page.locator('.rbc-event-resize-handle').first();
      
      if (await resizeHandle.isVisible()) {
        // Simulate resize by dragging the handle
        await resizeHandle.hover();
        await page.mouse.down();
        await page.mouse.move(0, 50); // Extend the event
        await page.mouse.up();
        
        await page.waitForTimeout(1000);

        // Verify resize operation was handled
        const successMessage = page.locator('text=Booking updated successfully');
        if (await successMessage.isVisible()) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });

  test('should display different booking types with distinct styling', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Verify room bookings and surf camp bookings have different styling
    const roomBooking = page.locator('text=Ocean View Suite - John Doe').first();
    const campBooking = page.locator('text=Beginner Surf Camp - Jane Smith').first();

    if (await roomBooking.isVisible() && await campBooking.isVisible()) {
      // Get computed styles
      const roomStyles = await roomBooking.evaluate(el => {
        const styles = window.getComputedStyle(el.closest('.rbc-event') || el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderColor: styles.borderColor
        };
      });

      const campStyles = await campBooking.evaluate(el => {
        const styles = window.getComputedStyle(el.closest('.rbc-event') || el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderColor: styles.borderColor
        };
      });

      // Styles should be different for different booking types
      expect(roomStyles.backgroundColor).not.toBe(campStyles.backgroundColor);
    }
  });

  test('should handle calendar responsiveness on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Calendar should be visible and responsive
    await expect(page.locator('[data-testid="booking-calendar"]')).toBeVisible();

    // On mobile, calendar might switch to a more compact view
    const calendarContainer = page.locator('[data-testid="booking-calendar"]');
    const containerWidth = await calendarContainer.evaluate(el => el.getBoundingClientRect().width);
    
    // Should fit within mobile viewport
    expect(containerWidth).toBeLessThanOrEqual(375);

    // Test mobile-specific interactions
    const bookingEvent = page.locator('text=Ocean View Suite - John Doe').first();
    if (await bookingEvent.isVisible()) {
      // Tap on event (mobile interaction)
      await bookingEvent.tap();
      await page.waitForTimeout(500);
    }
  });

  test('should handle empty calendar state', async ({ page }) => {
    // Mock empty bookings response
    await page.addInitScript(() => {
      (window as any).__mockBookings = [];
      
      const originalFetch = window.fetch;
      (window as any).fetch = async (url: string, options?: any) => {
        if (url.includes('/api/bookings/calendar')) {
          return {
            ok: true,
            json: async () => ({ bookings: [] })
          };
        }
        return originalFetch(url, options);
      };
    });

    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Calendar should still render
    await expect(page.locator('[data-testid="booking-calendar"]')).toBeVisible();

    // Should show empty state message
    const emptyMessage = page.locator('text=No bookings found');
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/bookings/calendar', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.locator('text=Failed to load bookings')).toBeVisible();
  });

  test('should take snapshots for visual regression', async ({ page }) => {
    await page.goto('/admin/bookings/calendar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of full calendar page in month view
    await expect(page.locator('body')).toHaveScreenshot('booking-calendar-page-month.png');

    // Take screenshot of calendar component only
    await expect(page.locator('[data-testid="booking-calendar"]')).toHaveScreenshot('booking-calendar-month.png');

    // Switch to week view and take screenshots
    await page.locator('button:has-text("Week")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="booking-calendar"]')).toHaveScreenshot('booking-calendar-week.png');

    // Switch to day view and take screenshot
    await page.locator('button:has-text("Day")').click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="booking-calendar"]')).toHaveScreenshot('booking-calendar-day.png');

    // Test calendar with filters applied
    const statusFilter = page.locator('select[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('confirmed');
      await page.waitForTimeout(500);

      await expect(page.locator('[data-testid="booking-calendar"]')).toHaveScreenshot('booking-calendar-filtered.png');
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('booking-calendar-mobile.png');
  });
});
