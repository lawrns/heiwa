# Implementation Plan: Comprehensive Testing

## Overview

This implementation plan establishes comprehensive test coverage for the Heiwa surf retreat booking platform. Tasks are organized to build foundational test infrastructure first, then progressively add unit tests, property-based tests, integration tests, and specialized tests (smoke, accessibility, visual regression).

## Tasks

- [x] 1. Set up test infrastructure and utilities
  - [x] 1.1 Create test helper utilities and mock factories
    - Create `tests/utils/test-helpers.ts` with mock factories for Booking, Room, Client, Payment
    - Create `tests/utils/render-helpers.tsx` with renderWithProviders and renderWithRouter
    - Create `tests/utils/api-mocks.ts` with mockApiResponse and mockApiError utilities
    - _Requirements: 1.7, 12.5_

  - [x] 1.2 Create property-based test generators
    - Create `tests/utils/generators.ts` with fast-check arbitraries
    - Implement validBookingArb, validDateRangeArb, validPriceArb, validEmailArb generators
    - Implement invalidBookingArb, invalidEmailArb generators for error testing
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 1.3 Update Jest configuration for comprehensive coverage
    - Update `jest.config.js` with coverage thresholds (80% global, 90% utilities)
    - Add test projects for unit, integration, and property tests
    - Configure JUnit XML reporter for CI integration
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 2. Implement core service unit tests
  - [x] 2.1 Create booking-service unit tests
    - Create `tests/unit/lib/booking-service.test.ts`
    - Test submitBooking with valid/invalid data
    - Test validateBooking for all validation rules
    - Test calculateEstimatedCost for correct calculations
    - Test error handling for network failures
    - _Requirements: 1.1, 1.5, 1.6_

  - [x]* 2.2 Write property test for booking validation completeness
    - **Property 1: Booking Validation Completeness**
    - *For any* booking with missing required fields, validation SHALL return isValid: false with all missing fields in errors
    - **Validates: Requirements 1.5, 1.6**

  - [x] 2.3 Create email-service unit tests
    - Create `tests/unit/lib/email-service.test.ts`
    - Test sendEmail with valid options
    - Test all email template rendering (booking confirmation, invoice, payment, etc.)
    - Test htmlToText conversion
    - Test error handling for missing API key
    - _Requirements: 1.2, 1.5_

  - [x] 2.4 Create stripe integration unit tests
    - Create `tests/unit/lib/stripe.test.ts`
    - Test Stripe client initialization
    - Test payment intent creation (mocked)
    - Test webhook signature verification
    - _Requirements: 1.3, 1.5_

  - [x] 2.5 Create rate-limiter unit tests
    - Create `tests/unit/lib/rate-limiter.test.ts`
    - Test request counting and threshold enforcement
    - Test rate limit reset after window expires
    - Test concurrent request handling
    - _Requirements: 1.4, 1.5_

- [x] 3. Checkpoint - Core service tests
  - Ensure all service tests pass
  - Verify coverage meets 80% threshold for lib/
  - Ask user if questions arise

- [-] 4. Implement utility function unit tests
  - [x] 4.1 Create booking-utils unit tests
    - Create `tests/unit/lib/booking-utils.test.ts`
    - Test determineRoomType for all booking types
    - Test isValidImageUrl for valid/invalid URLs
    - Test processRoomImages for all scenarios
    - Test transformApiRoomToRoom transformation
    - Test validateBookingSubmission for all validation rules
    - _Requirements: 2.1, 2.6_

  - [x]* 4.2 Write property test for date range validity
    - **Property 2: Date Range Validity**
    - *For any* valid date range where checkOut > checkIn, calculateEstimatedCost SHALL return positive nights
    - **Validates: Requirements 2.1, 2.3**

  - [x]* 4.3 Write property test for price formatting round-trip
    - **Property 4: Price Formatting Round-Trip**
    - *For any* valid price and currency, formatting then parsing SHALL produce original value
    - **Validates: Requirements 2.1, 4.3**

  - [x]* 4.4 Write property test for room image processing idempotence
    - **Property 5: Room Image Processing Idempotence**
    - *For any* room with valid images, processRoomImages called multiple times SHALL produce identical output
    - **Validates: Requirements 2.2, 4.7**

  - [x] 4.5 Create image-utils unit tests
    - Create `tests/unit/lib/image-utils.test.ts`
    - Test URL transformation functions
    - Test image validation rules
    - Test fallback image selection
    - _Requirements: 2.2, 2.6_

  - [x] 4.6 Create date-helpers unit tests
    - Create `tests/unit/lib/utils/date-helpers.test.ts`
    - Test date formatting functions
    - Test timezone handling
    - Test date range calculations
    - _Requirements: 2.3, 2.6_

  - [x] 4.7 Create cms-validators unit tests
    - Create `tests/unit/lib/cms-validators.test.ts`
    - Test content validation rules
    - Test schema validation
    - Test error message generation
    - _Requirements: 2.5, 2.6_

