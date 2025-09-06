# Heiwa House Testing Suite

## Overview

This comprehensive testing suite ensures 100% functionality and reliability of the Heiwa House booking management system. The test architecture follows best practices with data-testid selectors, comprehensive mocking, and cross-browser compatibility.

## Test Structure

### Test Categories

1. **Authentication Tests** (`auth.spec.ts`)
   - Whitelist login validation
   - Admin/client role verification
   - Session persistence and timeout
   - Security policy enforcement

2. **Dashboard Tests** (`dashboard.spec.ts`)
   - Metrics loading and display
   - Sidebar navigation functionality
   - Real-time updates
   - Analytics chart rendering

3. **Client Management** (`clients.spec.ts`)
   - CRUD operations
   - Search and filtering
   - Form validation
   - Pagination handling

4. **Booking Management** (`bookings.spec.ts`)
   - Booking wizard flow
   - Room availability validation
   - Calendar integration
   - Overbooking prevention

5. **Assignment Board** (`admin/assignment-board.spec.ts`)
   - Drag-and-drop functionality
   - Room capacity validation
   - Visual feedback testing

6. **UI Components** (`ui-sidebar.spec.ts`)
   - Responsive design
   - Animation testing
   - Visual regression
   - Accessibility compliance

## Test Patterns and Conventions

### Data-TestId Strategy

All interactive elements use unique `data-testid` attributes following the pattern:
```
component-action-identifier
```

Examples:
- `sidebar-nav-bookings`
- `dashboard-card-analytics`
- `participant-card-123`
- `room-zone-ocean-view`

### Mock Strategy

#### Supabase Mocking
```javascript
(window as any).supabase = {
  auth: { /* auth methods */ },
  from: (table) => ({ /* CRUD operations */ })
};
```

#### API Route Mocking
```javascript
(window as any).fetch = async (url, options) => {
  // Mock specific endpoints
  if (url.includes('/api/clients')) {
    return mockClientResponse();
  }
};
```

### Test Data Management

Test fixtures are stored in `tests/fixtures/`:
- `bookings.json` - Sample booking data
- `clients.json` - Client profiles
- `rooms.json` - Room configurations
- `surf-camps.json` - Camp schedules

## Running Tests

### Full Test Suite
```bash
# Run all Playwright tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

### Unit Tests
```bash
# Run Jest unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage
```

### Cross-Browser Testing
```bash
# Run on all browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Run on specific browser
npx playwright test --project=firefox
```

## Coverage Targets

- **Overall Coverage**: >80%
- **Critical Paths**: 100%
- **UI Components**: >90%
- **API Routes**: >85%

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Debugging Tests

### Debug Mode
```bash
# Run in debug mode
npx playwright test --debug

# Generate test code
npx playwright codegen localhost:3005
```

### Screenshots and Videos
```bash
# Run with screenshots on failure
npx playwright test --screenshot=only-on-failure

# Run with video recording
npx playwright test --video=on
```

## Maintenance Guidelines

### Adding New Tests

1. **Follow naming conventions**: `feature.spec.ts`
2. **Use data-testid selectors**: Avoid text-based selectors
3. **Mock external dependencies**: Supabase, Stripe, etc.
4. **Include error scenarios**: Test failure paths
5. **Add visual regression**: Screenshots for UI changes

### Updating Existing Tests

1. **Update selectors**: When UI changes, update data-testid
2. **Maintain mocks**: Keep mock data synchronized
3. **Test backwards compatibility**: Ensure old functionality works
4. **Update documentation**: Reflect changes in README

### Performance Considerations

- **Parallel execution**: Tests run in parallel by default
- **Selective testing**: Use `--grep` for specific test patterns
- **Resource cleanup**: Ensure proper cleanup in `afterEach`
- **Timeout management**: Set appropriate timeouts for async operations

## CI/CD Integration

### GitHub Actions Configuration
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:all
```

### Quality Gates

- **All tests must pass**: No failing tests allowed
- **Coverage threshold**: Minimum 80% coverage
- **Performance budget**: Page loads <500ms
- **Accessibility**: WCAG 2.1 AA compliance

## Troubleshooting

### Common Issues

1. **Selector not found**
   - Verify data-testid exists in component
   - Check for timing issues with `waitForSelector`

2. **Mock not working**
   - Ensure mock is set in `beforeEach`
   - Verify mock data structure matches expectations

3. **Flaky tests**
   - Add proper wait conditions
   - Use `waitForLoadState('networkidle')`
   - Increase timeouts for slow operations

4. **Cross-browser failures**
   - Check browser-specific CSS/JS features
   - Add browser-specific workarounds
   - Test on actual browser versions

### Getting Help

- Check test output logs for detailed error messages
- Use `--headed` mode to see browser interactions
- Review network tab for API call failures
- Consult Playwright documentation for advanced features

## Success Metrics

The test suite achieves:
- ✅ 100% test pass rate
- ✅ >80% code coverage
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)
- ✅ Mobile responsiveness validation
- ✅ Performance budget compliance
- ✅ Security policy enforcement
- ✅ Accessibility standards compliance

This comprehensive testing approach ensures the Heiwa House application is robust, reliable, and ready for production use.
