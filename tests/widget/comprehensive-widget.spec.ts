import { test, expect } from '@playwright/test';

/**
 * Comprehensive Booking Widget Test Suite
 * 
 * This test suite covers the complete booking widget functionality:
 * - Widget initialization and display
 * - 5-step booking flow (Experience → Options → Details → Add-ons → Review)
 * - Room selection with photo galleries
 * - Date selection and availability
 * - Guest details collection
 * - Add-ons selection
 * - Payment flow (bank transfer)
 * - Booking confirmation
 * - Mobile responsiveness
 * - Error handling
 */

test.describe('Booking Widget - Comprehensive Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to widget test page
    await page.goto('/widget-test-wp');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Widget Initialization and Book Now Button', async ({ page }) => {
    // Verify Book Now button is visible and properly styled
    const bookNowButton = page.getByRole('button', { name: 'Book Now' });
    await expect(bookNowButton).toBeVisible();
    
    // Verify button has proper styling (horizontal layout with icon + text)
    await expect(bookNowButton).toHaveClass(/flex.*items-center.*gap-2/);
    
    // Verify button is positioned in header area (top-right)
    const buttonBox = await bookNowButton.boundingBox();
    expect(buttonBox?.x).toBeGreaterThan(800); // Should be on the right side
    expect(buttonBox?.y).toBeLessThan(100); // Should be near the top
  });

  test('Complete Booking Flow - Room Booking', async ({ page }) => {
    // Step 1: Open widget
    await page.getByRole('button', { name: 'Book Now' }).click();
    
    // Verify widget modal opens
    await expect(page.getByText('What would you like to book?')).toBeVisible();
    
    // Step 2: Select Experience (Room booking)
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 3: Select dates and room
    await expect(page.getByText('Select your dates and room')).toBeVisible();
    
    // Fill in dates
    await page.getByPlaceholder('Check-in date').fill('2024-12-20');
    await page.getByPlaceholder('Check-out date').fill('2024-12-23');
    
    // Select number of guests
    await page.getByRole('button', { name: '+' }).first().click(); // Increase adults to 2
    
    // Verify room cards are displayed with premium styling
    const roomCards = page.locator('[data-testid*="room-card"]');
    await expect(roomCards.first()).toBeVisible();
    
    // Test "View Photos" functionality
    const viewPhotosButton = page.getByText('View Photos').first();
    if (await viewPhotosButton.isVisible()) {
      await viewPhotosButton.click();
      
      // Verify photo modal opens
      await expect(page.locator('[data-testid="room-modal"]')).toBeVisible();
      
      // Close photo modal
      await page.getByRole('button', { name: 'Close' }).click();
    }
    
    // Select a room
    await page.getByText('Select Room').first().click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 4: Guest Details
    await expect(page.getByText('Guest Details')).toBeVisible();
    
    // Fill in guest details
    await page.getByPlaceholder('First Name').fill('John');
    await page.getByPlaceholder('Last Name').fill('Doe');
    await page.getByPlaceholder('Email').fill('john.doe@test.com');
    await page.getByPlaceholder('Phone').fill('+1-555-0123');
    
    // Continue to add-ons
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 5: Add-ons (optional)
    await expect(page.getByText('Add-ons')).toBeVisible();
    
    // Skip add-ons or select some if available
    const addOnButtons = page.locator('[data-testid*="addon-add"]');
    if (await addOnButtons.count() > 0) {
      await addOnButtons.first().click(); // Add first add-on
    }
    
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 6: Review and Payment
    await expect(page.getByText('Review & Payment')).toBeVisible();
    
    // Verify booking summary is displayed
    await expect(page.getByText('Booking Summary')).toBeVisible();
    
    // Select payment method (Bank Transfer)
    await page.getByText('Bank Transfer').click();
    
    // Complete booking
    await page.getByRole('button', { name: 'Complete Booking' }).click();
    
    // Verify booking confirmation
    await expect(page.getByText('Booking Confirmed')).toBeVisible();
    await expect(page.getByText('Thank you for your booking')).toBeVisible();
    
    // Verify booking reference is displayed
    const bookingRef = page.locator('[data-testid="booking-reference"]');
    if (await bookingRef.isVisible()) {
      const refText = await bookingRef.textContent();
      expect(refText).toMatch(/HW-\d+/); // Should match pattern like HW-12345
    }
  });

  test('Complete Booking Flow - Surf Week Booking', async ({ page }) => {
    // Step 1: Open widget
    await page.getByRole('button', { name: 'Book Now' }).click();
    
    // Step 2: Select Experience (Surf week)
    await page.getByText('Surf week').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 3: Select surf week and accommodation
    await expect(page.getByText('Choose your surf week')).toBeVisible();
    
    // Select a surf week
    const surfWeekCards = page.locator('[data-testid*="surf-week-card"]');
    if (await surfWeekCards.count() > 0) {
      await surfWeekCards.first().click();
      
      // Select accommodation (should default to dorm with upgrade options)
      await expect(page.getByText('Accommodation')).toBeVisible();
      
      // Verify dorm room is shown as default/included option
      await expect(page.getByText('Dorm')).toBeVisible();
      
      // Verify private room upgrades are available
      const upgradeOptions = page.locator('[data-testid*="room-upgrade"]');
      if (await upgradeOptions.count() > 0) {
        // Test selecting a private room upgrade
        await upgradeOptions.first().click();
      }
      
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Continue with guest details (same as room booking flow)
      await expect(page.getByText('Guest Details')).toBeVisible();
      
      await page.getByPlaceholder('First Name').fill('Jane');
      await page.getByPlaceholder('Last Name').fill('Smith');
      await page.getByPlaceholder('Email').fill('jane.smith@test.com');
      await page.getByPlaceholder('Phone').fill('+1-555-0456');
      
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Skip add-ons
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Complete booking
      await page.getByText('Bank Transfer').click();
      await page.getByRole('button', { name: 'Complete Booking' }).click();
      
      // Verify confirmation
      await expect(page.getByText('Booking Confirmed')).toBeVisible();
    }
  });

  test('Room Selection with Photo Galleries', async ({ page }) => {
    // Open widget and navigate to room selection
    await page.getByRole('button', { name: 'Book Now' }).click();
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Fill in dates
    await page.getByPlaceholder('Check-in date').fill('2024-12-20');
    await page.getByPlaceholder('Check-out date').fill('2024-12-23');
    
    // Test room card styling and functionality
    const roomCards = page.locator('[data-testid*="room-card"]');
    await expect(roomCards.first()).toBeVisible();
    
    // Verify room cards have proper styling (not full width)
    const firstCard = roomCards.first();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeLessThan(600); // Should not be full width
    
    // Test photo gallery modal
    const viewPhotosButton = page.getByText('View Photos').first();
    if (await viewPhotosButton.isVisible()) {
      await viewPhotosButton.click();
      
      // Verify modal opens with room details
      const modal = page.locator('[data-testid="room-modal"]');
      await expect(modal).toBeVisible();
      
      // Verify room information is displayed
      await expect(modal.getByText('Amenities')).toBeVisible();
      await expect(modal.getByText('Pricing')).toBeVisible();
      
      // Test photo navigation if multiple photos
      const nextButton = modal.getByRole('button', { name: 'Next' });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
      
      // Close modal
      await page.getByRole('button', { name: 'Close' }).click();
      await expect(modal).not.toBeVisible();
    }
  });

  test('Date Input Functionality', async ({ page }) => {
    // Open widget and navigate to date selection
    await page.getByRole('button', { name: 'Book Now' }).click();
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Test date inputs automatically open calendar pickers
    const checkinInput = page.getByPlaceholder('Check-in date');
    await checkinInput.click();
    
    // Verify calendar picker opens (if implemented)
    const calendar = page.locator('[data-testid="date-picker"]');
    if (await calendar.isVisible()) {
      // Test calendar interaction
      await calendar.getByText('20').click(); // Select 20th
    } else {
      // Fallback to manual date entry
      await checkinInput.fill('2024-12-20');
    }
    
    // Test checkout date
    const checkoutInput = page.getByPlaceholder('Check-out date');
    await checkoutInput.fill('2024-12-23');
    
    // Verify dates are accepted
    expect(await checkinInput.inputValue()).toBe('2024-12-20');
    expect(await checkoutInput.inputValue()).toBe('2024-12-23');
  });

  test('Guest Details Collection', async ({ page }) => {
    // Navigate to guest details step
    await page.getByRole('button', { name: 'Book Now' }).click();
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Fill dates and select room
    await page.getByPlaceholder('Check-in date').fill('2024-12-20');
    await page.getByPlaceholder('Check-out date').fill('2024-12-23');
    await page.getByText('Select Room').first().click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Test guest details form
    await expect(page.getByText('Guest Details')).toBeVisible();
    
    // Test form validation
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should show validation errors for required fields
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    
    // Fill in valid details
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Phone').fill('+1-555-0123');
    
    // Should be able to continue
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Add-ons')).toBeVisible();
  });

  test('Mobile Responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Verify Book Now button is still visible and properly positioned
    const bookNowButton = page.getByRole('button', { name: 'Book Now' });
    await expect(bookNowButton).toBeVisible();
    
    // Open widget
    await bookNowButton.click();
    
    // Verify widget modal is responsive
    const modal = page.locator('[data-testid="booking-widget"]');
    await expect(modal).toBeVisible();
    
    // Test navigation through steps on mobile
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify room cards don't cause horizontal overflow
    const roomCards = page.locator('[data-testid*="room-card"]');
    if (await roomCards.count() > 0) {
      const cardBox = await roomCards.first().boundingBox();
      expect(cardBox?.width).toBeLessThan(375); // Should fit in mobile viewport
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    // Test widget behavior with invalid dates
    await page.getByRole('button', { name: 'Book Now' }).click();
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Try invalid date range (checkout before checkin)
    await page.getByPlaceholder('Check-in date').fill('2024-12-25');
    await page.getByPlaceholder('Check-out date').fill('2024-12-20');
    
    // Should show error or prevent invalid selection
    const continueButton = page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isEnabled()) {
      await continueButton.click();
      // Should show validation error
      await expect(page.getByText('Check-out date must be after check-in date')).toBeVisible();
    }
    
    // Test with valid dates
    await page.getByPlaceholder('Check-in date').fill('2024-12-20');
    await page.getByPlaceholder('Check-out date').fill('2024-12-23');
    
    // Should be able to continue
    await expect(continueButton).toBeEnabled();
  });

  test('Widget Close and Reopen Functionality', async ({ page }) => {
    // Open widget
    await page.getByRole('button', { name: 'Book Now' }).click();
    
    // Verify widget opens
    await expect(page.getByText('What would you like to book?')).toBeVisible();
    
    // Close widget using close button
    const closeButton = page.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    // Verify widget closes
    await expect(page.getByText('What would you like to book?')).not.toBeVisible();
    
    // Verify Book Now button is still visible
    await expect(page.getByRole('button', { name: 'Book Now' })).toBeVisible();
    
    // Test reopening widget
    await page.getByRole('button', { name: 'Book Now' }).click();
    await expect(page.getByText('What would you like to book?')).toBeVisible();
  });

  test('Payment Flow - Bank Transfer', async ({ page }) => {
    // Navigate to payment step
    await page.getByRole('button', { name: 'Book Now' }).click();
    await page.getByText('Room booking').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Quick path to payment
    await page.getByPlaceholder('Check-in date').fill('2024-12-20');
    await page.getByPlaceholder('Check-out date').fill('2024-12-23');
    await page.getByText('Select Room').first().click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Fill guest details
    await page.getByPlaceholder('First Name').fill('Payment');
    await page.getByPlaceholder('Last Name').fill('Test');
    await page.getByPlaceholder('Email').fill('payment@test.com');
    await page.getByPlaceholder('Phone').fill('+1-555-0789');
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Skip add-ons
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Test payment options
    await expect(page.getByText('Review & Payment')).toBeVisible();
    
    // Verify bank transfer option is available
    await expect(page.getByText('Bank Transfer')).toBeVisible();
    
    // Select bank transfer
    await page.getByText('Bank Transfer').click();
    
    // Verify bank transfer instructions are shown
    await expect(page.getByText('Bank Details')).toBeVisible();
    
    // Complete booking
    await page.getByRole('button', { name: 'Complete Booking' }).click();
    
    // Verify booking confirmation with bank transfer instructions
    await expect(page.getByText('Booking Confirmed')).toBeVisible();
    await expect(page.getByText('Bank Transfer Instructions')).toBeVisible();
  });

});
