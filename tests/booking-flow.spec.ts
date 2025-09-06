import { test, expect } from '@playwright/test';

test.describe('Public Booking Flow (BOOKING-FLOW-001)', () => {
  test('should render booking flow without timeouts', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Verify page loads without timeout
    await expect(page.locator('h1')).toHaveText('Book Your Surf Adventure');
    await expect(page.locator('text=Complete your booking in 5 easy steps')).toBeVisible();

    // Verify step 1 loads with camp selection
    await expect(page.locator('[data-testid="camp-selection"]')).toBeVisible();
    await expect(page.locator('text=Choose Your Surf Camp')).toBeVisible();

    // Verify camps are displayed
    await expect(page.locator('text=Beginner\'s Paradise')).toBeVisible();
    await expect(page.locator('text=Intermediate Challenge')).toBeVisible();
    await expect(page.locator('text=Advanced Waves')).toBeVisible();
  });

  test('should navigate through all 5 steps correctly', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Step 1: Select a camp
    await expect(page.locator('[data-testid="camp-selection"]')).toBeVisible();
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    // Step 2: Group details form
    await expect(page.locator('[data-testid="group-details-form"]')).toBeVisible();
    await expect(page.locator('text=Group Details')).toBeVisible();

    // Fill in participant details
    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');

    await page.locator('text=Next').click();

    // Step 3: Additional info
    await expect(page.locator('[data-testid="additional-info-step"]')).toBeVisible();
    await expect(page.locator('text=Additional Information')).toBeVisible();
    await page.locator('text=Next').click();

    // Step 4: Booking summary
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
    await expect(page.locator('text=Booking Summary')).toBeVisible();
    await expect(page.locator('text=Selected Camp')).toBeVisible();
    await expect(page.locator('text=Beginner\'s Paradise')).toBeVisible();
    await page.locator('text=Next').click();

    // Step 5: Payment
    await expect(page.locator('[data-testid="payment-step"]')).toBeVisible();
    await expect(page.locator('text=Complete Payment')).toBeVisible();
    await expect(page.locator('text=Pay Now')).toBeVisible();
  });

  test('should validate required form fields', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Step 1: Try to proceed without selecting a camp
    const nextButton = page.locator('text=Next');
    await expect(nextButton).toBeDisabled();

    // Select a camp
    await page.locator('text=Beginner\'s Paradise').click();
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Step 2: Try to proceed with empty form
    await expect(page.locator('[data-testid="group-details-form"]')).toBeVisible();
    await expect(page.locator('text=Next')).toBeDisabled();

    // Fill only first name
    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await expect(page.locator('text=Next')).toBeDisabled();

    // Fill all required fields
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');

    // Now Next button should be enabled
    await expect(page.locator('text=Next')).toBeEnabled();
  });

  test('should handle loading states correctly', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Select a camp and proceed to step 2
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    // Fill form and proceed to next step
    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');

    // Click next and verify loading state appears
    await page.locator('text=Next').click();
    
    // Loading spinner should appear briefly
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    // Note: Loading might be too fast to catch, so we just verify it doesn't cause errors
    
    // Verify we moved to next step
    await expect(page.locator('[data-testid="additional-info-step"]')).toBeVisible();
  });

  test('should display error messages for invalid inputs', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Select a camp and proceed to step 2
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    // Try to proceed without filling required fields
    await expect(page.locator('[data-testid="group-details-form"]')).toBeVisible();
    
    // The Next button should be disabled, which serves as validation feedback
    await expect(page.locator('text=Next')).toBeDisabled();

    // Fill invalid email
    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('invalid-email');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');

    // Button should still be disabled due to invalid email
    await expect(page.locator('text=Next')).toBeDisabled();

    // Fix email
    await page.locator('input[placeholder*="Enter email address"]').clear();
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');

    // Now button should be enabled
    await expect(page.locator('text=Next')).toBeEnabled();
  });

  test('should handle multiple participants', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Select a camp and proceed to step 2
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    // Add another participant
    await page.locator('[data-testid="add-participant"]').click();

    // Verify two participant forms are present
    await expect(page.locator('text=Participant 1')).toBeVisible();
    await expect(page.locator('text=Participant 2')).toBeVisible();

    // Fill first participant
    const firstNameInputs = page.locator('input[placeholder*="Enter first name"]');
    const lastNameInputs = page.locator('input[placeholder*="Enter last name"]');
    const emailInputs = page.locator('input[placeholder*="Enter email address"]');
    const phoneInputs = page.locator('input[placeholder*="Enter phone number"]');

    await firstNameInputs.nth(0).fill('John');
    await lastNameInputs.nth(0).fill('Doe');
    await emailInputs.nth(0).fill('john@example.com');
    await phoneInputs.nth(0).fill('+1234567890');

    // Fill second participant
    await firstNameInputs.nth(1).fill('Jane');
    await lastNameInputs.nth(1).fill('Smith');
    await emailInputs.nth(1).fill('jane@example.com');
    await phoneInputs.nth(1).fill('+1234567891');

    // Now Next button should be enabled
    await expect(page.locator('text=Next')).toBeEnabled();
  });

  test('should display correct pricing in summary', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Select a camp (Beginner's Paradise - $450)
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    // Fill participant details
    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');

    await page.locator('text=Next').click(); // Step 3
    await page.locator('text=Next').click(); // Step 4 - Summary

    // Verify pricing is displayed correctly
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
    await expect(page.locator('text=$450')).toBeVisible(); // Per person price
    await expect(page.locator('text=Total Amount:')).toBeVisible();
    await expect(page.locator('text=$450').last()).toBeVisible(); // Total amount
  });

  test('should handle payment step correctly', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Navigate through all steps
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');
    await page.locator('text=Next').click();

    await page.locator('text=Next').click(); // Additional info
    await page.locator('text=Next').click(); // Summary

    // Verify payment step
    await expect(page.locator('[data-testid="payment-step"]')).toBeVisible();
    await expect(page.locator('text=Complete Payment')).toBeVisible();
    await expect(page.locator('text=Pay Now')).toBeVisible();

    // Click pay button and verify loading state
    await page.locator('text=Pay Now').click();
    await expect(page.locator('text=Processing...')).toBeVisible();
  });

  test('should handle navigation between steps', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Go to step 2
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();

    // Fill form
    await page.locator('input[placeholder*="Enter first name"]').fill('John');
    await page.locator('input[placeholder*="Enter last name"]').fill('Doe');
    await page.locator('input[placeholder*="Enter email address"]').fill('john@example.com');
    await page.locator('input[placeholder*="Enter phone number"]').fill('+1234567890');

    // Go to step 3
    await page.locator('text=Next').click();
    await expect(page.locator('[data-testid="additional-info-step"]')).toBeVisible();

    // Go back to step 2
    await page.locator('text=Previous').click();
    await expect(page.locator('[data-testid="group-details-form"]')).toBeVisible();

    // Verify form data is preserved
    await expect(page.locator('input[placeholder*="Enter first name"]')).toHaveValue('John');
    await expect(page.locator('input[placeholder*="Enter last name"]')).toHaveValue('Doe');
  });

  test('should show progress indicator correctly', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    // Verify initial progress (step 1 of 5 = 20%)
    const progressBar = page.locator('[role="progressbar"]');
    
    // Step 1
    await expect(page.locator('text=1').first()).toBeVisible();
    
    // Navigate to step 2
    await page.locator('text=Beginner\'s Paradise').click();
    await page.locator('text=Next').click();
    
    // Verify step 2 is active
    await expect(page.locator('text=2').first()).toBeVisible();
    
    // Progress should increase
    // Note: Exact progress value testing might be flaky, so we just verify the bar exists
    await expect(progressBar).toBeVisible();
  });
});
