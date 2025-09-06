import { test, expect } from '@playwright/test';

test.describe('Complete Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated users from admin routes to login', async ({ page }) => {
    // Try to access admin dashboard
    await page.goto('http://localhost:3009/admin');
    
    // Should be redirected to login page
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
    
    // Verify login page elements are visible
    await expect(page.locator('text=Heiwa House')).toBeVisible();
    await expect(page.locator('text=Admin Dashboard Login')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show clean isolated login page without admin UI elements', async ({ page }) => {
    await page.goto('http://localhost:3009/login');
    
    // Verify login page loads without admin layout elements
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Verify NO admin layout elements are present
    await expect(page.locator('[data-testid="admin-sidebar"]')).not.toBeVisible();
    await expect(page.locator('text=Dashboard')).not.toBeVisible();
    await expect(page.locator('text=Bookings')).not.toBeVisible();
    await expect(page.locator('text=Clients')).not.toBeVisible();
    
    // Verify login-specific elements are present
    await expect(page.locator('text=Demo Credentials')).toBeVisible();
    await expect(page.locator('button:has-text("Fill Form")')).toBeVisible();
  });

  test('should handle successful login and redirect to admin dashboard', async ({ page }) => {
    await page.goto('http://localhost:3009/login');
    
    // Fill in credentials using the demo button
    await page.locator('button:has-text("Fill Form")').click();
    
    // Verify form is filled
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@heiwa.house');
    await expect(page.locator('input[type="password"]')).toHaveValue('admin123456');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Wait for success message
    await expect(page.locator('text=Login successful')).toBeVisible();
    
    // Should redirect to admin dashboard
    await page.waitForURL('**/admin', { timeout: 10000 });
    expect(page.url()).toContain('/admin');
    
    // Verify admin dashboard elements are now visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Bookings')).toBeVisible();
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    // First login
    await page.goto('http://localhost:3009/login');
    await page.locator('button:has-text("Fill Form")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin');
    
    // Now try to access login page again
    await page.goto('http://localhost:3009/login');
    
    // Should be redirected back to admin
    await page.waitForURL('**/admin');
    expect(page.url()).toContain('/admin');
  });

  test('should handle login errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3009/login');
    
    // Fill in invalid credentials
    await page.locator('input[type="email"]').fill('invalid@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Should show error message
    await expect(page.locator('text=Invalid login credentials')).toBeVisible();
    
    // Should remain on login page
    expect(page.url()).toContain('/login');
  });

  test('should handle logout and redirect to login', async ({ page }) => {
    // First login
    await page.goto('http://localhost:3009/login');
    await page.locator('button:has-text("Fill Form")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin');
    
    // Find and click logout button
    await page.locator('button:has-text("Logout")').click();
    
    // Should redirect to login page
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
    
    // Verify we're back to clean login page
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should protect booking modal and load data after authentication', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3009/login');
    await page.locator('button:has-text("Fill Form")').click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin');
    
    // Navigate to bookings
    await page.locator('text=Bookings').click();
    await page.waitForURL('**/admin/bookings');
    
    // Click +New booking button
    await page.locator('button:has-text("+New booking"), button:has-text("New Booking")').first().click();
    
    // Verify modal opens and loads data without errors
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Create New Booking')).toBeVisible();
    
    // Wait for data to load and verify no error messages
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Failed to load surf camps')).not.toBeVisible();
    await expect(page.locator('text=Failed to load add-ons')).not.toBeVisible();
    
    // Verify data sections are present
    await expect(page.locator('text=Beginner Surf Week')).toBeVisible();
    await expect(page.locator('text=Surfboard Rental')).toBeVisible();
  });

  test('should prevent flash of admin content during authentication check', async ({ page }) => {
    // Monitor for any admin content appearing before redirect
    let adminContentSeen = false;
    
    page.on('response', response => {
      if (response.url().includes('/admin') && !response.url().includes('/login')) {
        adminContentSeen = true;
      }
    });
    
    // Try to access admin route
    await page.goto('http://localhost:3009/admin');
    
    // Should redirect to login quickly without showing admin content
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // Verify we didn't see admin content flash
    expect(adminContentSeen).toBe(false);
    
    // Verify clean login page
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });
});
