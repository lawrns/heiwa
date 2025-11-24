# Production Admin Testing Suite

## Overview

Comprehensive Playwright E2E test suite for testing all admin features on production (`heiwahauz.netlify.app`). The suite includes authentication, dashboard, bookings, bank transfer booking flow, and all other admin features.

## Test Structure

### Configuration Files
- `playwright.production.config.ts` - Production-specific Playwright configuration
- `e2e/fixtures/global-setup.ts` - Global setup for admin authentication
- `e2e/fixtures/admin-auth.ts` - Admin authentication helpers
- `e2e/fixtures/test-data.ts` - Test data templates and generators

### Helper Files
- `e2e/helpers/admin-helpers.ts` - Admin page navigation and operations
- `e2e/helpers/booking-helpers.ts` - Booking widget and bank transfer flow helpers

### Test Files
- `e2e/production-admin-auth.spec.ts` - Authentication tests
- `e2e/production-admin-dashboard.spec.ts` - Dashboard tests
- `e2e/production-admin-bookings.spec.ts` - Bookings management tests
- `e2e/production-bank-transfer-booking.spec.ts` - Bank transfer booking flow tests
- `e2e/production-admin-rooms.spec.ts` - Rooms management tests
- `e2e/production-admin-surf-camps.spec.ts` - Surf camps management tests
- `e2e/production-admin-clients.spec.ts` - Clients management tests
- `e2e/production-admin-calendar.spec.ts` - Calendar tests
- `e2e/production-admin-analytics.spec.ts` - Analytics tests
- `e2e/production-admin-cms.spec.ts` - CMS management tests
- `e2e/production-admin-blog.spec.ts` - Blog management tests
- `e2e/production-admin-activities.spec.ts` - Activities management tests
- `e2e/production-admin-addons.spec.ts` - Add-ons management tests
- `e2e/production-admin-gallery.spec.ts` - Gallery management tests
- `e2e/production-admin-payments.spec.ts` - Payments management tests
- `e2e/production-admin-invoices.spec.ts` - Invoices management tests
- `e2e/production-admin-integration.spec.ts` - Integration tests
- `e2e/production-admin-errors.spec.ts` - Error handling tests
- `e2e/production-admin-performance.spec.ts` - Performance tests

## Running Tests

### Manual Execution

```bash
# Run all production admin tests
npm run test:e2e:production

# Run with UI mode
npm run test:e2e:production:ui

# Run in debug mode
npm run test:e2e:production:debug

# Run specific test file
npx playwright test --config=playwright.production.config.ts e2e/production-admin-auth.spec.ts
```

### Environment Variables

Set these environment variables if needed:
- `ADMIN_PASSWORD` - Admin password (default: `heiwa_admin_2024`)
- `BASE_URL` - Production URL (default: `https://heiwahauz.netlify.app`)

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `innovation` branches
- Pull requests to `main` or `innovation` branches
- Daily at 2 AM UTC (scheduled)
- Manual trigger via `workflow_dispatch`

See `.github/workflows/production-admin-tests.yml` for CI/CD configuration.

## Test Coverage

### Authentication (8 tests)
- Login page display
- Login with correct password
- Reject incorrect password
- Redirect to login for protected routes
- Session persistence
- Cookie handling
- Logout functionality
- Redirect to dashboard after login

### Dashboard (12 tests)
- Page load
- Stat cards display
- Action cards display and navigation
- Sidebar navigation
- Responsive design
- Real-time updates

### Bookings Management (12+ tests)
- Page load
- Table display with columns
- Search functionality
- Filter by status, type, payment status, date range
- Pagination
- View booking details
- Edit booking
- Calendar view toggle
- Real-time updates

### Bank Transfer Booking Flow (7+ tests)
- Complete room booking with bank transfer
- Complete surf week booking with bank transfer
- Bank transfer instructions display
- Multiple bank transfer bookings
- Payment status verification (pending)
- Booking confirmation with ID
- Booking with add-ons

### Other Admin Features
- Rooms Management (7 tests)
- Surf Camps Management (7 tests)
- Clients Management (7 tests)
- Calendar (8 tests)
- Analytics (6 tests)
- CMS Management (6 tests)
- Blog Management (6 tests)
- Activities Management (4 tests)
- Add-ons Management (4 tests)
- Gallery Management (3 tests)
- Payments Management (5 tests)
- Invoices Management (4 tests)

### Integration & Quality Tests
- Integration tests (4 tests)
- Error handling tests (7 tests)
- Performance tests (7 tests)

**Total: ~120+ test cases**

## Key Features Tested

1. **Authentication**: Full login/logout flow with session management
2. **Dashboard**: All stat cards, action cards, and navigation
3. **Bookings**: CRUD operations, search, filters, pagination, real-time updates
4. **Bank Transfer Flow**: Complete booking flow from widget to admin verification
5. **All Admin Pages**: Navigation and basic functionality of all admin sections
6. **Data Consistency**: Cross-page data verification
7. **Error Handling**: Network errors, validation errors, 404 pages
8. **Performance**: Page load times, API response times, large dataset handling

## Test Results

Test results are stored in:
- `test-results-production/` - Test artifacts (screenshots, videos)
- `playwright-report/` - HTML test report

## Notes

- Tests run sequentially to avoid rate limiting on production
- Authentication state is cached in `e2e/.auth/admin.json`
- Tests use production URL: `https://heiwahauz.netlify.app`
- Admin password: `heiwa_admin_2024` (configurable via env var)
- All tests include proper error handling and timeouts
- Screenshots and videos are captured on failure


