import { test, expect } from '@playwright/test';

// Mock data for testing
const mockRooms = [
  { id: 'room1', name: 'Ocean View Room', capacity: 2 },
  { id: 'room2', name: 'Garden Room', capacity: 4 },
];

const mockClients = [
  { id: 'client1', name: 'John Doe', email: 'john@example.com' },
  { id: 'client2', name: 'Jane Smith', email: 'jane@example.com' },
];

test.describe('Calendar Add Event Flow', () => {
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

    // Mock API responses
    await page.route('**/api/firebase-clients', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ clients: mockClients }),
      });
    });

    await page.route('**/api/rooms', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ rooms: mockRooms }),
      });
    });

    await page.route('**/api/calendar-events', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ events: [] }),
        });
      } else if (route.request().method() === 'POST') {
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            event: {
              id: 'new-event-id',
              ...requestBody,
            },
          }),
        });
      }
    });

    await page.route('**/api/firebase-surfcamps', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ surfCamps: [] }),
        });
      } else if (route.request().method() === 'POST') {
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            surfCamp: {
              id: 'new-surf-camp-id',
              ...requestBody,
            },
          }),
        });
      }
    });

    // Mock Supabase data
    await page.addInitScript(() => {
      // Mock Supabase client
      (window as any).__mockSupabase = {
        from: (table: string) => ({
          select: () => ({
            order: () => ({
              then: (callback: any) => {
                const data = table === 'surf_camps' ? [] :
                           table === 'bookings' ? [] :
                           table === 'custom_events' ? [] : [];
                callback({ data, error: null });
                return Promise.resolve({ data, error: null });
              }
            })
          })
        }),
        channel: () => ({
          on: () => ({ subscribe: () => ({}) }),
          subscribe: () => ({})
        })
      };
    });

    // Mock auth session check
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            uid: 'admin_123',
            email: 'admin@heiwa.house',
            role: 'admin'
          }
        }),
      });
    });

    // Navigate to calendar page
    await page.goto('/admin/calendar');
    await page.waitForLoadState('networkidle');
  });

  test('Add Event button opens modal', async ({ page }) => {
    // First, let's login manually
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@heiwa.house');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Now navigate to calendar
    await page.goto('/admin/calendar');
    await page.waitForLoadState('networkidle');

    // Wait for calendar to load
    await page.waitForTimeout(3000);

    // Check that Add Event button exists
    const addEventButton = page.getByRole('button', { name: /add event/i });
    await expect(addEventButton).toBeVisible();

    // Click the button
    await addEventButton.click();

    // Check that modal opens
    const modal = page.getByRole('dialog', { name: /add new event/i });
    await expect(modal).toBeVisible();

    // Check that modal has the expected content
    await expect(page.getByText('Create a new event on your calendar')).toBeVisible();
    await expect(page.getByText('Event Type')).toBeVisible();
  });

  test('Custom event creation flow', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add event/i }).click();

    // Select custom event type (should be selected by default)
    const customEventCard = page.locator('[data-testid="custom-event-card"]').first();
    await customEventCard.click();

    // Fill in event details
    await page.getByLabel('Title *').fill('Team Meeting');
    await page.getByLabel('Description').fill('Weekly team sync meeting');

    // Set dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await page.getByLabel('Start Date *').click();
    await page.getByRole('button', { name: today.getDate().toString() }).click();

    await page.getByLabel('End Date *').click();
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).click();

    // Set color
    await page.locator('input[type="color"]').fill('#ff0000');

    // Submit form
    await page.getByRole('button', { name: /create event/i }).click();

    // Check for success message
    await expect(page.getByText(/event created successfully/i)).toBeVisible();
  });

  test('Surf camp event creation flow', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add event/i }).click();

    // Select surf camp event type
    const surfCampCard = page.locator('text=Surf Camp').locator('..').locator('..');
    await surfCampCard.click();

    // Fill in event details
    await page.getByLabel('Title *').fill('Advanced Surf Camp');
    await page.getByLabel('Description').fill('Advanced surfing techniques');

    // Set category
    await page.getByLabel('Category *').click();
    await page.getByRole('option', { name: 'Freedom Routes' }).click();

    // Set capacity
    await page.getByLabel('Capacity *').fill('12');

    // Select rooms
    await page.getByLabel('Ocean View Room').check();
    await page.getByLabel('Garden Room').check();

    // Set dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await page.getByLabel('Start Date *').click();
    await page.getByRole('button', { name: today.getDate().toString() }).click();

    await page.getByLabel('End Date *').click();
    await page.getByRole('button', { name: nextWeek.getDate().toString() }).click();

    // Submit form
    await page.getByRole('button', { name: /create event/i }).click();

    // Check for success message
    await expect(page.getByText(/surf camp created successfully/i)).toBeVisible();
  });

  test('Form validation errors', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add event/i }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create event/i }).click();

    // Check for validation errors
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Start date is required')).toBeVisible();
    await expect(page.getByText('End date is required')).toBeVisible();
  });

  test('Date selection from calendar clicks', async ({ page }) => {
    // Click on a calendar date (this would need to be implemented based on the calendar component)
    // For now, we'll simulate the behavior by checking if the modal opens with pre-filled dates
    
    // This test would need to be implemented once the calendar slot selection is working
    // await page.locator('.rbc-day-bg').first().click();
    // await expect(page.getByRole('dialog', { name: /add new event/i })).toBeVisible();
    
    // For now, just verify the modal can be opened
    await page.getByRole('button', { name: /add event/i }).click();
    await expect(page.getByRole('dialog', { name: /add new event/i })).toBeVisible();
  });

  test('Conflict detection warnings', async ({ page }) => {
    // Mock a conflict response
    await page.route('**/api/calendar-events', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Scheduling conflict detected',
            conflicts: [
              {
                type: 'surf_camp',
                id: 'existing-camp',
                title: 'Existing Surf Camp',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                description: 'Overlapping surf camp',
              },
            ],
            warnings: ['This event may conflict with existing bookings'],
          }),
        });
      }
    });

    // Open modal and fill form
    await page.getByRole('button', { name: /add event/i }).click();
    await page.getByLabel('Title *').fill('Conflicting Event');

    // Set dates that would conflict
    const today = new Date();
    await page.getByLabel('Start Date *').click();
    await page.getByRole('button', { name: today.getDate().toString() }).click();

    // Submit form
    await page.getByRole('button', { name: /create event/i }).click();

    // Check for conflict warnings
    await expect(page.getByText('Scheduling Issues Detected')).toBeVisible();
    await expect(page.getByText('Existing Surf Camp')).toBeVisible();
    await expect(page.getByText('This event may conflict with existing bookings')).toBeVisible();
  });

  test('Modal close functionality', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add event/i }).click();
    await expect(page.getByRole('dialog', { name: /add new event/i })).toBeVisible();

    // Close with Cancel button
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog', { name: /add new event/i })).not.toBeVisible();

    // Open modal again
    await page.getByRole('button', { name: /add event/i }).click();
    await expect(page.getByRole('dialog', { name: /add new event/i })).toBeVisible();

    // Close with X button (if available) or ESC key
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /add new event/i })).not.toBeVisible();
  });

  test('Loading states during form submission', async ({ page }) => {
    // Mock a delayed response
    await page.route('**/api/calendar-events', async route => {
      if (route.request().method() === 'POST') {
        // Delay the response to test loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ event: { id: 'new-event' } }),
        });
      }
    });

    // Open modal and fill form
    await page.getByRole('button', { name: /add event/i }).click();
    await page.getByLabel('Title *').fill('Test Event');

    // Submit form
    const submitButton = page.getByRole('button', { name: /create event/i });
    await submitButton.click();

    // Check for loading state
    await expect(page.getByText('Creating...')).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Wait for completion
    await expect(page.getByText(/event created successfully/i)).toBeVisible();
  });

  test('Event type switching', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add event/i }).click();

    // Start with custom event (default)
    await expect(page.getByText('Custom Event Details')).toBeVisible();

    // Switch to surf camp
    const surfCampCard = page.locator('text=Surf Camp').locator('..').locator('..');
    await surfCampCard.click();
    await expect(page.getByText('Surf Camp Details')).toBeVisible();

    // Switch to booking
    const bookingCard = page.locator('text=Room Booking').locator('..').locator('..');
    await bookingCard.click();
    await expect(page.getByText('Booking Details')).toBeVisible();
    await expect(page.getByText('not yet fully implemented')).toBeVisible();

    // Switch back to custom
    const customCard = page.locator('text=Custom Event').locator('..').locator('..');
    await customCard.click();
    await expect(page.getByText('Custom Event Details')).toBeVisible();
  });
});
