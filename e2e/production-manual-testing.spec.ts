import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://heiwahauz.netlify.app';
const ADMIN_PASSWORD = 'heiwa_secure_admin_2025';
const TEST_RESULTS_DIR = path.join(process.cwd(), 'test-results', 'production-manual-testing');

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

interface TestIssue {
  test: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  screenshot?: string;
  steps?: string[];
  expected?: string;
  actual?: string;
}

const issues: TestIssue[] = [];

async function captureIssue(
  page: Page,
  test: string,
  severity: TestIssue['severity'],
  description: string,
  details: Partial<TestIssue> = {}
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotName = `${test.replace(/\s+/g, '-')}-${timestamp}.png`;
  const screenshotPath = path.join(TEST_RESULTS_DIR, screenshotName);

  await page.screenshot({ path: screenshotPath, fullPage: true });

  issues.push({
    test,
    severity,
    description,
    screenshot: screenshotPath,
    ...details
  });

  console.log(`\n🐛 ISSUE FOUND: ${description}`);
  console.log(`   Severity: ${severity}`);
  console.log(`   Screenshot: ${screenshotPath}`);
}

test.describe('Production Site Manual Testing - Comprehensive', () => {
  test.setTimeout(120000); // 2 minutes per test

  test('1. Complete Room Booking Flow (Jan 13-21, 2026)', async ({ page }) => {
    console.log('\n📋 TEST 1: Complete Room Booking Flow (Jan 13-21, 2026)');

    try {
      // Navigate to homepage
      console.log('Step 1: Loading homepage...');
      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle', timeout: 60000 });
      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '1-homepage.png'), fullPage: true });

      // Check for booking widget or button
      console.log('Step 2: Looking for booking widget...');
      const bookingTriggers = [
        'button:has-text("Book Now")',
        'button:has-text("Reserve")',
        'button:has-text("EXPLORE")',
        '[data-testid="booking-widget-trigger"]',
        '.booking-button',
        '#booking-widget-trigger',
        'a[href*="book"]',
        'a[href*="rooms"]',
        'a[href*="surf-weeks"]'
      ];

      let triggerFound = false;
      for (const selector of bookingTriggers) {
        const trigger = page.locator(selector).first();
        if (await trigger.isVisible().catch(() => false)) {
          console.log(`✓ Found booking trigger: ${selector}`);
          await trigger.click();
          triggerFound = true;
          break;
        }
      }

      if (!triggerFound) {
        await captureIssue(page, 'Room Booking Flow', 'critical',
          'No booking widget trigger found on homepage', {
          steps: ['Navigate to homepage', 'Look for booking button/widget'],
          expected: 'Visible booking button or widget trigger',
          actual: 'No booking trigger found'
        });
      }

      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '1-booking-widget-opened.png'), fullPage: true });

      // Try to navigate to rooms page directly
      console.log('Step 3: Trying direct navigation to /rooms...');
      await page.goto(`${PRODUCTION_URL}/rooms`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '1-rooms-page.png'), fullPage: true });

      // Look for room cards or listings
      console.log('Step 4: Looking for room listings...');
      const roomSelectors = [
        '[data-testid="room-card"]',
        '.room-card',
        '[class*="room"]',
        'article',
        '[role="article"]',
        'h3:has-text("Room Nr")',
        'a[href*="/rooms/"]'
      ];

      let roomsFound = false;
      for (const selector of roomSelectors) {
        const rooms = page.locator(selector);
        const count = await rooms.count();
        if (count > 0) {
          console.log(`✓ Found ${count} rooms using selector: ${selector}`);
          roomsFound = true;
          break;
        }
      }

      if (!roomsFound) {
        await captureIssue(page, 'Room Booking Flow', 'high',
          'No rooms displayed on /rooms page', {
          steps: ['Navigate to /rooms', 'Look for room cards'],
          expected: 'List of available rooms with booking options',
          actual: 'No room cards found'
        });
      }

      // Try to open booking widget from rooms page
      console.log('Step 5: Attempting to start booking flow...');
      const bookingButtons = page.locator('button, a').filter({ hasText: /book|reserve|select|detail|check availability/i });
      const buttonCount = await bookingButtons.count();

      if (buttonCount > 0) {
        console.log(`✓ Found ${buttonCount} booking buttons`);
        const firstButton = bookingButtons.first();
        await firstButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '1-booking-flow-started.png'), fullPage: true });

        // NEW: Select experience type if we're on the experience selection step
        const experienceStepHeader = page.locator('h3:has-text("Choose Your Adventure")');
        if (await experienceStepHeader.isVisible().catch(() => false)) {
          console.log('Step 5.1: Selecting "Book a Room" experience...');
          await page.locator('button:has-text("Book a Room")').click();
          await page.waitForTimeout(1000);
        }
      } else {
        await captureIssue(page, 'Room Booking Flow', 'high',
          'No booking buttons found for rooms', {
          steps: ['Navigate to /rooms', 'Look for booking buttons'],
          expected: 'Booking buttons on room cards',
          actual: 'No booking buttons found'
        });
      }

      // Test date selection (Jan 13-21, 2026)
      console.log('Step 6: Testing date selection...');
      
      // Look for DatePickers by their button triggers which have IDs 'check-in' and 'check-out'
      const checkInTrigger = page.locator('button#check-in');
      const checkOutTrigger = page.locator('button#check-out');
      
      const checkInVisible = await checkInTrigger.isVisible().catch(() => false);
      const checkOutVisible = await checkOutTrigger.isVisible().catch(() => false);

      if (checkInVisible || checkOutVisible) {
        console.log(`✓ Found date picker triggers: Check-in: ${checkInVisible}, Check-out: ${checkOutVisible}`);
        
        if (checkInVisible) {
           console.log('Triggering check-in date picker...');
           await checkInTrigger.click();
           await page.waitForTimeout(1000);
           
           // Look for calendar content in popover (shadcn/ui Popover uses a portal, often with rdp class)
           const calendar = page.locator('.rdp, [role="grid"], .calendar').first();
           if (await calendar.isVisible().catch(() => false)) {
             console.log('✓ Calendar popover opened successfully');
             // Optionally click a date or just close it
             await page.keyboard.press('Escape');
           }
        }
        await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '1-dates-interaction.png'), fullPage: true });
      } else {
        // Fallback for other possible selectors
        const fallbackDates = page.locator('button:has-text("Select"), button:has-text("Check-in"), button:has-text("Check-out"), input[type="date"]');
        if (await fallbackDates.count() > 0) {
            console.log('✓ Found fallback date elements');
        } else {
            await captureIssue(page, 'Room Booking Flow', 'medium',
              'No date input fields or pickers found in booking flow', {
              steps: ['Start booking flow', 'Look for date pickers'],
              expected: 'Check-in and check-out date pickers (buttons with IDs check-in/check-out)',
              actual: 'No date elements found'
            });
        }
      }

      // Look for any error messages
      console.log('Step 7: Checking for error messages...');
      const errorSelectors = [
        '[role="alert"]',
        '.error',
        '[class*="error"]',
        '.text-red-500',
        '[data-testid*="error"]'
      ];

      for (const selector of errorSelectors) {
        const errors = page.locator(selector);
        const count = await errors.count();
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const errorText = await errors.nth(i).textContent();
            if (errorText && errorText.trim()) {
              console.log(`⚠️  Error message found: ${errorText}`);

              // Check if error message is friendly
              const unfriendlyPatterns = [
                /error:/i,
                /exception/i,
                /stack trace/i,
                /undefined/i,
                /null/i,
                /{.*}/,
                /\[object Object\]/i
              ];

              const isUnfriendly = unfriendlyPatterns.some(pattern => pattern.test(errorText));

              if (isUnfriendly) {
                await captureIssue(page, 'Room Booking Flow', 'medium',
                  'Unfriendly error message displayed', {
                  steps: ['During booking flow'],
                  expected: 'User-friendly error message',
                  actual: `Technical error message: "${errorText}"`
                });
              }
            }
          }
        }
      }

    } catch (error: any) {
      await captureIssue(page, 'Room Booking Flow', 'critical',
        `Test execution failed: ${error.message}`, {
        steps: ['Complete room booking flow test'],
        expected: 'Successful test execution',
        actual: `Error: ${error.message}`
      });
    }
  });

  test('2. Surf Week Booking Flow', async ({ page }) => {
    console.log('\n📋 TEST 2: Surf Week Booking Flow');

    try {
      // Navigate to surf camps page
      console.log('Step 1: Navigating to surf weeks...');
      await page.goto(`${PRODUCTION_URL}/surf-weeks`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '2-surf-weeks-page.png'), fullPage: true });

      // Check for surf camp listings
      console.log('Step 2: Looking for surf week listings...');
      const campSelectors = [
        '[data-testid="surf-camp-card"]',
        '.surf-camp-card',
        '[class*="camp"]',
        'article',
        'h3:has-text("Surf Week")',
        'button:has-text("Join")'
      ];

      let campsFound = false;
      for (const selector of campSelectors) {
        const camps = page.locator(selector);
        const count = await camps.count();
        if (count > 0) {
          console.log(`✓ Found ${count} surf weeks using selector: ${selector}`);
          campsFound = true;
          break;
        }
      }

      if (!campsFound) {
        await captureIssue(page, 'Surf Week Booking', 'high',
          'No surf weeks displayed on /surf-weeks page', {
          steps: ['Navigate to /surf-weeks', 'Look for camp cards'],
          expected: 'List of available surf weeks',
          actual: 'No surf week cards found'
        });
      }

      // Try to book a surf week
      console.log('Step 3: Attempting to book surf week...');
      const bookButtons = page.locator('button').filter({ hasText: /book|join|register|reserve/i });
      const buttonCount = await bookButtons.count();

      if (buttonCount > 0) {
        console.log(`✓ Found ${buttonCount} booking buttons`);
        await bookButtons.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '2-surf-booking-started.png'), fullPage: true });

        // Check for participant selection
        console.log('Step 4: Checking for participant selection...');
        const participantSelectors = [
          'input[placeholder*="name"]',
          'input[placeholder*="participant"]',
          'input[id*="guest"]',
          'button:has-text("+")',
          'button:has-text("-")',
          'input[type="number"]'
        ];
        
        let participantElementFound = false;
        for (const selector of participantSelectors) {
          if (await page.locator(selector).first().isVisible().catch(() => false)) {
            console.log(`✓ Found participant-related element: ${selector}`);
            participantElementFound = true;
            break;
          }
        }

        if (!participantElementFound) {
          await captureIssue(page, 'Surf Week Booking', 'medium',
            'No participant input fields or guest counters found', {
            steps: ['Start surf week booking', 'Look for participant fields'],
            expected: 'Form fields or guest counters for participant information',
            actual: 'No participant elements found'
          });
        }
      } else {
        await captureIssue(page, 'Surf Week Booking', 'high',
          'No booking buttons found for surf camps', {
          steps: ['Navigate to /surf-camps', 'Look for booking buttons'],
          expected: 'Booking buttons on surf camp cards',
          actual: 'No booking buttons found'
        });
      }

    } catch (error: any) {
      await captureIssue(page, 'Surf Week Booking', 'critical',
        `Test execution failed: ${error.message}`);
    }
  });

  test('3. Admin Login and Authentication', async ({ page }) => {
    console.log('\n📋 TEST 3: Admin Login and Authentication');

    try {
      // Navigate to admin page
      console.log('Step 1: Navigating to admin page...');
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '3-admin-login-page.png'), fullPage: true });

      // Wait for any remaining network activity to settle, but don't fail if it doesn't
      await page.waitForLoadState('networkidle').catch(() => console.log('Timeout waiting for networkidle, continuing anyway...'));

      // Check for login form
      console.log('Step 2: Looking for login form...');
      const passwordInput = page.locator('input[type="password"]');
      const isPasswordVisible = await passwordInput.isVisible().catch(() => false);

      if (!isPasswordVisible) {
        await captureIssue(page, 'Admin Login', 'critical',
          'No password input found on admin page', {
          steps: ['Navigate to /admin', 'Look for login form'],
          expected: 'Password input field for admin login',
          actual: 'No password input found'
        });
        return;
      }

      // Try to login
      console.log('Step 3: Attempting admin login...');
      await passwordInput.fill(ADMIN_PASSWORD);

      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      const loginButtonExists = await loginButton.isVisible().catch(() => false);

      if (loginButtonExists) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '3-admin-after-login.png'), fullPage: true });

        // Check if login was successful
        const currentUrl = page.url();
        const stillOnLoginPage = await passwordInput.isVisible().catch(() => false);

        if (stillOnLoginPage) {
          await captureIssue(page, 'Admin Login', 'high',
            'Admin login appears to have failed', {
            steps: ['Navigate to /admin', 'Enter password', 'Click login'],
            expected: 'Redirect to admin dashboard',
            actual: 'Still on login page'
          });
        } else {
          console.log('✓ Admin login successful');
        }
      } else {
        await captureIssue(page, 'Admin Login', 'high',
          'No login button found on admin page', {
          steps: ['Navigate to /admin', 'Look for login button'],
          expected: 'Login/Submit button',
          actual: 'No login button found'
        });
      }

    } catch (error: any) {
      await captureIssue(page, 'Admin Login', 'critical',
        `Test execution failed: ${error.message}`);
    }
  });

  test('4. Calendar Event Management in Admin', async ({ page }) => {
    console.log('\n📋 TEST 4: Calendar Event Management in Admin');

    try {
      // Login first
      await page.goto(`${PRODUCTION_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForLoadState('networkidle').catch(() => {});
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible().catch(() => false)) {
        await passwordInput.fill(ADMIN_PASSWORD);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '4-admin-dashboard.png'), fullPage: true });

      // Look for calendar or events section
      console.log('Step 1: Looking for calendar/events section...');
      const calendarLinks = [
        'a:has-text("Calendar")',
        'a:has-text("Events")',
        'button:has-text("Calendar")',
        '[data-testid="calendar-link"]'
      ];

      let calendarFound = false;
      for (const selector of calendarLinks) {
        const link = page.locator(selector).first();
        if (await link.isVisible().catch(() => false)) {
          console.log(`✓ Found calendar link: ${selector}`);
          await link.click();
          await page.waitForTimeout(2000);
          calendarFound = true;
          break;
        }
      }

      if (!calendarFound) {
        await captureIssue(page, 'Calendar Management', 'medium',
          'No calendar/events section found in admin', {
          steps: ['Login to admin', 'Look for calendar section'],
          expected: 'Calendar or events management section',
          actual: 'No calendar section found'
        });
      }

      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '4-calendar-section.png'), fullPage: true });

      // Look for add event button
      console.log('Step 2: Looking for add event functionality...');
      const addButtons = page.locator('button').filter({ hasText: /add|create|new/i });
      const addButtonCount = await addButtons.count();

      if (addButtonCount === 0) {
        await captureIssue(page, 'Calendar Management', 'low',
          'No add event button found in calendar section', {
          steps: ['Navigate to calendar section', 'Look for add button'],
          expected: 'Button to add new calendar events',
          actual: 'No add button found'
        });
      }

    } catch (error: any) {
      await captureIssue(page, 'Calendar Management', 'critical',
        `Test execution failed: ${error.message}`);
    }
  });

  test('5. Date Availability Checks', async ({ page }) => {
    console.log('\n📋 TEST 5: Date Availability Checks');

    try {
      // Test various date scenarios
      console.log('Step 1: Testing past dates...');
      await page.goto(`${PRODUCTION_URL}/rooms`, { waitUntil: 'networkidle' });

      // Try to select a past date
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() > 0) {
        await dateInputs.first().fill('2020-01-01');
        await page.waitForTimeout(1000);

        const errorVisible = await page.locator('[role="alert"], .error, [class*="error"]').isVisible().catch(() => false);

        if (!errorVisible) {
          await captureIssue(page, 'Date Availability', 'medium',
            'No error shown when selecting past date', {
            steps: ['Navigate to rooms', 'Try to select past date'],
            expected: 'Error message preventing past date selection',
            actual: 'No error shown'
          });
        }
      }

      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '5-date-validation.png'), fullPage: true });

      // Test API directly for date availability
      console.log('Step 2: Testing date availability API...');
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/availability?start_date=2026-01-13&end_date=2026-01-21');
        return {
          status: res.status,
          data: await res.json()
        };
      });

      console.log('Date availability API response:', response);

    } catch (error: any) {
      await captureIssue(page, 'Date Availability', 'critical',
        `Test execution failed: ${error.message}`);
    }
  });

  test('6. Error Messages Friendliness Check', async ({ page }) => {
    console.log('\n📋 TEST 6: Error Messages Friendliness Check');

    try {
      // Test various error scenarios
      console.log('Step 1: Testing invalid booking submission...');
      await page.goto(`${PRODUCTION_URL}/rooms`, { waitUntil: 'networkidle' });

      // Try to submit empty form
      const submitButtons = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Book")');
      if (await submitButtons.count() > 0) {
        await submitButtons.first().click();
        await page.waitForTimeout(1000);

        // Check all error messages
        const errorMessages = await page.locator('[role="alert"], .error, [class*="error"]').allTextContents();

        for (const message of errorMessages) {
          const unfriendlyPatterns = [
            /error:/i,
            /exception/i,
            /stack/i,
            /undefined/i,
            /null/i,
            /{.*}/,
            /\[object/i,
            /NaN/i,
            /TypeError/i,
            /ReferenceError/i
          ];

          const isUnfriendly = unfriendlyPatterns.some(pattern => pattern.test(message));

          if (isUnfriendly) {
            await captureIssue(page, 'Error Messages', 'high',
              `Unfriendly error message: "${message}"`, {
              steps: ['Trigger validation error'],
              expected: 'User-friendly error message',
              actual: message
            });
          }
        }
      }

      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '6-error-messages.png'), fullPage: true });

    } catch (error: any) {
      await captureIssue(page, 'Error Messages', 'critical',
        `Test execution failed: ${error.message}`);
    }
  });

  test('7. Edge Cases Testing', async ({ page }) => {
    console.log('\n📋 TEST 7: Edge Cases Testing');

    try {
      // Test 1: Invalid date ranges
      console.log('Step 1: Testing invalid date ranges...');
      await page.goto(`${PRODUCTION_URL}/rooms`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '7-edge-case-start.png'), fullPage: true });

      // Test 2: Special characters in forms
      console.log('Step 2: Testing special characters...');
      const textInputs = page.locator('input[type="text"], input[type="email"]');
      if (await textInputs.count() > 0) {
        await textInputs.first().fill('<script>alert("xss")</script>');
        await page.waitForTimeout(500);

        // Check if properly escaped
        const value = await textInputs.first().inputValue();
        if (value.includes('<script>')) {
          await captureIssue(page, 'Edge Cases', 'high',
            'Potential XSS vulnerability - special characters not escaped', {
            steps: ['Enter script tags in text input'],
            expected: 'Input sanitized or escaped',
            actual: 'Raw script tags accepted'
          });
        }
      }

      // Test 3: Extremely long inputs
      console.log('Step 3: Testing extremely long inputs...');
      if (await textInputs.count() > 0) {
        await textInputs.first().fill('A'.repeat(10000));
        await page.waitForTimeout(500);

        // Check for error or length limit
        const errors = await page.locator('[role="alert"]').count();
        if (errors === 0) {
          await captureIssue(page, 'Edge Cases', 'low',
            'No validation for extremely long inputs', {
            steps: ['Enter 10000 characters in text input'],
            expected: 'Length validation error',
            actual: 'No error shown'
          });
        }
      }

      await page.screenshot({ path: path.join(TEST_RESULTS_DIR, '7-edge-cases-complete.png'), fullPage: true });

    } catch (error: any) {
      await captureIssue(page, 'Edge Cases', 'critical',
        `Test execution failed: ${error.message}`);
    }
  });

  test.afterAll(async () => {
    // Generate test report
    console.log('\n\n📊 ===== PRODUCTION TEST REPORT =====\n');

    if (issues.length === 0) {
      console.log('✅ NO ISSUES FOUND! Production site is working well.\n');
    } else {
      console.log(`⚠️  Found ${issues.length} issues:\n`);

      const critical = issues.filter(i => i.severity === 'critical');
      const high = issues.filter(i => i.severity === 'high');
      const medium = issues.filter(i => i.severity === 'medium');
      const low = issues.filter(i => i.severity === 'low');

      console.log(`🔴 Critical: ${critical.length}`);
      console.log(`🟠 High: ${high.length}`);
      console.log(`🟡 Medium: ${medium.length}`);
      console.log(`🟢 Low: ${low.length}\n`);

      issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.test}`);
        console.log(`   ${issue.description}`);
        if (issue.steps) {
          console.log(`   Steps: ${issue.steps.join(' → ')}`);
        }
        if (issue.expected) {
          console.log(`   Expected: ${issue.expected}`);
        }
        if (issue.actual) {
          console.log(`   Actual: ${issue.actual}`);
        }
        if (issue.screenshot) {
          console.log(`   Screenshot: ${issue.screenshot}`);
        }
      });
    }

    // Write report to file
    const reportPath = path.join(TEST_RESULTS_DIR, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  });
});
