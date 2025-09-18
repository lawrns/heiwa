import { test, expect } from '@playwright/test';

/**
 * Comprehensive Admin Dashboard Test Suite
 * 
 * This test suite covers all major admin functionality identified in the manual audit:
 * - Authentication & Access Control
 * - Dashboard Overview
 * - Room Management
 * - Booking Management  
 * - Client Management
 * - Add-ons Management
 * - Calendar Functionality
 * - Analytics Dashboard
 * - Surf Camps Management
 * - Assignments Management
 * - Compliance Management
 * - System Administration
 */

test.describe('Admin Dashboard - Comprehensive Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate
    await page.goto('/login');
    
    // Fill in login credentials
    await page.getByTestId('email-input').fill('admin@heiwa.house');
    await page.getByTestId('password-input').fill('admin123456');
    
    // Submit login form
    await page.getByTestId('login-button').click();
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin');
    
    // Verify successful authentication
    await expect(page.getByText('admin@heiwa.house')).toBeVisible();
  });

  test('Authentication & Access Control', async ({ page }) => {
    // Verify admin interface loads
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Verify navigation menu is present
    await expect(page.getByTestId('sidebar-nav-clients')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-rooms')).toBeVisible();
    await expect(page.getByTestId('sidebar-nav-bookings')).toBeVisible();
    
    // Test logout functionality
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('Dashboard Overview Statistics', async ({ page }) => {
    // Verify dashboard statistics are displayed
    await expect(page.getByText('Total Clients')).toBeVisible();
    await expect(page.getByText('Total Bookings')).toBeVisible();
    await expect(page.getByText('Available Rooms')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();
    
    // Verify management cards are present
    await expect(page.getByText('Manage Clients')).toBeVisible();
    await expect(page.getByText('Manage Rooms')).toBeVisible();
    await expect(page.getByText('View Bookings')).toBeVisible();
  });

  test('Room Management - View and Navigation', async ({ page }) => {
    // Navigate to rooms page
    await page.getByTestId('sidebar-nav-rooms').click();
    await page.waitForURL('/admin/rooms');
    
    // Verify rooms page loads
    await expect(page.getByRole('heading', { name: 'Rooms' })).toBeVisible();
    
    // Verify room listing is displayed
    await expect(page.getByText('Add Room')).toBeVisible();
    
    // Check if rooms are displayed (assuming there are rooms)
    const roomCards = page.locator('[data-testid*="room-card"]');
    if (await roomCards.count() > 0) {
      await expect(roomCards.first()).toBeVisible();
    }
  });

  test('Booking Management - View and Search', async ({ page }) => {
    // Navigate to bookings page
    await page.getByTestId('sidebar-nav-bookings').click();
    await page.waitForURL('/admin/bookings');
    
    // Verify bookings page loads
    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();
    
    // Verify booking management features
    await expect(page.getByText('Create Booking')).toBeVisible();
    
    // Test search functionality if search box exists
    const searchBox = page.getByPlaceholder('Search bookings');
    if (await searchBox.isVisible()) {
      await searchBox.fill('test');
      await page.waitForTimeout(500); // Wait for search to process
    }
  });

  test('Client Management - View and Features', async ({ page }) => {
    // Navigate to clients page
    await page.getByTestId('sidebar-nav-clients').click();
    await page.waitForURL('/admin/clients');
    
    // Verify clients page loads
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
    
    // Verify client management features
    await expect(page.getByText('Add Client')).toBeVisible();
    
    // Verify statistics are displayed
    await expect(page.getByText('Total Clients')).toBeVisible();
    await expect(page.getByText('With Bookings')).toBeVisible();
    await expect(page.getByText('New This Month')).toBeVisible();
    
    // Test search functionality
    const searchBox = page.getByPlaceholder('Search clients');
    if (await searchBox.isVisible()) {
      await searchBox.fill('test');
      await page.waitForTimeout(500);
    }
    
    // Test filter functionality
    const brandFilter = page.getByText('All Brands');
    if (await brandFilter.isVisible()) {
      await brandFilter.click();
    }
  });

  test('Add-ons Management', async ({ page }) => {
    // Navigate to add-ons page
    await page.getByTestId('sidebar-nav-addons').click();
    await page.waitForURL('/admin/addons');
    
    // Verify add-ons page loads
    await expect(page.getByRole('heading', { name: 'Add-ons' })).toBeVisible();
    
    // Verify add-ons are displayed
    const addonCards = page.locator('[data-testid*="addon-card"]');
    if (await addonCards.count() > 0) {
      await expect(addonCards.first()).toBeVisible();
    }
  });

  test('Calendar Functionality', async ({ page }) => {
    // Navigate to calendar page
    await page.getByTestId('sidebar-nav-calendar').click();
    await page.waitForURL('/admin/calendar');
    
    // Verify calendar page loads
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
    
    // Verify calendar statistics
    await expect(page.getByText('Total Events')).toBeVisible();
    await expect(page.getByText('Surf camp sessions')).toBeVisible();
    await expect(page.getByText('Room bookings')).toBeVisible();
  });

  test('Analytics Dashboard', async ({ page }) => {
    // Navigate to analytics page
    await page.getByTestId('sidebar-nav-analytics').click();
    await page.waitForURL('/admin/analytics');
    
    // Verify analytics page loads
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    
    // Verify analytics metrics are displayed
    await expect(page.getByText('Revenue')).toBeVisible();
    await expect(page.getByText('Occupancy')).toBeVisible();
    await expect(page.getByText('Clients')).toBeVisible();
  });

  test('Surf Camps Management', async ({ page }) => {
    // Navigate to surf camps page
    await page.getByTestId('sidebar-nav-surf-camps').click();
    await page.waitForURL('/admin/surfcamps');
    
    // Verify surf camps page loads
    await expect(page.getByRole('heading', { name: 'Surf Camps' })).toBeVisible();
    
    // Verify create camp button is present
    await expect(page.getByText('Create New Camp')).toBeVisible();
    
    // Check if surf camps are displayed
    const campCards = page.locator('[data-testid*="camp-card"]');
    if (await campCards.count() > 0) {
      await expect(campCards.first()).toBeVisible();
    }
  });

  test('Assignments Management', async ({ page }) => {
    // Navigate to assignments page
    await page.getByTestId('sidebar-nav-assignments').click();
    await page.waitForURL('/admin/assignments');
    
    // Verify assignments page loads
    await expect(page.getByRole('heading', { name: 'Room Assignments' })).toBeVisible();
    
    // Verify assignment features
    await expect(page.getByText('Select Week')).toBeVisible();
    await expect(page.getByText('Active Weeks')).toBeVisible();
    await expect(page.getByText('Total Participants')).toBeVisible();
    await expect(page.getByText('Occupancy Rate')).toBeVisible();
  });

  test('Compliance Management', async ({ page }) => {
    // Navigate to compliance page
    await page.getByTestId('sidebar-nav-compliance').click();
    await page.waitForURL('/admin/compliance');
    
    // Verify compliance page loads
    await expect(page.getByRole('heading', { name: 'GDPR Compliance' })).toBeVisible();
    
    // Verify compliance features
    await expect(page.getByText('Compliance Status')).toBeVisible();
    await expect(page.getByText('Active Consents')).toBeVisible();
    await expect(page.getByText('Data Exports')).toBeVisible();
    await expect(page.getByText('Audit Events')).toBeVisible();
    
    // Verify compliance navigation buttons
    await expect(page.getByText('Audit Logs')).toBeVisible();
    await expect(page.getByText('Data Export')).toBeVisible();
    await expect(page.getByText('Right to Erasure')).toBeVisible();
    await expect(page.getByText('Consent Management')).toBeVisible();
    await expect(page.getByText('Privacy Policy')).toBeVisible();
  });

  test('System Administration', async ({ page }) => {
    // Navigate to system page
    await page.getByTestId('sidebar-nav-system').click();
    await page.waitForURL('/admin/system');
    
    // Verify system page loads
    await expect(page.getByRole('heading', { name: 'System Administration' })).toBeVisible();
    
    // Verify system features
    await expect(page.getByText('System Status')).toBeVisible();
    await expect(page.getByText('Active Admins')).toBeVisible();
    await expect(page.getByText('Last Backup')).toBeVisible();
    await expect(page.getByText('Security Events')).toBeVisible();
    await expect(page.getByText('Integrations')).toBeVisible();
    
    // Verify system navigation buttons
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('Admin Users')).toBeVisible();
    await expect(page.getByText('System Health')).toBeVisible();
    await expect(page.getByText('Backup & Restore')).toBeVisible();
  });

  test('Navigation Between All Admin Pages', async ({ page }) => {
    // Test navigation to each admin page
    const adminPages = [
      { testId: 'sidebar-nav-clients', url: '/admin/clients', heading: 'Clients' },
      { testId: 'sidebar-nav-surf-camps', url: '/admin/surfcamps', heading: 'Surf Camps' },
      { testId: 'sidebar-nav-rooms', url: '/admin/rooms', heading: 'Rooms' },
      { testId: 'sidebar-nav-assignments', url: '/admin/assignments', heading: 'Room Assignments' },
      { testId: 'sidebar-nav-addons', url: '/admin/addons', heading: 'Add-ons' },
      { testId: 'sidebar-nav-calendar', url: '/admin/calendar', heading: 'Calendar' },
      { testId: 'sidebar-nav-bookings', url: '/admin/bookings', heading: 'Bookings' },
      { testId: 'sidebar-nav-analytics', url: '/admin/analytics', heading: 'Analytics' },
      { testId: 'sidebar-nav-compliance', url: '/admin/compliance', heading: 'GDPR Compliance' },
      { testId: 'sidebar-nav-system', url: '/admin/system', heading: 'System Administration' }
    ];

    for (const adminPage of adminPages) {
      await page.getByTestId(adminPage.testId).click();
      await page.waitForURL(adminPage.url);
      await expect(page.getByRole('heading', { name: adminPage.heading })).toBeVisible();
    }
  });

  test('Responsive Design - Mobile Navigation', async ({ page }) => {
    // Test mobile responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Check if sidebar collapses on mobile
    const sidebar = page.locator('aside');
    if (await sidebar.isVisible()) {
      // Test sidebar collapse button if present
      const collapseButton = page.getByRole('button', { name: 'Collapse sidebar' });
      if (await collapseButton.isVisible()) {
        await collapseButton.click();
      }
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

});
