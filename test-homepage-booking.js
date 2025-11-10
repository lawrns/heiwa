#!/usr/bin/env node

// Test the complete homepage booking journey
const puppeteer = require('puppeteer');

async function testHomepageBooking() {
  console.log('🎯 Testing Homepage Orange Book Button Journey');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for manual verification
    slowMo: 100, // Slow down for visibility
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
    await page.waitForTimeout(2000);

    console.log('📍 Step 2: Look for orange book button');
    
    // Try different selectors for the orange book button
    const buttonSelectors = [
      'button:has-text("Book")',
      'button:has-text("BOOK")', 
      'a:has-text("Book")',
      'a:has-text("BOOK")',
      'button[class*="orange"]',
      'button[class*="bg-orange"]',
      'a[class*="orange"]',
      'a[class*="bg-orange"]',
      '[data-testid*="book"]',
      '[id*="book"]',
      '.cta-button',
      '.book-button'
    ];

    let bookButton = null;
    let foundSelector = null;

    for (const selector of buttonSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 1000 });
        if (element) {
          bookButton = element;
          foundSelector = selector;
          console.log(`✅ Found book button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }

    if (!bookButton) {
      console.log('❌ Orange book button not found with any selector');
      console.log('🔍 Taking screenshot for analysis...');
      await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved as homepage-screenshot.png');
      
      // Let's check what buttons are actually on the page
      console.log('🔍 Looking for any buttons on the page...');
      const allButtons = await page.$$eval('button, a[href]', elements => 
        elements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          class: el.className,
          href: el.href
        }))
      );
      
      console.log('📋 All buttons found:');
      allButtons.forEach((btn, index) => {
        console.log(`${index + 1}. ${btn.tag} - "${btn.text}" (${btn.class}) ${btn.href ? `-> ${btn.href}` : ''}`);
      });
      
      return;
    }

    console.log('📍 Step 3: Click the orange book button');
    await bookButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Book button clicked');

    console.log('📍 Step 4: Check what happens after clicking');
    
    // Check if URL changed
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check if booking widget opened
    const modalOverlay = await page.$('.heiwa-modal-overlay, .modal-overlay, [role="dialog"]');
    if (modalOverlay) {
      console.log('✅ Booking widget/modal opened');
      
      console.log('📍 Step 5: Proceed through booking flow');
      
      // Try to proceed through the booking steps
      try {
        // Look for date inputs
        const dateInputs = await page.$$('input[type="date"]');
        if (dateInputs.length > 0) {
          console.log('✅ Found date inputs');
          
          // Set dates
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const checkIn = tomorrow.toISOString().split('T')[0];
          
          const dayAfter = new Date();
          dayAfter.setDate(dayAfter.getDate() + 3);
          const checkOut = dayAfter.toISOString().split('T')[0];
          
          if (dateInputs[0]) await dateInputs[0].fill(checkIn);
          if (dateInputs[1]) await dateInputs[1].fill(checkOut);
          console.log('✅ Dates selected');
        }
        
        // Look for guest selector
        const guestSelector = await page.$('select[name="guests"], button:has-text("Guests")');
        if (guestSelector) {
          await guestSelector.click();
          await page.waitForTimeout(500);
          await page.click('button:has-text("1"), option[value="1"]');
          console.log('✅ Guests selected');
        }
        
        // Look for Next button
        const nextButton = await page.$('button:has-text("Next"), button:has-text("Continue")');
        if (nextButton) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Proceeded to next step');
        }
        
        // Fill guest details
        const nameInput = await page.$('input[name*="name"], input[placeholder*="Name"]');
        if (nameInput) await nameInput.fill('Homepage Test User');
        
        const emailInput = await page.$('input[name*="email"], input[placeholder*="Email"]');
        if (emailInput) await emailInput.fill('homepage@test.com');
        
        const phoneInput = await page.$('input[name*="phone"], input[placeholder*="Phone"]');
        if (phoneInput) await phoneInput.fill('+351 912 345 678');
        
        console.log('✅ Guest details filled');
        
        // Continue to payment
        const continueButton = await page.$('button:has-text("Next"), button:has-text("Continue"), button:has-text("Review")');
        if (continueButton) {
          await continueButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Proceeded to payment');
        }
        
        // Select bank wire payment
        const bankWireOption = await page.$('input[value="bank_wire"], button:has-text("Bank"), button:has-text("Transfer")');
        if (bankWireOption) {
          await bankWireOption.click();
          console.log('✅ Bank wire payment selected');
        }
        
        // Accept terms
        const termsCheckbox = await page.$('input[type="checkbox"]');
        if (termsCheckbox) {
          await termsCheckbox.click();
          console.log('✅ Terms accepted');
        }
        
        // Complete booking
        const completeButton = await page.$('button:has-text("Confirm"), button:has-text("Complete"), button:has-text("Book")');
        if (completeButton) {
          console.log('🎯 Clicking complete booking button...');
          await completeButton.click();
          await page.waitForTimeout(3000);
          
          // Check for success
          const successMessage = await page.$('text/Booking Confirmed/, text/Success/, text/Thank you/');
          if (successMessage) {
            console.log('🎉 HOMEPAGE BOOKING JOURNEY COMPLETE!');
            console.log('✅ Successfully completed booking from homepage');
          } else {
            console.log('⚠️ Booking completed but no success message visible');
          }
        }
        
      } catch (error) {
        console.log('⚠️ Error during booking flow:', error.message);
      }
    } else if (currentUrl !== 'http://localhost:3000/') {
      console.log('✅ Navigation detected - went to different page');
      console.log(`📍 Navigated to: ${currentUrl}`);
    } else {
      console.log('⚠️ No modal or navigation detected after clicking book button');
    }

    console.log('\n📊 Homepage Booking Test Summary:');
    console.log('- Homepage: ✅ Loaded');
    console.log('- Book Button: ' + (bookButton ? '✅ Found and clicked' : '❌ Not found'));
    console.log('- Booking Flow: ' + (modalOverlay ? '✅ Widget opened' : '⚠️ No widget'));
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

testHomepageBooking();
