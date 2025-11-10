# Testing Guide - Admin Panel

## Overview

This document outlines the comprehensive testing infrastructure for the Heiwa House admin panel. The testing suite includes unit tests, integration tests, and component tests to ensure code quality and reliability.

## Testing Stack

- **Framework**: Jest 30.2.0
- **React Testing Library**: 16.3.0
- **Test Environment**: jest-environment-jsdom
- **Mocking**: MSW (Mock Service Worker)
- **E2E Testing**: Playwright 1.56.1

## Test Structure

```
__tests__/
├── admin/                    # Admin page tests
│   └── page.test.tsx        # Dashboard page tests
├── components/              # Component tests
│   └── admin/
│       └── StatCard.test.tsx
├── hooks/                   # Hook tests
│   └── useBookingsRealtime.test.ts
├── integration/             # Integration tests
│   └── admin-pages.test.tsx
└── utils/                   # Utility function tests
    ├── filters.test.ts
    ├── pagination.test.ts
    └── validation.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in CI mode
```bash
npm run test:ci
```

## Test Coverage

Current coverage targets:
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Statements**: 100%

## Test Categories

### 1. Unit Tests

Unit tests focus on individual functions and components in isolation.

#### Component Tests
- **StatCard Component** (`__tests__/components/admin/StatCard.test.tsx`)
  - Renders with title and value
  - Displays trends correctly
  - Supports custom colors
  - Handles optional props

#### Utility Tests
- **Filters** (`__tests__/utils/filters.test.ts`)
  - Search filtering
  - Status filtering
  - Combined filters
  
- **Pagination** (`__tests__/utils/pagination.test.ts`)
  - Page count calculation
  - Item slicing
  - URL state management
  
- **Validation** (`__tests__/utils/validation.test.ts`)
  - Email validation
  - Phone validation
  - Name validation
  - Price validation
  - Date validation
  - Status validation

### 2. Integration Tests

Integration tests verify that multiple components work together correctly.

#### Admin Pages Integration (`__tests__/integration/admin-pages.test.tsx`)
- **Clients Page**
  - Renders without crashing
  - Search functionality
  - Status filtering

- **Rooms Page**
  - Renders without crashing
  - Search and filter functionality

- **Surf Camps Page**
  - Renders without crashing
  - Level filtering

- **Activities Page**
  - Renders without crashing
  - Category filtering

- **Add-ons Page**
  - Renders without crashing
  - Category filtering

### 3. Hook Tests

Hook tests verify custom React hooks work correctly.

#### useBookingsRealtime Hook (`__tests__/hooks/useBookingsRealtime.test.ts`)
- Initializes with empty bookings
- Handles INSERT events
- Handles UPDATE events
- Handles DELETE events
- Cleans up subscription on unmount

## Writing Tests

### Component Test Example

```typescript
import { render } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { container } = render(<MyComponent />)
    expect(container.textContent).toContain('Expected text')
  })
})
```

### Utility Test Example

```typescript
describe('myUtility', () => {
  it('performs expected operation', () => {
    const result = myUtility(input)
    expect(result).toBe(expectedOutput)
  })
})
```

## Mocking

### Mocking Next.js Router

```typescript
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
}))
```

### Mocking Supabase

```typescript
jest.mock('./lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}))
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Test user interactions and outcomes

2. **Keep Tests Focused**
   - One assertion per test when possible
   - Use descriptive test names

3. **Use Meaningful Assertions**
   - Avoid vague assertions
   - Use specific matchers

4. **Mock External Dependencies**
   - Mock API calls
   - Mock router navigation
   - Mock Supabase interactions

5. **Test Edge Cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary conditions

## Coverage Goals

### Current Coverage
- Components: 85%+
- Utilities: 95%+
- Hooks: 80%+
- Integration: 90%+

### Target Coverage
- Overall: 90%+
- Critical paths: 100%
- Admin pages: 95%+

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

### CI Configuration

```bash
npm run test:ci
```

This runs tests with:
- Coverage reporting
- No watch mode
- CI-specific optimizations

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
- **Solution**: Check import paths and aliases in jest.config.js

**Issue**: Tests timeout
- **Solution**: Increase timeout or check for unresolved promises

**Issue**: Mock not working
- **Solution**: Ensure mock is defined before import

## Future Improvements

1. Add E2E tests with Playwright
2. Increase coverage to 95%+
3. Add performance benchmarks
4. Add visual regression tests
5. Add accessibility tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contact

For questions about testing, please refer to the project documentation or contact the development team.
