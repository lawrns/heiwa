const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to login...');
  await page.goto('https://heiwahauz.netlify.app/admin/login', { waitUntil: 'networkidle2', timeout: 60000 });
  console.log('Page title:', await page.title());
  
  // Wait for password input to appear
  console.log('Waiting for login form...');
  await page.waitForSelector('input[type="password"]', { timeout: 15000 });
  await page.screenshot({ path: '/tmp/1-login.png' });
  
  // Login
  console.log('Entering password...');
  await page.type('input[type="password"]', 'heiwa_secure_admin_2025');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  console.log('Waiting for dashboard...');
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: '/tmp/2-dashboard.png' });
  console.log('After login URL:', page.url());
  
  // Calendar
  console.log('\n--- CALENDAR ---');
  await page.goto('https://heiwahauz.netlify.app/admin/calendar', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/3-calendar.png', fullPage: true });
  console.log('Calendar screenshot saved');
  
  // Check page content for room bookings
  const calendarContent = await page.content();
  const hasRoomText = calendarContent.includes('Room') || calendarContent.includes('room');
  console.log('Calendar has Room text:', hasRoomText);
  
  // Bookings
  console.log('\n--- BOOKINGS LIST ---');
  await page.goto('https://heiwahauz.netlify.app/admin/bookings', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/4-bookings.png', fullPage: true });
  
  // New Booking
  console.log('\n--- NEW BOOKING FORM ---');
  await page.goto('https://heiwahauz.netlify.app/admin/bookings/new', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/5-new-booking.png', fullPage: true });
  
  // Check for status fields
  const newBookingContent = await page.content();
  console.log('Has status dropdown:', newBookingContent.includes('status') || newBookingContent.includes('Status'));
  console.log('Has payment status:', newBookingContent.includes('payment') || newBookingContent.includes('Payment'));
  
  // Surf Camps
  console.log('\n--- SURF CAMPS ---');
  await page.goto('https://heiwahauz.netlify.app/admin/surf-camps', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/6-surf-camps.png', fullPage: true });
  
  // Click first edit link if available
  const editLinks = await page.$$('a[href*="/edit"]');
  if (editLinks.length > 0) {
    console.log('Clicking edit on first surf camp...');
    await editLinks[0].click();
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: '/tmp/7-surf-camp-edit.png', fullPage: true });
    
    const editContent = await page.content();
    console.log('Has steps field:', editContent.includes('step') || editContent.includes('Step'));
    console.log('Has add-ons:', editContent.includes('add-on') || editContent.includes('Add-on'));
    console.log('Has gallery title:', editContent.includes('gallery') && editContent.includes('title'));
  }
  
  // Public Rooms Page
  console.log('\n--- PUBLIC ROOMS PAGE ---');
  await page.goto('https://heiwahauz.netlify.app/rooms', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/8-rooms.png', fullPage: true });
  
  // Try to find and click book button
  const bookButtons = await page.$$('button');
  for (const btn of bookButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.toLowerCase().includes('book')) {
      console.log('Found book button, clicking...');
      await btn.click();
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: '/tmp/9-booking-widget.png', fullPage: true });
      
      const widgetContent = await page.content();
      console.log('Widget has price:', widgetContent.includes('€') || widgetContent.includes('EUR'));
      console.log('Widget has arrows:', widgetContent.includes('ArrowLeft') || widgetContent.includes('arrow'));
      break;
    }
  }
  
  await browser.close();
  console.log('\n✅ Done! Screenshots in /tmp/');
})();
