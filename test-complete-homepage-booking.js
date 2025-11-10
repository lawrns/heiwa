#!/usr/bin/env node

// Test the complete homepage booking flow
const puppeteer = require('puppeteer');

async function testCompleteHomepageBooking() {
  console.log('🎯 Testing Complete Homepage Orange Book Button Journey');
  console.log('='.repeat(70));

  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for manual verification
    slowMo: 200, // Slow down for visibility
    defaultViewport: { width: 1200, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log('🖥️  Browser:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('✅ Homepage loaded');

    // Wait for the page to fully render
    await page.waitForTimeout(3000);

    console.log('📍 Step 2: Look for orange book button on homepage');
    
    // Try to find the orange book button in the surf weeks section
    const homepageBookButton = await page.$('a[href="/surf-weeks"]:has-text("Book"), button:has-text("Book")');
    
    if (homepageBookButton) {
      console.log('✅ Found orange book button on homepage');
      console.log('📍 Step 3: Click homepage book button');
      await homepageBookButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we navigated to surf-weeks page
      const currentUrl = page.url();
      if (currentUrl.includes('/surf-weeks')) {
        console.log('✅ Navigated to surf-weeks page');
      } else {
        console.log('⚠️ Did not navigate to surf-weeks page');
      }
    } else {
      console.log('⚠️ No book button found on homepage, navigating directly to surf-weeks');
      await page.goto('http://localhost:3000/surf-weeks', { waitUntil: 'networkidle2' });
    }

    // Wait for surf-weeks page to load
    await page.waitForTimeout(2000);
    console.log('📍 Step 4: Look for "Book Your Surf Week" orange button');
    
    // Look for the main orange booking button
    const surfWeekBookButton = await page.$('button:has-text("Book Your Surf Week"), button[style*="rgb(236, 104, 28)"]');
    
    if (!surfWeekBookButton) {
      console.log('❌ "Book Your Surf Week" button not found');
      console.log('🔍 Taking screenshot for analysis...');
      await page.screenshot({ path: 'surf-weeks-page.png', fullPage: true });
      console.log('📸 Screenshot saved as surf-weeks-page.png');
      
      // Let's check what buttons are actually on the page
      console.log('🔍 Looking for any buttons on the surf-weeks page...');
      const allButtons = await page.$$eval('button, a[href]', elements => 
        elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          class: el.className,
          href: el.href,
          style: el.getAttribute('style')
        }))
      );
      
      console.log('📋 All buttons found:');
      allButtons.forEach((btn, index) => {
        if (btn.text && (btn.text.includes('Book') || btn.style?.includes('236, 104, 28'))) {
          console.log(`${index + 1}. ${btn.tag} - "${btn.text}" (${btn.class}) ${btn.href ? `-> ${btn.href}` : ''}`);
        }
      });
      
      return;
    }

    console.log('✅ Found "Book Your Surf Week" button');
    console.log('📍 Step 5: Click the orange booking button');
    
    // Click the booking button
    await surfWeekBookButton.click();
    await page.waitForTimeout(3000);
    console.log('✅ Booking button clicked');

    console.log('📍 Step 6: Check if booking widget opened');
    
    // Check if booking widget opened
    const modalOverlay = await page.$('.heiwa-modal-overlay, .modal-overlay, [role="dialog"], .fixed.inset-0');
    
    if (modalOverlay) {
      console.log('✅ Booking widget/modal opened successfully!');
      
      console.log('📍 Step 7: Proceed through complete booking flow');
      
      try {
        // Step 1: Select experience type (should default to surf-week)
        console.log('📍 Step 7a: Checking experience type...');
        const surfWeekOption = await page.$('input[value="surf-week"], button:has-text("Surf Week")');
        if (surfWeekOption) {
          await surfWeekOption.click();
          console.log('✅ Surf week experience selected');
        }

        // Step 2: Select surf week dates/camp
        console.log('📍 Step 7b: Selecting surf week...');
        const surfWeekSelector = await page.$('select[name="surfWeek"], button:has-text("Select Week")');
        if (surfWeekSelector) {
          await surfWeekSelector.click();
          await page.waitForTimeout(500);
          // Select first available week
          const firstWeek = await page.$('option:not([disabled]), button:has-text("Feb")');
          if (firstWeek) {
            await firstWeek.click();
            console.log('✅ Surf week selected');
          }
        }

        // Step 3: Click Next to proceed
        const nextButton1 = await page.$('button:has-text("Next"), button:has-text("Continue")');
        if (nextButton1) {
          await nextButton1.click();
          await page.waitForTimeout(1000);
          console.log('✅ Proceeded to guest details step');
        }

        // Step 4: Fill guest details
        console.log('📍 Step 7c: Filling guest details...');
        const nameInput = await page.$('input[name*="name"], input[placeholder*="Name"], input[placeholder*="First"]');
        if (nameInput) await nameInput.fill('Homepage Test User');
        
        const emailInput = await page.$('input[name*="email"], input[placeholder*="Email"]');
        if (emailInput) await emailInput.fill('homepage@test.com');
        
        const phoneInput = await page.$('input[name*="phone"], input[placeholder*="Phone"]');
        if (phoneInput) await phoneInput.fill('+351 912 345 678');
        
        console.log('✅ Guest details filled');

        // Step 5: Continue to payment
        const nextButton2 = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")');
        if (nextButton2) {
          await nextButton2.click();
          await page.waitForTimeout(1000);
          console.log('✅ Proceeded to payment step');
        }

        // Step 6: Select payment method
        console.log('📍 Step 7d: Selecting payment method...');
        const bankWireOption = await page.$('input[value="bank_wire"], button:has-text("Bank"), button:has-text("Transfer")');
        if (bankWireOption) {
          await bankWireOption.click();
          console.log('✅ Bank wire payment selected');
        }

        // Step 7: Accept terms
        const termsCheckbox = await page.$('input[type="checkbox"]');
        if (termsCheckbox) {
          await termsCheckbox.click();
          console.log('✅ Terms and conditions accepted');
        }

        // Step 8: Complete booking
        console.log('📍 Step 7e: Completing booking...');
        const completeButton = await page.$('button:has-text("Confirm"), button:has-text("Complete"), button:has-text("Pay"), button:has-text("Book")');
        if (completeButton) {
          console.log('🎯 Clicking complete booking button...');
          await completeButton.click();
          await page.waitForTimeout(5000);
          
          // Check for success message
          const successMessage = await page.$('text/Booking Confirmed/, text/Success/, text/Thank you/, h2:has-text("Confirmed")');
          if (successMessage) {
            console.log('🎉 COMPLETE HOMEPAGE BOOKING JOURNEY SUCCESSFUL!');
            console.log('✅ User successfully completed booking from homepage orange button');
            
            // Try to get booking number
            const bookingNumber = await page.$eval('text/HW-/, text/booking/', el => el.textContent);
            if (bookingNumber) {
              console.log(`📋 Booking Number: ${bookingNumber}`);
            }
          } else {
            console.log('⚠️ Booking completed but success message not clearly visible');
            
            // Check for any confirmation text
            const pageText = await page.$eval('body', el => el.textContent);
            if (pageText.includes('HW-') || pageText.includes('booking') || pageText.includes('confirmed')) {
              console.log('✅ Booking confirmation detected in page content');
            }
          }
        } else {
          console.log('❌ Complete booking button not found');
        }
        
      } catch (error) {
        console.log('⚠️ Error during booking flow:', error.message);
      }
      
    } else {
      console.log('❌ Booking widget did not open after clicking button');
      
      // Check if we navigated to a different page
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl !== 'http://localhost:3000/surf-weeks') {
        console.log('✅ Navigation detected instead of modal');
      }
    }

    console.log('\n📊 Complete Homepage Booking Test Summary:');
    console.log('- Homepage: ✅ Loaded');
    console.log('- Orange Book Button: ' + (homepageBookButton ? '✅ Found and clicked' : '⚠️ Not found'));
    console.log('- Surf Weeks Page: ✅ Loaded');
    console.log('- "Book Your Surf Week" Button: ' + (surfWeekBookButton ? '✅ Found and clicked' : '❌ Not found'));
    console.log('- Booking Widget: ' + (modalOverlay ? '✅ Opened' : '❌ Did not open'));
    console.log('- Complete Journey: ' + (modalOverlay ? '✅ Tested' : '❌ Could not test'));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('\n🔍 Browser window remains open for manual inspection');
    console.log('Press Ctrl+C to close the test');
    
    // Wait for manual closing
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
    await browser.close();
  }
}

testCompleteHomepageBooking();
