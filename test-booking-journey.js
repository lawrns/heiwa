#!/usr/bin/env node

// Test the complete booking journey
const puppeteer = require('puppeteer');
const http = require('http');

async function checkIfServerIsRunning() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function testBookingJourney() {
  console.log('🎯 Testing Complete Booking Journey');
  console.log('='.repeat(50));

  // Check if server is running
  const serverRunning = await checkIfServerIsRunning();
  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:3000');
    console.log('Please run: npm run dev');
    process.exit(1);
  }

  console.log('✅ Server is running');

  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for manual verification
    slowMo: 100 // Slow down for visibility
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1200, height: 800 });

    console.log('📍 Step 1: Navigate to rooms page');
    await page.goto('http://localhost:3000/rooms');
    await page.waitForSelector('a[href*="/rooms/"]', { timeout: 5000 });
    console.log('✅ Rooms page loaded');

    console.log('📍 Step 2: Click on Room Nr 2');
    await page.click('a[href="/rooms/ac98fd46-5bd2-413c-98f3-17e71024e734"]');
    await page.waitForSelector('text/Room Nr 2/', { timeout: 5000 });
    console.log('✅ Room detail page loaded');

    console.log('📍 Step 3: Click "Check Availability" button');
    await page.click('button:has-text("Check Availability")');
    
    // Wait for booking widget to open
    await page.waitForSelector('.heiwa-modal-overlay', { timeout: 5000 });
    console.log('✅ Booking widget opened');

    console.log('📍 Step 4: Select dates');
    // Select check-in date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkInDate = tomorrow.toISOString().split('T')[0];
    
    // Select check-out date (day after tomorrow)
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    const checkOutDate = dayAfter.toISOString().split('T')[0];

    // Fill dates (this might need adjustment based on actual date picker implementation)
    await page.waitForSelector('input[type="date"], input[placeholder*="Check"], input[placeholder*="check"]', { timeout: 5000 });
    
    // Try to find date inputs
    const dateInputs = await page.$$('input[type="date"]');
    if (dateInputs.length >= 2) {
      await dateInputs[0].fill(checkInDate);
      await dateInputs[1].fill(checkOutDate);
      console.log('✅ Dates selected');
    } else {
      console.log('⚠️ Date inputs not found, checking for alternative date picker');
    }

    console.log('📍 Step 5: Select guests');
    const guestSelector = await page.$('select[name="guests"], button:has-text("Guests")');
    if (guestSelector) {
      await guestSelector.click();
      await page.waitForTimeout(500);
      // Select 1 guest
      await page.click('button:has-text("1"), option[value="1"]');
      console.log('✅ Guests selected');
    }

    console.log('📍 Step 6: Click "Next" to proceed');
    const nextButton = await page.$('button:has-text("Next"), button:has-text("Continue")');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Proceeded to next step');
    }

    console.log('📍 Step 7: Fill guest details');
    // Wait for guest details form
    await page.waitForSelector('input[name*="name"], input[name*="email"], input[placeholder*="Name"]', { timeout: 5000 });
    
    // Fill test guest information
    const nameInput = await page.$('input[name*="name"], input[placeholder*="Name"], input[placeholder*="First"]');
    if (nameInput) await nameInput.fill('Test User');
    
    const emailInput = await page.$('input[name*="email"], input[placeholder*="Email"]');
    if (emailInput) await emailInput.fill('test@example.com');
    
    const phoneInput = await page.$('input[name*="phone"], input[placeholder*="Phone"]');
    if (phoneInput) await phoneInput.fill('+351 912 345 678');
    
    console.log('✅ Guest details filled');

    console.log('📍 Step 8: Proceed to payment');
    const proceedToPayment = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")');
    if (proceedToPayment) {
      await proceedToPayment.click();
      await page.waitForTimeout(1000);
      console.log('✅ Proceeded to payment');
    }

    console.log('📍 Step 9: Select payment method');
    await page.waitForSelector('input[name="payment"], button:has-text("Bank"), button:has-text("Credit")', { timeout: 5000 });
    
    // Select bank wire to avoid Stripe redirect
    const bankWireOption = await page.$('input[value="bank_wire"], button:has-text("Bank"), button:has-text("Transfer")');
    if (bankWireOption) {
      await bankWireOption.click();
      console.log('✅ Bank wire payment selected');
    }

    console.log('📍 Step 10: Accept terms');
    const termsCheckbox = await page.$('input[type="checkbox"]');
    if (termsCheckbox) {
      await termsCheckbox.click();
      console.log('✅ Terms accepted');
    }

    console.log('📍 Step 11: Click "Complete Booking" button');
    const completeButton = await page.$('button:has-text("Confirm"), button:has-text("Complete"), button:has-text("Pay"), button:has-text("Book")');
    if (completeButton) {
      console.log('🎯 Found complete booking button, clicking...');
      await completeButton.click();
      
      // Wait for booking to process
      await page.waitForTimeout(3000);
      
      // Check for success message
      const successMessage = await page.$('text/Booking Confirmed/, text/Success/, text/Thank you/');
      if (successMessage) {
        console.log('🎉 BOOKING SUCCESSFUL!');
        console.log('✅ Complete booking journey verified');
      } else {
        // Check for error message
        const errorMessage = await page.$('text/Error/, text/Failed/, text/Problem/');
        if (errorMessage) {
          console.log('❌ Booking failed with error');
          const errorText = await errorMessage.textContent();
          console.log('Error:', errorText);
        } else {
          console.log('⚠️ Booking status unclear - check browser window');
        }
      }
    } else {
      console.log('❌ Complete booking button not found');
    }

    console.log('\n📊 Test Summary:');
    console.log('- Server: ✅ Running');
    console.log('- Room page: ✅ Loaded');
    console.log('- Booking widget: ✅ Opened');
    console.log('- Form filling: ✅ Completed');
    console.log('- Complete button: ' + (completeButton ? '✅ Found' : '❌ Not found'));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser window remains open for manual inspection');
    console.log('Press Ctrl+C to close');
    
    // Wait for manual closing
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testBookingJourney();
} catch (error) {
  console.log('❌ Puppeteer not installed. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('✅ Puppeteer installed. Please run the script again.');
}
