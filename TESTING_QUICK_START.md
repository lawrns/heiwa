# 🚀 Testing Quick Start Guide

## Installation

```bash
# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Component Tests (Jest)
```bash
# Run all component tests
npm test

# Run specific component test
npm test -- __tests__/components/BookingWidget.test.tsx

# Run with coverage
npm test -- --coverage
```

### Integration Tests (Jest)
```bash
# Run all integration tests
npm test -- __tests__/integration/

# Run specific integration test
npm test -- __tests__/integration/api-bookings.test.ts
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npx playwright test

# Run specific E2E test file
npx playwright test e2e/booking-widget-flow.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run with headed browser (see browser window)
npx playwright test --headed

# Run specific test
npx playwright test -g "should complete full booking flow"
```

## Test Files Location

```
/Users/lukatenbosch/Downloads/heiwahouse/heiwa-page/
├── e2e/
│   ├── booking-widget-flow.spec.ts
│   ├── booking-payment.spec.ts
│   ├── booking-confirmation.spec.ts
│   ├── admin-bookings-crud.spec.ts
│   ├── admin-bookings-search.spec.ts
│   └── admin-bookings-realtime.spec.ts
├── __tests__/
│   ├── components/
│   │   └── BookingWidget.test.tsx
│   └── integration/
│       └── api-bookings.test.ts
└── playwright.config.ts
```

## Configuration Files

- **Jest Config**: `jest.config.js`
- **Playwright Config**: `playwright.config.ts`
- **TypeScript Config**: `tsconfig.json`

## Common Issues & Solutions

### Issue: "Cannot find module '@testing-library/dom'"
**Solution**: 
```bash
npm install --save-dev @testing-library/dom --legacy-peer-deps
```

### Issue: "Playwright browsers not found"
**Solution**:
```bash
npx playwright install
```

### Issue: "Port 3000 already in use"
**Solution**: Change port in `playwright.config.ts` or kill existing process

### Issue: "Tests timeout"
**Solution**: Increase timeout in test file or config:
```typescript
test.setTimeout(60000) // 60 seconds
```

## Test Debugging

### Debug Component Tests
```bash
npm test -- --detectOpenHandles --forceExit
```

### Debug E2E Tests
```bash
npx playwright test --debug
```

### View Test Report
```bash
npx playwright show-report
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Component Tests
  run: npm test

- name: Run E2E Tests
  run: npx playwright test
```

## Documentation

- **Full Status**: See `FINAL_TEST_STATUS.md`
- **Implementation Summary**: See `TEST_IMPLEMENTATION_SUMMARY.md`
- **Phase 1 Status**: See `TESTING_PHASE_1_STATUS.md`

## Support

For issues or questions about the tests, refer to:
- Playwright docs: https://playwright.dev
- Jest docs: https://jestjs.io
- React Testing Library: https://testing-library.com/react
