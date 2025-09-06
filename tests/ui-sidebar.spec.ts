import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Mock authentication
  await page.addInitScript(() => {
    (window as any).__currentUser = {
      id: 'admin_123',
      email: 'admin@heiwa.house',
      role: 'admin'
    };
  });
});

test.describe('Sidebar UI Functionality (UI-001)', () => {
  test('should display expand icon when sidebar is collapsed', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Collapse sidebar
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await toggleButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify expand icon is visible
    await expect(toggleButton).toBeVisible();
    
    // Verify sidebar is collapsed (check width or class)
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(sidebarWidth).toBeLessThan(200); // Collapsed width should be smaller
  });

  test('should expand sidebar when expand icon is clicked', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    
    // Collapse first
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Then expand
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Verify sidebar is expanded
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(sidebarWidth).toBeGreaterThan(200); // Expanded width should be larger
  });

  test('should persist sidebar state across page navigation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Collapse sidebar
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Navigate to another page
    await page.locator('[data-testid="sidebar-nav-bookings"]').click();
    await page.waitForLoadState('networkidle');

    // Verify sidebar remains collapsed
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(sidebarWidth).toBeLessThan(200);
  });

  test('should prevent UI overlaps during sidebar transitions', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    const mainContent = page.locator('main');

    // Get initial positions
    const initialMainLeft = await mainContent.evaluate(el => el.getBoundingClientRect().left);

    // Toggle sidebar
    await toggleButton.click();
    await page.waitForTimeout(600); // Wait for full animation

    // Verify main content adjusted position
    const newMainLeft = await mainContent.evaluate(el => el.getBoundingClientRect().left);
    expect(Math.abs(newMainLeft - initialMainLeft)).toBeGreaterThan(50); // Should have moved

    // Verify no overlapping elements
    const overlappingElements = await page.evaluate(() => {
      const sidebar = document.querySelector('[data-testid="sidebar-nav"]');
      const main = document.querySelector('main');
      
      if (!sidebar || !main) return false;
      
      const sidebarRect = sidebar.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      
      // Check if elements overlap
      return !(sidebarRect.right <= mainRect.left || 
               sidebarRect.left >= mainRect.right || 
               sidebarRect.bottom <= mainRect.top || 
               sidebarRect.top >= mainRect.bottom);
    });

    expect(overlappingElements).toBeFalsy();
  });

  test('should show tooltips when sidebar is collapsed', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Collapse sidebar
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Hover over a navigation item
    const navItem = page.locator('[data-testid="sidebar-nav-bookings"]');
    await navItem.hover();
    await page.waitForTimeout(300);

    // Check if tooltip appears (title attribute or tooltip element)
    const hasTooltip = await navItem.getAttribute('title');
    expect(hasTooltip).toBeTruthy();
  });

  test('should handle mobile sidebar behavior', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // On mobile, sidebar should be hidden by default
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const isVisible = await sidebar.isVisible();
    
    // Mobile sidebar behavior may vary - check if it's overlay or hidden
    if (!isVisible) {
      // Test mobile menu button
      const mobileMenuButton = page.locator('[data-testid="sidebar-open-button"]');
      await expect(mobileMenuButton).toBeVisible();
      
      // Open mobile sidebar
      await mobileMenuButton.click();
      await page.waitForTimeout(300);
      
      // Sidebar should now be visible
      await expect(sidebar).toBeVisible();
      
      // Close mobile sidebar
      const closeButton = page.locator('[data-testid="sidebar-close-button"]');
      await closeButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should maintain accessibility during sidebar operations', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check ARIA attributes
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const ariaLabel = await sidebar.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Check keyboard navigation
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await toggleButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify sidebar toggled via keyboard
    const sidebarWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(sidebarWidth).toBeLessThan(200);

    // Test tab navigation through sidebar items
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toContain('sidebar-nav-');
  });

  test('should take visual regression screenshots', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Screenshot of expanded sidebar
    await expect(page.locator('body')).toHaveScreenshot('sidebar-expanded.png');

    // Collapse sidebar
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await toggleButton.click();
    await page.waitForTimeout(600);

    // Screenshot of collapsed sidebar
    await expect(page.locator('body')).toHaveScreenshot('sidebar-collapsed.png');

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('body')).toHaveScreenshot('sidebar-mobile.png');
  });

  test('should handle rapid toggle clicks without breaking', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');

    // Rapidly click toggle button multiple times
    for (let i = 0; i < 5; i++) {
      await toggleButton.click();
      await page.waitForTimeout(100); // Short delay between clicks
    }

    // Wait for animations to settle
    await page.waitForTimeout(1000);

    // Verify sidebar is still functional
    await expect(toggleButton).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();
  });

  test('should maintain proper z-index layering', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check z-index values to ensure proper layering
    const zIndexValues = await page.evaluate(() => {
      const sidebar = document.querySelector('[data-testid="sidebar-nav"]');
      const main = document.querySelector('main');
      const header = document.querySelector('header');

      return {
        sidebar: sidebar ? window.getComputedStyle(sidebar).zIndex : 'auto',
        main: main ? window.getComputedStyle(main).zIndex : 'auto',
        header: header ? window.getComputedStyle(header).zIndex : 'auto'
      };
    });

    // Verify sidebar has appropriate z-index (should be higher than main content)
    expect(zIndexValues.sidebar).not.toBe('auto');
  });
});
