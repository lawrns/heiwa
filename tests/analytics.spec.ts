import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './helpers/auth';

// Mock analytics data setup
test.beforeEach(async ({ page }) => {
  // Mock authentication for admin access
  await page.addInitScript(() => {
    (window as any).__mockAuth = {
      user: {
        uid: 'admin_123',
        email: 'admin@heiwa.house',
        displayName: 'Admin User'
      },
      loading: false
    };
  });

  // Mock analytics API responses
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock analytics export
      if (url.includes('/api/analytics/export')) {
        return {
          ok: true,
          blob: async () => new Blob(['mock,csv,data'], { type: 'text/csv' })
        };
      }

      // Mock analytics data endpoints
      if (url.includes('/api/analytics')) {
        return {
          ok: true,
          json: async () => ({
            revenue: [
              { month: 'Jan', revenue: 12500 },
              { month: 'Feb', revenue: 14200 },
              { month: 'Mar', revenue: 16800 }
            ],
            occupancy: [
              { month: 'Jan', occupancy: 75 },
              { month: 'Feb', occupancy: 82 },
              { month: 'Mar', occupancy: 88 }
            ],
            bookingTrends: [
              { month: 'Jan', totalBookings: 45, confirmedBookings: 38, pendingBookings: 4, cancelledBookings: 3 },
              { month: 'Feb', totalBookings: 52, confirmedBookings: 44, pendingBookings: 5, cancelledBookings: 3 },
              { month: 'Mar', totalBookings: 61, confirmedBookings: 53, pendingBookings: 6, cancelledBookings: 2 }
            ]
          })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock Recharts components to avoid rendering issues in tests
  await page.addInitScript(() => {
    // Mock ResizeObserver for Recharts
    (window as any).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
});

test.describe('Analytics Dashboard (DASH-003)', () => {
  test('should render analytics dashboard with all charts', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify main dashboard elements
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    await expect(page.locator('text=Track revenue, occupancy, and client metrics')).toBeVisible();

    // Verify key metrics cards
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Occupancy Rate')).toBeVisible();
    await expect(page.locator('text=Active Clients')).toBeVisible();
    await expect(page.locator('text=Booking Rate')).toBeVisible();

    // Verify chart containers are present
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="occupancy-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-trends-chart"]')).toBeVisible();
  });

  test('should display and interact with filters', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify filters section
    await expect(page.locator('text=Filters')).toBeVisible();
    await expect(page.locator('[data-testid="date-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-filter"]')).toBeVisible();

    // Test date filter
    const startDateInput = page.locator('[data-testid="date-filter"]');
    await startDateInput.fill('2024-01-01');
    await expect(startDateInput).toHaveValue('2024-01-01');

    // Test brand filter
    await page.locator('[data-testid="brand-filter"]').click();
    await expect(page.locator('text=All Brands')).toBeVisible();
    await expect(page.locator('text=Heiwa House')).toBeVisible();
    await expect(page.locator('text=Freedom Routes')).toBeVisible();

    // Select a brand
    await page.locator('text=Heiwa House').click();
    await expect(page.locator('[data-testid="brand-filter"]')).toContainText('Heiwa House');
  });

  test('should handle CSV export functionality', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify export button is present
    const exportButton = page.locator('[data-testid="export-csv"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toHaveText('Download Report');

    // Mock download behavior
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await exportButton.click();

    // Verify loading state
    await expect(exportButton).toHaveText('Exporting...');
    await expect(exportButton).toBeDisabled();

    // Wait for potential download (in real scenario)
    // Note: In test environment, actual file download might not occur
    await page.waitForTimeout(1000);

    // Verify button returns to normal state
    await expect(exportButton).toHaveText('Download Report');
    await expect(exportButton).toBeEnabled();
  });

  test('should display revenue chart with data', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify revenue chart section
    await expect(page.locator('text=Monthly Revenue')).toBeVisible();
    await expect(page.locator('text=Track revenue trends over time')).toBeVisible();

    // Verify chart container
    const revenueChart = page.locator('[data-testid="revenue-chart"]');
    await expect(revenueChart).toBeVisible();

    // Verify chart has rendered (check for SVG elements)
    await expect(revenueChart.locator('svg')).toBeVisible();
  });

  test('should display occupancy chart with data', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify occupancy chart section
    await expect(page.locator('text=Room Occupancy')).toBeVisible();
    await expect(page.locator('text=Monthly occupancy rates')).toBeVisible();

    // Verify chart container
    const occupancyChart = page.locator('[data-testid="occupancy-chart"]');
    await expect(occupancyChart).toBeVisible();

    // Verify chart has rendered
    await expect(occupancyChart.locator('svg')).toBeVisible();
  });

  test('should display booking trends chart with data', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify booking trends chart section
    await expect(page.locator('text=Booking Trends')).toBeVisible();
    await expect(page.locator('text=Track booking patterns and status breakdown')).toBeVisible();

    // Verify chart container
    const bookingTrendsChart = page.locator('[data-testid="booking-trends-chart"]');
    await expect(bookingTrendsChart).toBeVisible();

    // Verify chart has rendered
    await expect(bookingTrendsChart.locator('svg')).toBeVisible();

    // Verify trend indicators
    await expect(page.locator('text=Total Bookings')).toBeVisible();
    await expect(page.locator('text=Confirmed')).toBeVisible();
  });

  test('should handle real-time updates simulation', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Simulate real-time data update
    await page.evaluate(() => {
      // Trigger a mock data update event
      window.dispatchEvent(new CustomEvent('analytics-update', {
        detail: { type: 'revenue', value: 15000 }
      }));
    });

    // Verify charts are still visible after update
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="occupancy-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-trends-chart"]')).toBeVisible();
  });

  test('should display client acquisition chart', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify client acquisition section
    await expect(page.locator('text=Client Acquisition')).toBeVisible();
    await expect(page.locator('text=New client registrations over time')).toBeVisible();
  });

  test('should display conversion funnel', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify conversion funnel section
    await expect(page.locator('text=Booking Conversion Funnel')).toBeVisible();
    await expect(page.locator('text=Track the customer journey from visitor to booking')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/analytics**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ revenue: [], occupancy: [], bookingTrends: [] })
      });
    });

    await page.goto('/admin/analytics');
    
    // Verify loading states are handled gracefully
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');

    // Verify dashboard still renders with error handling
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for charts to render

    // Take screenshot of the analytics dashboard
    await expect(page.locator('body')).toHaveScreenshot('analytics-dashboard.png');
  });
});
