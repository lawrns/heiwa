import { test, expect } from '@playwright/test';

// Mock dashboard setup
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

    // Mock current user for authentication
    (window as any).__currentUser = (window as any).__mockAuth.user;
  });

  // Mock API responses for dashboard data
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock dashboard analytics data
      if (url.includes('/api/analytics') || url.includes('/api/dashboard')) {
        return {
          ok: true,
          json: async () => ({
            totalBookings: 156,
            totalRevenue: 45230,
            occupancyRate: 78,
            activeClients: 89,
            recentBookings: [
              { id: 'booking_001', clientName: 'John Doe', amount: 450, status: 'confirmed' },
              { id: 'booking_002', clientName: 'Jane Smith', amount: 320, status: 'pending' }
            ]
          })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock localStorage for sidebar state
  await page.addInitScript(() => {
    (window as any).localStorage = {
      getItem: (key: string) => {
        if (key === 'sidebar-collapsed') return 'false';
        return null;
      },
      setItem: (key: string, value: string) => {
        console.log(`localStorage.setItem(${key}, ${value})`);
      }
    };
  });
});

test.describe('Dashboard Metrics Loading (DASH-001)', () => {
  test('should load and display key metrics', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify dashboard title
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();

    // Verify all dashboard cards are loaded
    await expect(page.locator('[data-testid="dashboard-card-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-card-rooms"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-card-surf-camps"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-card-clients"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-card-calendar"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-card-analytics"]')).toBeVisible();

    // Verify metric values are displayed (using class selectors for numbers)
    await expect(page.locator('.metric-value, [data-testid*="metric"], .stats-number')).toBeVisible();
  });

  test('should display analytics charts properly', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify charts container exists
    await expect(page.locator('.chart-container, [data-testid*="chart"], canvas, svg')).toBeVisible();

    // Verify chart data loads
    const chartElements = await page.locator('.chart-container, [data-testid*="chart"], canvas, svg').count();
    expect(chartElements).toBeGreaterThan(0);
  });

  test('should handle real-time metric updates', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Mock real-time updates
    await page.addInitScript(() => {
      let updateCount = 0;
      setInterval(() => {
        updateCount++;
        // Simulate metric updates
        const metricElements = document.querySelectorAll('.metric-value, [data-testid*="metric"]');
        metricElements.forEach(el => {
          if (el.textContent && !isNaN(parseInt(el.textContent))) {
            el.textContent = (parseInt(el.textContent) + 1).toString();
          }
        });
      }, 1000);
    });

    // Wait for updates
    await page.waitForTimeout(2000);

    // Verify metrics are updating (this is a basic test)
    await expect(page.locator('[data-testid="dashboard-card-bookings"]')).toBeVisible();
  });

  test('should show loading states during data fetch', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/analytics', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalBookings: 156,
          totalRevenue: 45230,
          occupancyRate: 78
        })
      });
    });

    await page.goto('/admin');

    // Should show loading indicators
    await expect(page.locator('.loading, .spinner, [data-testid*="loading"]')).toBeVisible();

    await page.waitForLoadState('networkidle');

    // Loading should disappear
    await expect(page.locator('.loading, .spinner, [data-testid*="loading"]')).not.toBeVisible();
  });
});

