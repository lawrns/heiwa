/**
 * Visual Regression Tests
 * Feature: comprehensive-testing
 * 
 * Tests for visual consistency across different viewport sizes
 */

import { test, expect } from '@playwright/test';

// Viewport configurations
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

test.describe('Visual Regression Tests', () => {
  test.describe('Homepage', () => {
    test('should match homepage snapshot on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for any animations to complete
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        maxDiffPixelRatio: 0.001, // 0.1% threshold
        fullPage: true,
      });
    });

    test('should match homepage snapshot on tablet', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        maxDiffPixelRatio: 0.001,
        fullPage: true,
      });
    });

    test('should match homepage snapshot on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        maxDiffPixelRatio: 0.001,
        fullPage: true,
      });
    });
  });

  test.describe('Booking Widget', () => {
    test('should match booking widget initial state', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find and scroll to booking widget
      const bookingWidget = page.locator('[data-testid="booking-widget"]').first();
      if (await bookingWidget.isVisible()) {
        await bookingWidget.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        await expect(bookingWidget).toHaveScreenshot('booking-widget-initial.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });

    test('should match booking widget on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bookingWidget = page.locator('[data-testid="booking-widget"]').first();
      if (await bookingWidget.isVisible()) {
        await bookingWidget.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        await expect(bookingWidget).toHaveScreenshot('booking-widget-mobile.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });
  });

  test.describe('Navigation', () => {
    test('should match navigation on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav').first();
      await expect(nav).toHaveScreenshot('navigation-desktop.png', {
        maxDiffPixelRatio: 0.001,
      });
    });

    test('should match navigation on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav').first();
      await expect(nav).toHaveScreenshot('navigation-mobile.png', {
        maxDiffPixelRatio: 0.001,
      });
    });
  });

  test.describe('Rooms Page', () => {
    test('should match rooms page on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('rooms-desktop.png', {
        maxDiffPixelRatio: 0.001,
        fullPage: true,
      });
    });

    test('should match rooms page on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('rooms-mobile.png', {
        maxDiffPixelRatio: 0.001,
        fullPage: true,
      });
    });
  });

  test.describe('Surf Weeks Page', () => {
    test('should match surf weeks page on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/surf-weeks');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('surf-weeks-desktop.png', {
        maxDiffPixelRatio: 0.001,
        fullPage: true,
      });
    });

    test('should match surf weeks page on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/surf-weeks');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('surf-weeks-mobile.png', {
        maxDiffPixelRatio: 0.001,
        fullPage: true,
      });
    });
  });

  test.describe('Button States', () => {
    test('should match button hover state', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.hover();
        await page.waitForTimeout(200);
        
        await expect(button).toHaveScreenshot('button-hover.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });

    test('should match button focus state', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.focus();
        await page.waitForTimeout(200);
        
        await expect(button).toHaveScreenshot('button-focus.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });
  });

  test.describe('Form Elements', () => {
    test('should match input focus state', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const input = page.locator('input[type="text"], input[type="email"]').first();
      if (await input.isVisible()) {
        await input.focus();
        await page.waitForTimeout(200);
        
        await expect(input).toHaveScreenshot('input-focus.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });
  });

  test.describe('Footer', () => {
    test('should match footer on desktop', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const footer = page.locator('footer').first();
      if (await footer.isVisible()) {
        await footer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        await expect(footer).toHaveScreenshot('footer-desktop.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });

    test('should match footer on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const footer = page.locator('footer').first();
      if (await footer.isVisible()) {
        await footer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        
        await expect(footer).toHaveScreenshot('footer-mobile.png', {
          maxDiffPixelRatio: 0.001,
        });
      }
    });
  });

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'xs', width: 320 },
      { name: 'sm', width: 640 },
      { name: 'md', width: 768 },
      { name: 'lg', width: 1024 },
      { name: 'xl', width: 1280 },
      { name: '2xl', width: 1536 },
    ];

    for (const bp of breakpoints) {
      test(`should render correctly at ${bp.name} (${bp.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: 800 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`homepage-${bp.name}.png`, {
          maxDiffPixelRatio: 0.001,
          fullPage: true,
        });
      });
    }
  });
});
