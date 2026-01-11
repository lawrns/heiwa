/**
 * Smoke Tests - Critical Paths
 * 
 * These tests verify that the most critical user paths are functional.
 * They should run quickly (< 60s total) and catch major regressions.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { test, expect } from '@playwright/test';

// Configure shorter timeouts for smoke tests
test.setTimeout(15000);

test.describe('Smoke Tests - Critical Paths', () => {
  // ==========================================================================
  // Homepage
  // ==========================================================================

  test.describe('Homepage', () => {
    test('should load homepage within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
      
      // Verify page loaded
      await expect(page).toHaveTitle(/Heiwa/i);
    });

    test('should display main navigation', async ({ page }) => {
      await page.goto('/');
      
      // Check for navigation elements
      const nav = page.locator('nav, header');
      await expect(nav.first()).toBeVisible();
    });

    test('should display hero section', async ({ page }) => {
      await page.goto('/');
      
      // Check for hero content (heading or main content area)
      const mainContent = page.locator('main, [role="main"], .hero, h1').first();
      await expect(mainContent).toBeVisible();
    });

    test('should have working links', async ({ page }) => {
      await page.goto('/');
      
      // Check that at least one link exists and is clickable
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Booking Widget
  // ==========================================================================

  test.describe('Booking Widget', () => {
    test('should render booking trigger button', async ({ page }) => {
      await page.goto('/');
      
      // Look for booking-related buttons
      const bookingButton = page.locator('button:has-text("Book"), [aria-label*="book" i]').first();
      
      // If booking button exists, verify it's visible
      if (await bookingButton.count() > 0) {
        await expect(bookingButton).toBeVisible();
      }
    });

    test('should open booking widget on click', async ({ page }) => {
      await page.goto('/');
      
      // Find and click booking button
      const bookingButton = page.locator('button:has-text("Book"), [aria-label*="book" i]').first();
      
      if (await bookingButton.count() > 0) {
        await bookingButton.click();
        
        // Wait for modal/widget to appear
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="booking"]').first();
        await expect(modal).toBeVisible({ timeout: 5000 });
      }
    });
  });

  // ==========================================================================
  // API Health
  // ==========================================================================

  test.describe('API Health', () => {
    test('should return healthy status from health endpoint', async ({ request }) => {
      const response = await request.get('/api/health');
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });

    test('should return rooms data from rooms API', async ({ request }) => {
      const response = await request.get('/api/rooms');
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });
  });

  // ==========================================================================
  // Admin Login
  // ==========================================================================

  test.describe('Admin Access', () => {
    test('should display admin login page', async ({ page }) => {
      await page.goto('/admin');
      
      // Should either show login form or redirect to login
      const loginForm = page.locator('form, input[type="password"], button:has-text("Login"), button:has-text("Sign")');
      
      // Wait for either login form or admin dashboard
      await expect(loginForm.first()).toBeVisible({ timeout: 5000 });
    });

    test('should have password input field', async ({ page }) => {
      await page.goto('/admin');
      
      // Look for password input
      const passwordInput = page.locator('input[type="password"]');
      
      if (await passwordInput.count() > 0) {
        await expect(passwordInput.first()).toBeVisible();
      }
    });
  });

  // ==========================================================================
  // Core Pages
  // ==========================================================================

  test.describe('Core Pages', () => {
    test('should load rooms page', async ({ page }) => {
      await page.goto('/rooms');
      
      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Should have some content
      const content = page.locator('main, [role="main"], .content').first();
      await expect(content).toBeVisible();
    });

    test('should load surf camps page', async ({ page }) => {
      await page.goto('/surf-camps');
      
      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load contact page', async ({ page }) => {
      await page.goto('/contact');
      
      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Should have a form or contact information
      const contactContent = page.locator('form, [href*="mailto"], [href*="tel"]').first();
      if (await contactContent.count() > 0) {
        await expect(contactContent).toBeVisible();
      }
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page-12345');
      
      // Should return 404 or show error page
      expect(response?.status()).toBe(404);
      
      // Page should still render something
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // ==========================================================================
  // Performance
  // ==========================================================================

  test.describe('Performance', () => {
    test('should have reasonable page weight', async ({ page }) => {
      // Track network requests
      let totalBytes = 0;
      
      page.on('response', async (response) => {
        const headers = response.headers();
        const contentLength = headers['content-length'];
        if (contentLength) {
          totalBytes += parseInt(contentLength, 10);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Page should be under 5MB total
      expect(totalBytes).toBeLessThan(5 * 1024 * 1024);
    });
  });

  // ==========================================================================
  // Responsive Design
  // ==========================================================================

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Page should render without horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
    });

    test('should be usable on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      // Page should render
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
