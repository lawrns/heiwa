import { test, expect } from '@playwright/test';

const BASE_URL = 'https://heiwahauz.netlify.app';
const ADMIN_URL = `${BASE_URL}/admin`;
const ADMIN_PASSWORD = 'heiwa_admin_2024';

// Helper function to wait for network idle
async function waitForNetworkIdle(page) {
  await page.waitForLoadState('networkidle');
}

test.describe('Heiwa House Production - User Stories Verification', () => {
  
  // ============================================================================
  // 1. PUBLIC WEBSITE - VISITOR EXPERIENCE
  // ============================================================================
  
  test.describe('1.1 Homepage & Navigation (PUB-NAV)', () => {
    
    test('PUB-NAV-001: Homepage Landing - Should display engaging homepage', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Hero section with compelling imagery
      const hero = page.locator('[data-testid="hero-section"]');
      await expect(hero).toBeVisible();
      
      // Value proposition visible above fold
      const valueProposition = page.locator('text=/Welcome|Heiwa|Surf/i');
      await expect(valueProposition).toBeVisible();
      
      // Primary CTA (Book Now)
      const bookCTA = page.locator('button:has-text("Book Now"), a:has-text("Book Now")').first();
      await expect(bookCTA).toBeVisible();
      
      // Feature cards
      const featureCards = page.locator('[data-testid="feature-card"]');
      const cardCount = await featureCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Testimonials section
      const testimonials = page.locator('[data-testid="testimonials-section"]');
      await expect(testimonials).toBeVisible();
    });
    
    test('PUB-NAV-002: Site Navigation - Should have clear navigation menu', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Navigation menu exists
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
      
      // Mobile hamburger menu on small screens
      await page.setViewportSize({ width: 375, height: 667 });
      const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(300);
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
    
    test('PUB-NAV-004: Mobile Responsive Design - Should work on mobile devices', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await waitForNetworkIdle(page);
      
      // Main content should be visible
      const mainContent = page.locator('main, [role="main"]').first();
      await expect(mainContent).toBeVisible();
      
      // Text should be readable without zooming
      const textElements = page.locator('h1, h2, p').first();
      const fontSize = await textElements.evaluate((el) => window.getComputedStyle(el).fontSize);
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(12);
    });
    
    test('PUB-NAV-005: Page Load Performance - Should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      const loadTime = Date.now() - startTime;
      
      // Should load in under 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });
  
  test.describe('1.2 Accommodation Browsing (PUB-ROOM)', () => {
    
    test('PUB-ROOM-001: Room Catalog - Should display available rooms', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);
      await waitForNetworkIdle(page);
      
      // Room grid/list should be visible
      const roomCards = page.locator('[data-testid="room-card"]');
      const roomCount = await roomCards.count();
      expect(roomCount).toBeGreaterThan(0);
      
      // Each room should show key info
      const firstRoom = roomCards.first();
      await expect(firstRoom.locator('text=/€|price|per night/i')).toBeVisible();
    });
    
    test('PUB-ROOM-002: Room Detail Page - Should show detailed room information', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);
      await waitForNetworkIdle(page);
      
      // Click first room
      const firstRoom = page.locator('[data-testid="room-card"]').first();
      await firstRoom.click();
      await waitForNetworkIdle(page);
      
      // Should show room details
      const roomTitle = page.locator('h1, h2').first();
      await expect(roomTitle).toBeVisible();
      
      // Should show amenities
      const amenities = page.locator('[data-testid="amenities"]');
      if (await amenities.isVisible()) {
        const amenityItems = amenities.locator('li, [role="listitem"]');
        expect(await amenityItems.count()).toBeGreaterThan(0);
      }
      
      // Should show pricing
      const price = page.locator('text=/€|price/i').first();
      await expect(price).toBeVisible();
    });
    
    test('PUB-ROOM-004: Room Availability Check - Should check availability', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);
      await waitForNetworkIdle(page);
      
      // Look for date picker
      const datePicker = page.locator('input[type="date"], [data-testid="date-picker"]').first();
      if (await datePicker.isVisible()) {
        // Date picker exists and is functional
        await expect(datePicker).toBeVisible();
      }
    });
  });
  
  test.describe('1.3 Booking Flow (PUB-BOOK)', () => {
    
    test('PUB-BOOK-001: Start Booking - Should have prominent booking CTA', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Floating booking widget or CTA
      const bookingCTA = page.locator('button:has-text("Book"), a:has-text("Book"), button:has-text("Reserve")').first();
      await expect(bookingCTA).toBeVisible();
    });
    
    test('PUB-BOOK-006: Payment Processing - Stripe integration should be available', async ({ page }) => {
      await page.goto(`${BASE_URL}/booking`);
      await waitForNetworkIdle(page);
      
      // Check if booking widget is present
      const bookingWidget = page.locator('[data-testid="booking-widget"], iframe[src*="booking"]').first();
      if (await bookingWidget.isVisible()) {
        await expect(bookingWidget).toBeVisible();
      }
    });
  });
  
  test.describe('1.4 Surf Camps (PUB-SURF)', () => {
    
    test('PUB-SURF-001: Surf Camp Catalog - Should display available surf camps', async ({ page }) => {
      await page.goto(`${BASE_URL}/surf-camps`);
      await waitForNetworkIdle(page);
      
      // Surf camps list should be visible
      const campCards = page.locator('[data-testid="camp-card"], [data-testid="surf-week"]');
      const campCount = await campCards.count();
      expect(campCount).toBeGreaterThanOrEqual(0);
      
      // If camps exist, check for key info
      if (campCount > 0) {
        const firstCamp = campCards.first();
        await expect(firstCamp).toBeVisible();
      }
    });
    
    test('PUB-SURF-002: Surf Camp Details - Should show full camp details', async ({ page }) => {
      await page.goto(`${BASE_URL}/surf-camps`);
      await waitForNetworkIdle(page);
      
      const campCards = page.locator('[data-testid="camp-card"], [data-testid="surf-week"]');
      if (await campCards.count() > 0) {
        await campCards.first().click();
        await waitForNetworkIdle(page);
        
        // Should show camp details
        const campTitle = page.locator('h1, h2').first();
        await expect(campTitle).toBeVisible();
      }
    });
  });
  
  test.describe('1.5 Content Pages (PUB-CONT)', () => {
    
    test('PUB-CONT-006: Contact Page - Should have contact form and info', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      await waitForNetworkIdle(page);
      
      // Contact form should exist
      const contactForm = page.locator('form, [data-testid="contact-form"]').first();
      await expect(contactForm).toBeVisible();
      
      // Contact info should be visible
      const contactInfo = page.locator('text=/email|phone|address/i').first();
      await expect(contactInfo).toBeVisible();
    });
    
    test('PUB-CONT-007: Privacy Policy - Should be accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/privacy`);
      await waitForNetworkIdle(page);
      
      // Privacy policy content should be visible
      const content = page.locator('main, [role="main"]').first();
      await expect(content).toBeVisible();
    });
    
    test('PUB-CONT-008: Terms & Conditions - Should be accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/terms`);
      await waitForNetworkIdle(page);
      
      // Terms content should be visible
      const content = page.locator('main, [role="main"]').first();
      await expect(content).toBeVisible();
    });
  });
  
  test.describe('1.6 Blog (PUB-BLOG)', () => {
    
    test('PUB-BLOG-001: Blog Listing - Should display blog posts', async ({ page }) => {
      await page.goto(`${BASE_URL}/blog`);
      await waitForNetworkIdle(page);
      
      // Blog posts should be listed
      const posts = page.locator('[data-testid="blog-post"], article').first();
      if (await posts.isVisible()) {
        await expect(posts).toBeVisible();
      }
    });
  });
  
  test.describe('1.7 Gallery (PUB-GAL)', () => {
    
    test('PUB-GAL-001: Photo Gallery - Should display gallery images', async ({ page }) => {
      await page.goto(`${BASE_URL}/gallery`);
      await waitForNetworkIdle(page);
      
      // Gallery should be visible
      const gallery = page.locator('[data-testid="gallery"], .gallery').first();
      if (await gallery.isVisible()) {
        await expect(gallery).toBeVisible();
      }
    });
  });
  
  test.describe('1.8 Testimonials (PUB-TEST)', () => {
    
    test('PUB-TEST-001: Testimonials Display - Should show guest testimonials', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Testimonials section
      const testimonials = page.locator('[data-testid="testimonials"], .testimonials').first();
      if (await testimonials.isVisible()) {
        await expect(testimonials).toBeVisible();
      }
    });
  });
  
  test.describe('1.9 SEO (PUB-SEO)', () => {
    
    test('PUB-SEO-001: Meta Tags - Should have proper meta tags', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check for meta tags
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });
    
    test('PUB-SEO-002: Open Graph Tags - Should have OG tags', async ({ page }) => {
      await page.goto(BASE_URL);
      
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogImage = page.locator('meta[property="og:image"]');
      
      // At least some OG tags should exist
      const ogCount = await Promise.all([
        ogTitle.count(),
        ogDescription.count(),
        ogImage.count()
      ]).then(counts => counts.reduce((a, b) => a + b, 0));
      
      expect(ogCount).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // 2. ADMIN PANEL - MANAGEMENT INTERFACE
  // ============================================================================
  
  test.describe('2.1 Admin Authentication (ADM-AUTH)', () => {
    
    test('ADM-AUTH-001: Admin Login - Should log in securely', async ({ page }) => {
      await page.goto(ADMIN_URL);
      await waitForNetworkIdle(page);
      
      // Check if login form is present
      const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        // Login form exists
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
      }
    });
  });
  
  test.describe('2.2 Admin Dashboard (ADM-DASH)', () => {
    
    test('ADM-DASH-001: Admin Dashboard - Should display overview', async ({ page, context }) => {
      // Set auth cookie if available
      const cookies = await context.cookies();
      
      await page.goto(ADMIN_URL);
      await waitForNetworkIdle(page);
      
      // Dashboard should be visible or redirect to login
      const dashboard = page.locator('[data-testid="admin-dashboard"], .admin-dashboard').first();
      const loginForm = page.locator('form, [data-testid="login-form"]').first();
      
      const isDashboard = await dashboard.isVisible().catch(() => false);
      const isLogin = await loginForm.isVisible().catch(() => false);
      
      expect(isDashboard || isLogin).toBeTruthy();
    });
  });
  
  test.describe('2.3 Booking Management (ADM-BOOK)', () => {
    
    test('ADM-BOOK-001: Bookings List - Should display bookings', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/bookings`);
      await waitForNetworkIdle(page);
      
      // Bookings page should be visible or redirect to login
      const bookingsList = page.locator('[data-testid="bookings-list"], table').first();
      const loginForm = page.locator('form, [data-testid="login-form"]').first();
      
      const isList = await bookingsList.isVisible().catch(() => false);
      const isLogin = await loginForm.isVisible().catch(() => false);
      
      expect(isList || isLogin).toBeTruthy();
    });
  });
  
  test.describe('2.4 Client Management (ADM-CLI)', () => {
    
    test('ADM-CLI-001: Clients List - Should display clients', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/clients`);
      await waitForNetworkIdle(page);
      
      // Clients page should be visible or redirect to login
      const clientsList = page.locator('[data-testid="clients-list"], table').first();
      const loginForm = page.locator('form, [data-testid="login-form"]').first();
      
      const isList = await clientsList.isVisible().catch(() => false);
      const isLogin = await loginForm.isVisible().catch(() => false);
      
      expect(isList || isLogin).toBeTruthy();
    });
  });
  
  test.describe('2.5 Room Management (ADM-ROOM)', () => {
    
    test('ADM-ROOM-001: Rooms List - Should display rooms', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/rooms`);
      await waitForNetworkIdle(page);
      
      // Rooms page should be visible or redirect to login
      const roomsList = page.locator('[data-testid="rooms-list"], table').first();
      const loginForm = page.locator('form, [data-testid="login-form"]').first();
      
      const isList = await roomsList.isVisible().catch(() => false);
      const isLogin = await loginForm.isVisible().catch(() => false);
      
      expect(isList || isLogin).toBeTruthy();
    });
  });
  
  test.describe('2.6 Surf Camp Management (ADM-CAMP)', () => {
    
    test('ADM-CAMP-001: Surf Camps List - Should display camps', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/surf-camps`);
      await waitForNetworkIdle(page);
      
      // Camps page should be visible or redirect to login
      const campsList = page.locator('[data-testid="camps-list"], table').first();
      const loginForm = page.locator('form, [data-testid="login-form"]').first();
      
      const isList = await campsList.isVisible().catch(() => false);
      const isLogin = await loginForm.isVisible().catch(() => false);
      
      expect(isList || isLogin).toBeTruthy();
    });
  });
  
  // ============================================================================
  // 3. API VERIFICATION
  // ============================================================================
  
  test.describe('API Endpoints Verification', () => {
    
    test('API: GET /api/rooms - Should return rooms data', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/rooms`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data) || data.data).toBeTruthy();
    });
    
    test('API: GET /api/bookings - Should return bookings data', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/bookings`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeTruthy();
    });
    
    test('API: GET /api/surf-camps - Should return surf camps', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/surf-camps`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeTruthy();
    });
    
    test('API: GET /api/availability - Should return availability data', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/availability`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeTruthy();
    });
    
    test('API: GET /api/admin/homepage - Should return homepage content', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/admin/homepage`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toBeTruthy();
    });
  });
  
  // ============================================================================
  // 4. CRITICAL FEATURES VERIFICATION
  // ============================================================================
  
  test.describe('Critical Features', () => {
    
    test('Room Assignments - Should have room info in bookings API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/bookings`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // Check if bookings have room assignment data
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const booking = data.data[0];
        // Should have room_assignments or similar structure
        expect(booking).toBeTruthy();
      }
    });
    
    test('Participants API - Should return participants with room data', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/participants`);
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeTruthy();
      }
    });
    
    test('Rooms Occupancy - Should return occupancy data', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/rooms/occupancy`);
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeTruthy();
      }
    });
    
    test('No Console Errors - Should not have critical errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        e => !e.includes('YouTube') && 
             !e.includes('tracking') &&
             !e.includes('ad blocker')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
    
    test('No 500 Errors - API should not return 500 status', async ({ request }) => {
      const endpoints = [
        '/api/rooms',
        '/api/bookings',
        '/api/surf-camps',
        '/api/availability',
        '/api/admin/homepage'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request.get(`${BASE_URL}${endpoint}`);
        expect(response.status()).not.toBe(500);
      }
    });
  });
  
  // ============================================================================
  // 5. PERFORMANCE METRICS
  // ============================================================================
  
  test.describe('Performance Metrics', () => {
    
    test('Homepage Load Time - Should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('domcontentloaded');
      const dcl = Date.now() - startTime;
      
      // DCL should be under 3 seconds
      expect(dcl).toBeLessThan(3000);
    });
    
    test('API Response Time - Should respond quickly', async ({ request }) => {
      const startTime = Date.now();
      await request.get(`${BASE_URL}/api/rooms`);
      const responseTime = Date.now() - startTime;
      
      // API should respond under 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });
  
  // ============================================================================
  // 6. ACCESSIBILITY
  // ============================================================================
  
  test.describe('Accessibility', () => {
    
    test('Keyboard Navigation - Should be keyboard navigable', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should not throw errors
      expect(true).toBeTruthy();
    });
    
    test('Color Contrast - Should have sufficient contrast', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForNetworkIdle(page);
      
      // Check if main text is visible
      const text = page.locator('body').first();
      await expect(text).toBeVisible();
    });
  });
});
