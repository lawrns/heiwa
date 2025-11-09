// Test script to simulate clicking the BOOK button and test the booking flow
// This script can be run in the browser console on https://heiwa-house-portugal.netlify.app

console.log('🏄‍♂️ Starting Heiwa House Booking Flow Test...');

// Step 1: Find and click the BOOK button
function clickBookButton() {
  console.log('📍 Step 1: Looking for BOOK button...');
  
  // Try different selectors to find the book button
  const bookButton = 
    document.querySelector('button[onclick*="openBooking"]') ||
    document.querySelector('button:contains("BOOK")') ||
    document.querySelector('button') ||
    Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('BOOK') || btn.textContent.includes('Book')
    );
  
  if (bookButton) {
    console.log('✅ Found BOOK button:', bookButton);
    bookButton.click();
    console.log('🎯 Clicked BOOK button!');
    
    // Wait for modal to open
    setTimeout(() => {
      checkBookingModal();
    }, 2000);
  } else {
    console.log('❌ BOOK button not found. Trying to trigger booking widget manually...');
    
    // Try to trigger booking widget manually
    const event = new CustomEvent('openBooking');
    window.dispatchEvent(event);
    
    // Try calling openBooking function if available
    if (typeof window.openBooking === 'function') {
      window.openBooking();
    }
    
    setTimeout(() => {
      checkBookingModal();
    }, 2000);
  }
}

// Step 2: Check if booking modal opened
function checkBookingModal() {
  console.log('📍 Step 2: Checking if booking modal opened...');
  
  const modal = 
    document.querySelector('[class*="modal"]') ||
    document.querySelector('[class*="booking"]') ||
    document.querySelector('.fixed.inset-0') ||
    document.querySelector('[role="dialog"]');
  
  if (modal) {
    console.log('✅ Booking modal found!', modal);
    
    // Start the booking flow test
    setTimeout(() => {
      testBookingFlow();
    }, 1000);
  } else {
    console.log('❌ No booking modal found. Checking for floating widget...');
    
    const floatingWidget = 
      document.querySelector('[class*="widget"]') ||
      document.querySelector('[class*="booking"]');
    
    if (floatingWidget) {
      console.log('✅ Found floating booking widget!');
      testBookingFlow();
    } else {
      console.log('❌ No booking interface found. The booking widget may not be loading.');
    }
  }
}

// Step 3: Test the booking flow
function testBookingFlow() {
  console.log('📍 Step 3: Testing booking flow...');
  
  // Look for experience selection
  const experienceOptions = 
    document.querySelectorAll('button[role="radio"]') ||
    document.querySelectorAll('[class*="experience"]') ||
    document.querySelectorAll('[class*="option"]');
  
  if (experienceOptions.length > 0) {
    console.log(`✅ Found ${experienceOptions.length} experience options`);
    
    // Click the first option (usually Room Booking)
    experienceOptions[0].click();
    console.log('🎯 Selected first experience option');
    
    setTimeout(() => {
      testDateSelection();
    }, 1500);
  } else {
    console.log('❌ No experience options found');
  }
}

// Step 4: Test date selection
function testDateSelection() {
  console.log('📍 Step 4: Testing date selection...');
  
  // Look for calendar or date inputs
  const calendar = 
    document.querySelector('[class*="calendar"]') ||
    document.querySelector('[class*="date"]') ||
    document.querySelector('input[type="date"]');
  
  if (calendar) {
    console.log('✅ Found calendar/date selector');
    
    // Try to select a date (click first available date)
    const availableDates = 
      calendar.querySelectorAll('button:not([disabled])') ||
      calendar.querySelectorAll('[class*="available"]') ||
      calendar.querySelectorAll('td');
    
    if (availableDates.length > 0) {
      availableDates[0].click();
      console.log('🎯 Selected a date');
      
      setTimeout(() => {
        testRoomSelection();
      }, 1500);
    }
  } else {
    console.log('❌ No calendar found');
  }
}

// Step 5: Test room selection
function testRoomSelection() {
  console.log('📍 Step 5: Testing room selection...');
  
  const roomOptions = 
    document.querySelectorAll('[class*="room"]') ||
    document.querySelectorAll('[class*="option"]') ||
    document.querySelectorAll('button');
  
  if (roomOptions.length > 0) {
    // Click first room option
    roomOptions[0].click();
    console.log('🎯 Selected a room');
    
    setTimeout(() => {
      testGuestDetails();
    }, 1500);
  } else {
    console.log('❌ No room options found');
  }
}

// Step 6: Test guest details form
function testGuestDetails() {
  console.log('📍 Step 6: Testing guest details form...');
  
  const nameInput = document.querySelector('input[name*="name"]') || document.querySelector('input[placeholder*="name"]');
  const emailInput = document.querySelector('input[name*="email"]') || document.querySelector('input[placeholder*="email"]');
  const phoneInput = document.querySelector('input[name*="phone"]') || document.querySelector('input[placeholder*="phone"]');
  
  if (nameInput && emailInput && phoneInput) {
    console.log('✅ Found guest details form');
    
    // Fill in test data
    nameInput.value = 'Test User';
    emailInput.value = 'test@example.com';
    phoneInput.value = '+1-555-123-4567';
    
    console.log('🎯 Filled in guest details');
    
    setTimeout(() => {
      testPaymentAndSubmit();
    }, 1000);
  } else {
    console.log('❌ Guest details form not found');
  }
}

// Step 7: Test payment and submit
function testPaymentAndSubmit() {
  console.log('📍 Step 7: Testing payment and submit...');
  
  const submitButton = 
    document.querySelector('button[type="submit"]') ||
    Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Submit') || 
      btn.textContent.includes('Book') ||
      btn.textContent.includes('Confirm')
    );
  
  if (submitButton) {
    console.log('✅ Found submit button');
    
    // Click submit
    submitButton.click();
    console.log('🎯 Clicked submit button!');
    
    setTimeout(() => {
      checkBookingResult();
    }, 3000);
  } else {
    console.log('❌ Submit button not found');
  }
}

// Step 8: Check booking result
function checkBookingResult() {
  console.log('📍 Step 8: Checking booking result...');
  
  const successMessage = 
    document.querySelector('[class*="success"]') ||
    document.querySelector('[class*="confirmation"]') ||
    Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent.includes('success') || 
      el.textContent.includes('confirmed') ||
      el.textContent.includes('booking')
    );
  
  if (successMessage) {
    console.log('✅ Booking appears to be successful!');
    console.log('🎉 Booking flow test completed!');
  } else {
    console.log('❌ No success message found');
    
    // Check for error messages
    const errorMessage = 
      document.querySelector('[class*="error"]') ||
      Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent.includes('error') || 
        el.textContent.includes('failed')
      );
    
    if (errorMessage) {
      console.log('❌ Error found:', errorMessage.textContent);
    }
  }
}

// Start the test
console.log('🚀 Starting automated booking test in 3 seconds...');
setTimeout(clickBookButton, 3000);

// Also provide manual instructions
console.log('📋 Manual Test Instructions:');
console.log('1. Click the orange "BOOK" button in the top right navigation');
console.log('2. Select "Room Booking" or "Surf Week"');
console.log('3. Choose available dates from the calendar');
console.log('4. Select a room or surf week package');
console.log('5. Add any add-ons if desired');
console.log('6. Fill in guest details (name, email, phone)');
console.log('7. Review booking summary');
console.log('8. Select payment method');
console.log('9. Submit booking');
console.log('10. Check for confirmation message');