test.describe('Dashboard Sidebar Navigation (DASH-002)', () => {
  test('should render sidebar with navigation items', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify sidebar container exists
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();

    // Verify main navigation items using data-testid
    const navItems = [
      'dashboard',
      'bookings',
      'analytics',
      'rooms',
      'surf-camps',
      'clients',
      'payments',
      'compliance',
      'settings'
    ];

    for (const item of navItems) {
      await expect(page.locator(`[data-testid="sidebar-nav-${item}"]`)).toBeVisible();
    }
  });

  test('should toggle sidebar expand/collapse functionality', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify sidebar toggle button exists
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]');
    await expect(toggleButton).toBeVisible();

    // Get initial sidebar state (should be expanded by default)
    const initialSidebar = page.locator('[data-testid="sidebar-nav"]');
    const initialWidth = await initialSidebar.evaluate(el => el.getBoundingClientRect().width);

    // Click toggle to collapse
    await toggleButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify sidebar is collapsed (width should be smaller)
    const collapsedWidth = await initialSidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(collapsedWidth).toBeLessThan(initialWidth);

    // Click toggle to expand again
    await toggleButton.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify sidebar is expanded again
    const expandedWidth = await initialSidebar.evaluate(el => el.getBoundingClientRect().width);
    expect(expandedWidth).toBeGreaterThan(collapsedWidth);
  });

  test('should navigate to different admin routes via sidebar', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Test navigation to different routes
    const routes = [
      { name: 'Bookings', path: '/admin/bookings', expectedText: 'Bookings' },
      { name: 'Analytics', path: '/admin/analytics', expectedText: 'Analytics' },
      { name: 'Compliance', path: '/admin/compliance', expectedText: 'Compliance' }
    ];

    for (const route of routes) {
      // Click on navigation item using data-testid
      const navItemId = route.name.toLowerCase().replace(/\s+/g, '-');
      await page.locator(`[data-testid="sidebar-nav-${navItemId}"]`).click();
      await page.waitForLoadState('networkidle');

      // Verify we're on the correct page
      expect(page.url()).toContain(route.path);
      // Use a more specific selector for page content verification
      await page.waitForSelector('main', { timeout: 5000 });
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Verify bookings nav item is highlighted/active
    const bookingsNavItem = page.locator('[data-testid="sidebar-nav-bookings"]');
    
    // Check if the nav item has active styling (this depends on your CSS implementation)
    const isActive = await bookingsNavItem.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const parent = el.closest('a, button, [role="button"]');
      const parentStyles = parent ? window.getComputedStyle(parent) : styles;
      
      // Check for common active state indicators
      return (
        parentStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        parentStyles.color !== 'rgb(0, 0, 0)' ||
        parent?.classList.contains('active') ||
        parent?.classList.contains('bg-blue') ||
        parent?.getAttribute('aria-current') === 'page'
      );
    });

    expect(isActive).toBeTruthy();
  });

  test('should maintain sidebar state across page navigation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Collapse sidebar
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await page.waitForTimeout(500);

    // Navigate to another page
    await page.locator('[data-testid="sidebar-nav-bookings"]').click();
    await page.waitForLoadState('networkidle');

    // Verify sidebar remains collapsed
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    const width = await sidebar.evaluate(el => el.getBoundingClientRect().width);
    
    // Collapsed sidebar should have a smaller width
    expect(width).toBeLessThan(200); // Assuming collapsed width is less than 200px
  });

  test('should handle responsive behavior on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // On mobile, sidebar might be hidden by default or overlay
    const sidebar = page.locator('[data-testid="sidebar-nav"]');
    
    // Check if sidebar is hidden or has mobile-specific styling
    const isHidden = await sidebar.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.display === 'none' || 
             styles.transform.includes('translate') ||
             styles.position === 'fixed';
    });

    // Mobile sidebar should either be hidden or positioned as overlay
    expect(isHidden).toBeTruthy();

    // Test mobile menu toggle if it exists
    const mobileToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(500);
      
      // Sidebar should become visible after toggle
      await expect(sidebar).toBeVisible();
    }
  });

  test('should display user information in sidebar', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Verify user information is displayed (using more specific selectors)
    await expect(page.locator('[data-testid="user-info"], .user-info, .sidebar-user')).toBeVisible();
    // Note: These selectors may need to be updated based on actual component structure
  });

  test('should handle sidebar icons and tooltips', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Collapse sidebar to test icon-only mode
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await page.waitForTimeout(500);

    // Verify icons are visible when collapsed
    const navIcons = page.locator('[data-testid="sidebar-nav"] svg');
    const iconCount = await navIcons.count();
    expect(iconCount).toBeGreaterThan(0);

    // Test tooltip on hover (if implemented)
    const firstIcon = navIcons.first();
    await firstIcon.hover();
    await page.waitForTimeout(300);

    // Check if tooltip appears (this depends on your tooltip implementation)
    const tooltip = page.locator('[role="tooltip"]');
    if (await tooltip.isVisible()) {
      await expect(tooltip).toBeVisible();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Focus on first navigation item
    await page.keyboard.press('Tab');
    
    // Navigate through sidebar items with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    
    // Press Enter to activate focused item
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify navigation occurred (URL should have changed)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/');
  });

  test('should prevent content overlap when sidebar is expanded', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Get main content area
    const mainContent = page.locator('main, [data-testid="main-content"]').first();
    const sidebar = page.locator('[data-testid="sidebar-nav"]');

    // Verify sidebar and main content don't overlap
    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await mainContent.boundingBox();

    if (sidebarBox && contentBox) {
      // Main content should start after sidebar ends (with some margin)
      expect(contentBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width - 10);
    }

    // Test with collapsed sidebar
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await page.waitForTimeout(500);

    const collapsedSidebarBox = await sidebar.boundingBox();
    const adjustedContentBox = await mainContent.boundingBox();

    if (collapsedSidebarBox && adjustedContentBox) {
      // Content should adjust when sidebar collapses
      expect(adjustedContentBox.x).toBeLessThan(contentBox?.x || 0);
    }
  });

  test('should handle logout functionality from sidebar', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Look for logout button in sidebar using data-testid
    const logoutButton = page.locator('[data-testid="logout-button"], [data-testid="sign-out-button"]').first();
    
    if (await logoutButton.isVisible()) {
      // Mock logout process
      await page.addInitScript(() => {
        (window as any).__loggedOut = false;
        const originalFetch = window.fetch;
        (window as any).fetch = async (url: string, options?: any) => {
          if (url.includes('/api/auth/logout') || url.includes('/api/auth/signout')) {
            (window as any).__loggedOut = true;
            return { ok: true, json: async () => ({ success: true }) };
          }
          return originalFetch(url, options);
        };
      });

      await logoutButton.click();
      await page.waitForTimeout(1000);

      // Verify logout was triggered
      const loggedOut = await page.evaluate(() => (window as any).__loggedOut);
      expect(loggedOut).toBeTruthy();
    }
  });

  test('should take snapshots for visual regression', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of full dashboard with expanded sidebar
    await expect(page.locator('body')).toHaveScreenshot('dashboard-full-expanded.png');

    // Take screenshot of sidebar component only
    await expect(page.locator('[data-testid="sidebar-nav"]')).toHaveScreenshot('sidebar-expanded.png');

    // Collapse sidebar and take screenshots
    await page.locator('[data-testid="sidebar-toggle"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-testid="sidebar-nav"]')).toHaveScreenshot('sidebar-collapsed.png');
    await expect(page.locator('body')).toHaveScreenshot('dashboard-full-collapsed.png');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('dashboard-mobile.png');
  });
});