- [x] 5. Checkpoint - Utility tests
  - Ensure all utility tests pass
  - Verify coverage meets 90% threshold for utilities
  - Ask user if questions arise

- [-] 6. Implement UI component unit tests
  - [x] 6.1 Create Button component tests
    - Create `tests/unit/components/ui/button.test.tsx`
    - Test rendering with all variants (default, destructive, outline, secondary, ghost, link)
    - Test rendering with all sizes (default, sm, lg, icon)
    - Test click handler invocation
    - Test disabled state
    - Test asChild prop behavior
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x]* 6.2 Write property test for component render stability
    - **Property 9: Component Render Stability**
    - *For any* UI component with valid props, rendering SHALL not throw and SHALL produce non-null result
    - **Validates: Requirements 3.2, 3.5**

  - [x] 6.3 Create Input component tests
    - Create `tests/unit/components/ui/input.test.tsx`
    - Test rendering with different types (text, email, password, number)
    - Test value changes and onChange handler
    - Test disabled and readonly states
    - Test placeholder display
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 6.4 Create Select component tests
    - Create `tests/unit/components/ui/select.test.tsx`
    - Test rendering with options
    - Test selection changes
    - Test disabled state
    - Test placeholder display
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 6.5 Create Form component tests (30 tests)
    - Create `tests/unit/components/ui/form.test.tsx`
    - Test form field rendering
    - Test validation message display
    - Test form submission
    - _Requirements: 3.1, 3.4, 3.5_

  - [x] 6.6 Create Dialog component tests
    - Create `tests/unit/components/ui/dialog.test.tsx`
    - Test open/close behavior
    - Test content rendering
    - Test keyboard interactions (Escape to close)
    - _Requirements: 3.1, 3.4_

  - [x] 6.7 Create Calendar component tests (37 tests)
    - Create `tests/unit/components/ui/calendar.test.tsx`
    - Test date selection
    - Test month navigation
    - Test disabled dates
    - _Requirements: 3.1, 3.4, 9.2_

- [x] 7. Checkpoint - UI component tests (514 passing, 1 pre-existing failure)
  - Ensure all UI component tests pass
  - Verify coverage meets 80% threshold for components/ui/
  - Ask user if questions arise

- [-] 8. Implement BookingWidget tests
  - [x] 8.1 Create BookingWidget main component tests (22 tests)
    - Create `tests/unit/components/booking-widget/BookingWidget.test.tsx`
    - Test initial render state
    - Test step navigation
    - Test experience type selection
    - Test form state management
    - _Requirements: 9.1, 9.4_

  - [x]* 8.2 Write property test for booking widget validation
    - **Property 7: Guest Details Validation Consistency**
    - *For any* guest details array, validation SHALL pass if all required fields present, fail otherwise
    - **Validates: Requirements 9.3, 9.5**

  - [x]* 8.3 Write property test for validation error messages
    - **Property 6: Validation Error Message Completeness**
    - *For any* validation result with errors, getValidationErrorMessage SHALL return non-empty string
    - **Validates: Requirements 1.6, 11.3**

  - [x] 8.4 Create DatePicker component tests
    - Create `tests/unit/components/booking-widget/GuestDetails.test.tsx`
    - Test guest form rendering and validation
    - Test input handling and state sync
    - Test save functionality and completion status
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 8.5 Create GuestSelector component tests
    - Create `tests/unit/components/booking-widget/OptionSelection.test.tsx`
    - Test date selection and guest count adjustment
    - Test room/surf week selection
    - Test pricing calculations
    - _Requirements: 9.1, 9.3_

  - [x] 8.6 Create RoomSelector component tests
    - Create `tests/unit/components/booking-widget/ReviewAndPay.test.tsx`
    - Test booking summary display
    - Test payment method selection
    - Test form submission
    - _Requirements: 9.1, 9.4_

  - [x] 8.7 Create PaymentStep component tests
    - Create `tests/unit/components/booking-widget/PaymentMethodSelector.test.tsx`
    - Test payment method options
    - Test selection handling
    - _Requirements: 9.1, 9.5_

- [x] 9. Checkpoint - BookingWidget tests
  - Ensure all BookingWidget tests pass
  - Verify coverage meets 80% threshold
  - Ask user if questions arise

- [-] 10. Implement API route integration tests
  - [x] 10.1 Create bookings API tests (15 tests)
    - Create `tests/integration/api/bookings.test.ts`
    - Test POST /api/bookings with valid data
    - Test POST /api/bookings with invalid data
    - Test GET /api/bookings with authentication
    - Test error responses
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x]* 10.2 Write property test for API response shape
    - **Property 8: API Response Shape Consistency**
    - *For any* API response, success responses SHALL have success: true and data; errors SHALL have success: false and error
    - **Validates: Requirements 5.2, 5.3**

  - [x] 10.3 Create rooms API tests (11 tests)
    - Create `tests/integration/api/rooms.test.ts`
    - Test GET /api/rooms
    - Test room availability endpoint
    - Test error handling
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.4 Create payments API tests
    - Create `tests/integration/api/payments.test.ts`
    - Test payment intent creation
    - Test webhook handling
    - Test error scenarios
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.5 Create admin API tests
    - Create `tests/integration/api/admin.test.ts`
    - Test authentication requirements
    - Test CRUD operations
    - Test authorization checks
    - _Requirements: 5.1, 5.4, 10.7_

