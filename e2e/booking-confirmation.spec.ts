import { test, expect } from '@playwright/test'

test.describe('Booking Confirmation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should display booking confirmation after successful payment', async ({ page }) => {
    // Complete a booking (simplified flow)
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock quick completion
    await page.evaluate(() => {
      // Simulate successful booking
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        total: 150,
        guestName: 'Test User',
        email: 'test@example.com'
      }
      
      // Store booking data
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      // Trigger confirmation view
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    // Wait for confirmation page
    await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 5000 })
    
    // Verify confirmation elements
    await expect(page.locator('[data-testid="confirmation-header"]')).toContainText('Booking Confirmed')
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()
    await expect(page.locator('[data-testid="guest-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-status"]')).toContainText('Paid')
    
    // Verify booking details
    await expect(page.locator('[data-testid="experience-type"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-dates"]')).toBeVisible()
    await expect(page.locator('[data-testid="room-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible()
  })

  test('should send confirmation email', async ({ page }) => {
    // Complete booking
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock booking completion
    await page.evaluate(() => {
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        email: 'test@example.com',
        guestName: 'Email Test'
      }
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Click send confirmation email
    await page.click('[data-testid="send-confirmation-email"]')
    
    // Verify email sent confirmation
    await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-sent-message"]')).toContainText('test@example.com')
  })

  test('should handle booking cancellation from confirmation page', async ({ page }) => {
    // Complete booking
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock booking completion
    await page.evaluate(() => {
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        email: 'test@example.com',
        guestName: 'Cancel Test'
      }
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Click cancel booking
    await page.click('[data-testid="cancel-booking"]')
    
    // Verify cancellation modal
    await expect(page.locator('[data-testid="cancellation-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="cancellation-warning"]')).toBeVisible()
    
    // Confirm cancellation
    await page.click('[data-testid="confirm-cancellation"]')
    
    // Verify cancellation processed
    await expect(page.locator('[data-testid="cancellation-confirmed"]')).toBeVisible()
    await expect(page.locator('[data-testid="refund-info"]')).toBeVisible()
  })

  test('should allow booking modification from confirmation page', async ({ page }) => {
    // Complete booking
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock booking completion
    await page.evaluate(() => {
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        email: 'test@example.com',
        guestName: 'Modify Test',
        dates: ['2025-01-20', '2025-01-27'],
        room: 'Standard Room'
      }
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Click modify booking
    await page.click('[data-testid="modify-booking"]')
    
    // Verify modification options
    await expect(page.locator('[data-testid="modification-options"]')).toBeVisible()
    await expect(page.locator('[data-testid="change-dates"]')).toBeVisible()
    await expect(page.locator('[data-testid="change-room"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-services"]')).toBeVisible()
    
    // Try to change dates
    await page.click('[data-testid="change-dates"]')
    await expect(page.locator('[data-testid="date-modification"]')).toBeVisible()
    
    // Select new dates
    await page.click('[data-testid="new-date-selection"]')
    await page.click('[data-testid="confirm-date-change"]')
    
    // Verify modification processed
    await expect(page.locator('[data-testid="modification-confirmed"]')).toBeVisible()
    await expect(page.locator('[data-testid="price-adjustment"]')).toBeVisible()
  })

  test('should display important booking information clearly', async ({ page }) => {
    // Complete booking with detailed information
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock detailed booking
    await page.evaluate(() => {
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        guestName: 'Detailed Test',
        email: 'detailed@example.com',
        phone: '+351912345678',
        experience: 'Surf Week Package',
        dates: {
          checkIn: '2025-01-20',
          checkOut: '2025-01-27'
        },
        room: {
          name: 'Ocean View Room',
          capacity: 2,
          pricePerNight: 75
        },
        addOns: [
          { name: 'Airport Transfer', price: 30 },
          { name: 'Surf Lessons', price: 50 }
        ],
        pricing: {
          subtotal: 525,
          addons: 80,
          total: 605,
          paid: 605,
          balance: 0
        },
        checkInInfo: {
          time: '15:00',
          instructions: 'Check in at reception'
        },
        policies: {
          cancellation: '24 hours notice',
          payment: 'Full payment required'
        }
      }
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Verify all important information is displayed
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()
    await expect(page.locator('[data-testid="guest-contact-info"]')).toBeVisible()
    await expect(page.locator('[data-testid="experience-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="accommodation-details"]')).toBeVisible()
    await expect(page.locator("[data-testid='additional-services']")).toBeVisible()
    await expect(page.locator('[data-testid="pricing-breakdown"]')).toBeVisible()
    await expect(page.locator('[data-testid="check-in-instructions"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-policies"]')).toBeVisible()
    
    // Verify pricing details
    await expect(page.locator('[data-testid="room-subtotal"]')).toContainText('525')
    await expect(page.locator('[data-testid="addons-total"]')).toContainText('80')
    await expect(page.locator('[data-testid="grand-total"]')).toContainText('605')
    await expect(page.locator('[data-testid="amount-paid"]')).toContainText('605')
    await expect(page.locator('[data-testid="remaining-balance"]')).toContainText('0')
  })

  test('should provide download booking confirmation option', async ({ page }) => {
    // Complete booking
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock booking completion
    await page.evaluate(() => {
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        guestName: 'Download Test'
      }
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Click download confirmation
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="download-confirmation"]')
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toContain('booking-confirmation')
  })

  test('should handle sharing booking confirmation', async ({ page }) => {
    // Complete booking
    await page.click('[data-testid="booking-widget-trigger"]')
    await page.click('[data-testid="surf-week-option"]')
    await page.click('[data-testid="next-step"]')
    
    // Mock booking completion
    await page.evaluate(() => {
      const bookingData = {
        id: 'BK-' + Date.now(),
        status: 'confirmed',
        guestName: 'Share Test'
      }
      localStorage.setItem('lastBooking', JSON.stringify(bookingData))
      
      const event = new CustomEvent('bookingCompleted', { detail: bookingData })
      window.dispatchEvent(event)
    })
    
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Test share options
    await page.click('[data-testid="share-booking"]')
    
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="share-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="share-whatsapp"]')).toBeVisible()
    await expect(page.locator('[data-testid="copy-link"]')).toBeVisible()
    
    // Test copy link
    await page.click('[data-testid="copy-link"]')
    await expect(page.locator('[data-testid="link-copied"]')).toBeVisible()
  })
})
