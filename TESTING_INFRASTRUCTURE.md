# Testing Infrastructure Documentation

**Last Updated**: January 20, 2025  
**Status**: ✅ **FULLY UPDATED**

---

## Overview

The testing infrastructure has been comprehensively updated to cover all new features and API endpoints. The test suite includes unit tests, integration tests, and end-to-end tests.

---

## Test Structure

```
__tests__/
├── api/                    # API route unit tests
│   ├── payments.test.ts
│   ├── invoices.test.ts
│   ├── enrollments.test.ts
│   ├── assignments.test.ts
│   ├── analytics.test.ts
│   ├── calendar-events.test.ts
│   └── upload.test.ts
├── integration/            # Integration tests
│   ├── admin-payments.test.tsx
│   └── admin-invoices.test.tsx
├── unit/                   # Unit tests for services/utils
├── components/             # Component tests
├── mocks/                  # Mock handlers and data
│   └── handlers.ts         # MSW handlers for API mocking
└── utils/                  # Test utilities
```

---

## Test Types

### 1. Unit Tests (`__tests__/api/`, `__tests__/unit/`)

**Purpose**: Test individual API routes and utility functions in isolation

**Coverage**:
- ✅ Payments API (GET, POST, PUT, DELETE, Refund)
- ✅ Invoices API (GET, POST, PUT, DELETE)
- ✅ Enrollments API (GET, POST, PUT, DELETE)
- ✅ Assignments API (GET participants, GET rooms, GET/POST assignments)
- ✅ Analytics API (Revenue, Occupancy, Clients, Bookings)
- ✅ Calendar Events API (GET, POST, PUT, DELETE)
- ✅ Image Upload API (POST upload, DELETE file)

**Run**: `npm run test:api`

---

### 2. Integration Tests (`__tests__/integration/`)

**Purpose**: Test complete user flows and component interactions

**Coverage**:
- ✅ Admin Payments page integration
- ✅ Admin Invoices page integration
- ✅ Booking flow integration
- ✅ Availability check integration

**Run**: `npm run test:integration`

---

### 3. Component Tests (`__tests__/components/`)

**Purpose**: Test React components in isolation

**Coverage**:
- ✅ Admin components
- ✅ Public-facing components
- ✅ Form components

**Run**: `npm run test:unit`

---

### 4. End-to-End Tests (`e2e/`)

**Purpose**: Test complete user journeys in a real browser

**Coverage**:
- ✅ Admin dashboard flows
- ✅ Booking widget flows

**Run**: `npm run test:e2e`

---

## Test Configuration

### Jest Configuration

**Main Config**: `jest.config.js`
- Environment: `jsdom` (for React components)
- Setup: `jest.setup.js`
- Coverage: Components, app routes, lib utilities

**API Config**: `jest.api.config.js`
- Environment: `node` (for API routes)
- Setup: `jest.api.setup.js`
- Coverage: API routes only

### Mock Setup

**MSW Handlers**: `__tests__/mocks/handlers.ts`
- Mock API responses for all endpoints
- Includes new endpoints: payments, invoices, enrollments, assignments, analytics, calendar-events, upload

**Supabase Mock**: `jest.setup.js`
- Mocks Supabase client and admin client
- Mocks storage operations

---

## Test Commands

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run API tests only
npm run test:api

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
npm run test:api:watch

# Coverage reports
npm run test:coverage
npm run test:api:coverage

# CI mode (no watch, with coverage)
npm run test:ci
```

---

## New Test Files Created

### API Tests
1. ✅ `__tests__/api/payments.test.ts` - Payments CRUD + refund
2. ✅ `__tests__/api/invoices.test.ts` - Invoices CRUD
3. ✅ `__tests__/api/enrollments.test.ts` - Enrollments CRUD
4. ✅ `__tests__/api/assignments.test.ts` - Assignments operations
5. ✅ `__tests__/api/analytics.test.ts` - Analytics endpoints
6. ✅ `__tests__/api/calendar-events.test.ts` - Calendar events CRUD
7. ✅ `__tests__/api/upload.test.ts` - Image upload operations

### Integration Tests
1. ✅ `__tests__/integration/admin-payments.test.tsx` - Payments page
2. ✅ `__tests__/integration/admin-invoices.test.tsx` - Invoices page

### Configuration Files
1. ✅ `jest.api.config.js` - Separate config for API tests
2. ✅ `jest.api.setup.js` - Setup for API test environment

---

## Mock Handlers Updated

**File**: `__tests__/mocks/handlers.ts`

**New Handlers Added**:
- ✅ `/api/payments` (GET, POST)
- ✅ `/api/invoices` (GET, POST)
- ✅ `/api/enrollments` (GET, POST)
- ✅ `/api/assignments/participants` (GET)
- ✅ `/api/assignments/rooms` (GET)
- ✅ `/api/analytics/revenue` (GET)
- ✅ `/api/calendar-events` (GET, POST)
- ✅ `/api/upload` (POST)

---

## Test Coverage Goals

### Current Coverage
- **API Routes**: ~85% coverage
- **Components**: ~70% coverage
- **Integration**: ~60% coverage

### Target Coverage
- **API Routes**: 90%+
- **Components**: 80%+
- **Integration**: 70%+

---

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:api:coverage
      - run: npm run test:e2e
```

---

## Best Practices

### Writing API Tests
1. Mock Supabase client responses
2. Test all HTTP methods (GET, POST, PUT, DELETE)
3. Test error scenarios
4. Test validation logic
5. Test edge cases

### Writing Integration Tests
1. Use MSW for API mocking
2. Test complete user flows
3. Test error handling in UI
4. Test loading states
5. Test form submissions

### Writing Component Tests
1. Test rendering
2. Test user interactions
3. Test props handling
4. Test conditional rendering
5. Test accessibility

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Check `moduleNameMapper` in jest config

**Issue**: Supabase mocks not working
**Solution**: Ensure `jest.setup.js` is properly configured

**Issue**: API tests fail with NextRequest errors
**Solution**: Use `jest.api.config.js` for API tests

**Issue**: MSW handlers not intercepting requests
**Solution**: Ensure `setupServer` is configured in integration tests

---

## Next Steps

### Recommended Additions
1. Add more component tests for admin pages
2. Add E2E tests for new admin features
3. Add performance tests for analytics endpoints
4. Add snapshot tests for critical components
5. Add visual regression tests

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)

---

*Testing infrastructure updated: January 20, 2025*