- [x] 11. Checkpoint - API integration tests
  - Ensure all API tests pass
  - Verify coverage meets 80% threshold for app/api/
  - Ask user if questions arise

- [x] 12. Implement admin component tests
  - [x] 12.1 Create BookingTable component tests
    - Create `tests/unit/components/admin/AdminTable.test.tsx`
    - Test table rendering with data
    - Test sorting functionality
    - Test filtering functionality
    - Test row actions
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 12.2 Create AdminDashboard component tests
    - Create `tests/unit/components/admin/StatCard.test.tsx`
    - Test dashboard rendering
    - Test statistics display
    - Test navigation
    - _Requirements: 10.1_

  - [x] 12.3 Create ClientManager component tests
    - Create `tests/unit/components/admin/ClientManager.test.tsx`
    - Test client list rendering
    - Test search functionality
    - Test CRUD operations
    - _Requirements: 10.1, 10.2, 10.3_
    - **Note: Skipped - No dedicated ClientManager component exists. Client functionality is in modal components (CreateClientModal, EditClientModal, ViewClientModal)**

  - [x] 12.4 Create RoomManager component tests
    - Create `tests/unit/components/admin/RoomManager.test.tsx`
    - Test room list rendering
    - Test room editing
    - Test availability management
    - _Requirements: 10.1, 10.2_
    - **Note: Skipped - No dedicated RoomManager component exists. Room management is handled through page-level components**

- [x] 13. Implement error handling tests
  - [x] 13.1 Create network failure tests
    - Create `tests/unit/lib/error-handling.test.ts`
    - Test fetch failure handling
    - Test timeout handling
    - Test retry logic
    - _Requirements: 11.1, 11.2_

  - [x] 13.2 Create ErrorBoundary tests
    - Create `tests/unit/components/ErrorBoundary.test.tsx`
    - Test error catching
    - Test fallback UI rendering
    - Test error logging
    - Test recovery functionality
    - _Requirements: 11.5, 11.6_

  - [x]* 13.3 Write property test for email validation
    - **Property 3: Email Validation Consistency**
    - *For any* string matching email regex, isValidEmail SHALL return true; non-matching SHALL return false
    - **Validates: Requirements 1.2, 1.6**

- [x] 14. Implement accessibility tests
  - [x] 14.1 Create accessibility test setup
    - Install and configure jest-axe
    - Create `tests/accessibility/setup.ts` with axe configuration
    - Create accessibility test helpers
    - _Requirements: 8.1_

  - [x]* 14.2 Write property test for accessibility attributes
    - **Property 10: Accessibility Attribute Presence**
    - *For any* interactive component, rendered output SHALL include ARIA attributes and keyboard handlers
    - **Validates: Requirements 8.4, 8.5**

  - [x] 14.3 Create component accessibility tests
    - Create `tests/accessibility/components.test.tsx`
    - Test all UI components for WCAG 2.1 AA compliance
    - Test keyboard navigation
    - Test focus management
    - Test color contrast
    - _Requirements: 8.2, 8.4, 8.5, 8.6_

  - [x] 14.4 Create page accessibility tests
    - Create `tests/accessibility/pages.test.tsx`
    - Test homepage accessibility
    - Test booking flow accessibility
    - Test admin dashboard accessibility
    - _Requirements: 8.1, 8.2_

- [x] 15. Implement smoke tests
  - [x] 15.1 Create smoke test suite (17 tests)
    - Create `e2e/smoke/critical-paths.spec.ts`
    - Test homepage loads in < 3s
    - Test booking widget renders
    - Test admin login flow
    - Test API health check
    - Configure to run in < 60s total
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 16. Implement visual regression tests
  - [x] 16.1 Create visual regression test setup
    - Configure Playwright for screenshot comparison
    - Create baseline screenshot workflow
    - Set 0.1% pixel difference threshold
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 16.2 Create component visual tests
    - Create `e2e/visual/components.spec.ts`
    - Capture screenshots at mobile (375px), tablet (768px), desktop (1280px)
    - Test all UI components
    - Generate visual diff reports
    - _Requirements: 7.4, 7.7_

- [x] 17. Final checkpoint - Complete test suite
  - Run full test suite
  - Verify all coverage thresholds met (80% overall, 90% utilities)
  - Verify smoke tests complete in < 60s
  - Verify accessibility tests pass
  - Ask user if questions arise

## Notes

- Tasks marked with `*` are property-based tests that validate universal correctness properties
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation before proceeding
- Property tests use fast-check with minimum 100 iterations
- Unit tests use Jest with React Testing Library
- E2E tests use Playwright
