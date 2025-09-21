# Quickstart Test Scenarios

## Overview
End-to-end test scenarios derived from user stories with complete acceptance criteria, data fixtures, and automated test mappings.

## Test Scenario 1: Customer Search & Selection Journey

### Acceptance Criteria
**Given** a WordPress site with Heiwa booking widget configured for "Heiwa House" brand
**When** a customer searches for availability in Puerto Escondido for 2 guests, July 15-22, 2025
**Then** the widget displays real-time availability with accurate pricing, taxes, and policies in Spanish

### Data Fixtures
```json
{
  "brand": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Heiwa House",
    "theme_config": {
      "primary_color": "#2563eb",
      "language": "es"
    }
  },
  "property": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "brand_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Puerto Escondido Surf Camp",
    "location": {
      "city": "Puerto Escondido",
      "country": "Mexico"
    }
  },
  "camp_week": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "property_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Summer Surf Week 2025",
    "start_date": "2025-07-15",
    "end_date": "2025-07-22",
    "base_price": 1200.00,
    "capacity": 20,
    "booked_count": 8
  },
  "rooms": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Ocean View Dorm",
      "type": "dorm",
      "max_occupancy": 6
    }
  ],
  "beds": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "room_id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Bunk Bed A1",
      "type": "bunk"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "room_id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Bunk Bed A2",
      "type": "bunk"
    }
  ]
}
```

### Screens/APIs Touched
- **Widget**: Search form, results display, room/bed selection
- **APIs**:
  - `GET /api/availability` (get-availability Edge Function)
  - `GET /api/pricing` (price-quote Edge Function)
- **Database**: brand, property, camp_week, room, bed tables

### Telemetry Events
- `widget_search_initiated` {brand_id, guest_count, dates}
- `availability_results_displayed` {result_count, average_price}
- `bed_selection_changed` {bed_id, room_id}

### Automated Test References
- **Unit**: `src/components/widget/__tests__/SearchForm.test.tsx`
- **Integration**: `tests/integration/get-availability.test.ts`
- **E2E**: `tests/e2e/widget-search-flow.spec.ts` (Playwright)
- **Visual**: `tests/visual/widget-search-screenshots.spec.ts`

## Test Scenario 2: Complete Booking Checkout Flow

### Acceptance Criteria
**Given** a customer has selected accommodation and entered valid details
**When** they complete checkout with test card 4242 4242 4242 4242
**Then** Stripe processes payment successfully, booking status becomes "paid/confirmed", and confirmation email/SMS is sent

### Data Fixtures
```json
{
  "customer": {
    "email": "test@example.com",
    "first_name": "Maria",
    "last_name": "Garcia",
    "phone": "+52551234567"
  },
  "selected_beds": ["550e8400-e29b-41d4-a716-446655440004"],
  "addons": [
    {
      "addon_id": "550e8400-e29b-41d4-a716-446655440006",
      "quantity": 1
    }
  ],
  "promo_code": "SUMMER25",
  "pricing_quote": {
    "subtotal": 1200.00,
    "discount": 120.00,
    "taxes": 192.00,
    "total": 1272.00,
    "currency": "USD"
  }
}
```

### Screens/APIs Touched
- **Widget**: Customer details form, payment form, confirmation screen
- **APIs**:
  - `POST /api/create-checkout` (create-checkout Edge Function)
  - Stripe Checkout redirect
  - Webhook: `POST /api/stripe-webhook` (payment_intent.succeeded)
- **Database**: customer, booking, payment, booking_bed, booking_addon tables
- **External**: Stripe API, email service, SMS service

### Telemetry Events
- `checkout_initiated` {booking_value, payment_method}
- `payment_completed` {stripe_payment_intent_id, amount}
- `booking_confirmed` {booking_id, customer_id}
- `confirmation_email_sent` {booking_id}
- `confirmation_sms_sent` {booking_id}

### Automated Test References
- **Unit**: `src/lib/__tests__/stripe-integration.test.ts`
- **Integration**: `tests/integration/create-checkout-flow.test.ts`
- **E2E**: `tests/e2e/widget-complete-booking.spec.ts` (Playwright)
- **Contract**: `tests/contract/stripe-webhook-payment-succeeded.test.ts`

## Test Scenario 3: Admin Dashboard Operations

### Acceptance Criteria
**Given** an admin logs into the dashboard
**When** they update camp week pricing and add a blackout date
**Then** changes are immediately visible to the booking widget in real-time

### Data Fixtures
```json
{
  "admin_user": {
    "email": "admin@heiwa.house",
    "role": "admin"
  },
  "camp_week_update": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "base_price": 1350.00,
    "blackout_dates": ["2025-07-20"]
  }
}
```

### Screens/APIs Touched
- **Dashboard**: Camp week management, calendar view
- **APIs**:
  - `PUT /api/admin/camp-weeks/{id}` (admin API)
  - `GET /api/availability` (real-time verification)
- **Database**: camp_week table with RLS policy updates

### Telemetry Events
- `admin_camp_week_updated` {camp_week_id, price_change, admin_id}
- `availability_cache_invalidated` {property_id}

### Automated Test References
- **Unit**: `src/components/admin/__tests__/CampWeekForm.test.tsx`
- **Integration**: `tests/integration/admin-camp-week-update.test.ts`
- **E2E**: `tests/e2e/admin-dashboard-updates.spec.ts` (Playwright)
- **RLS**: `tests/pgtap/admin-rls-policies.test.sql`

## Test Scenario 4: Payment Reconciliation

### Acceptance Criteria
**Given** webhook events arrive out of order
**When** the reconciliation job runs
**Then** payment ledger shows correct state and anomalies are flagged

### Data Fixtures
```json
{
  "webhook_events": [
    {
      "type": "charge.succeeded",
      "data": {"charge": {"id": "ch_test_123", "amount": 127200}},
      "created": 1640995200
    },
    {
      "type": "payment_intent.succeeded",
      "data": {"payment_intent": {"id": "pi_test_123"}},
      "created": 1640995199
    }
  ],
  "expected_reconciliation": {
    "booking_id": "550e8400-e29b-41d4-a716-446655440007",
    "payment_status": "completed",
    "anomalies": []
  }
}
```

### Screens/APIs Touched
- **Background**: Reconciliation job (scheduled function)
- **APIs**: `POST /api/reconcile-payments` (reconcile-payments Edge Function)
- **Database**: payment, webhook_event tables

### Telemetry Events
- `payment_reconciliation_started` {job_id}
- `payment_anomaly_detected` {payment_id, anomaly_type}
- `payment_reconciliation_completed` {processed_count, anomalies_found}

### Automated Test References
- **Unit**: `src/lib/__tests__/reconciliation-logic.test.ts`
- **Integration**: `tests/integration/payment-reconciliation.test.ts`
- **pgTAP**: `tests/pgtap/payment-reconciliation.test.sql`

## Test Scenario 5: WordPress Plugin Settings

### Acceptance Criteria
**Given** a WordPress admin configures the Heiwa plugin
**When** they save brand tokens and API settings
**Then** the widget loads with correct theming and connects to the API

### Data Fixtures
```json
{
  "wordpress_settings": {
    "brand_id": "550e8400-e29b-41d4-a716-446655440000",
    "api_base_url": "https://api.heiwa.house",
    "stripe_publishable_key": "pk_test_...",
    "theme_config": {
      "primary_color": "#2563eb",
      "secondary_color": "#64748b",
      "font_family": "Inter, sans-serif"
    }
  }
}
```

### Screens/APIs Touched
- **WordPress Admin**: Plugin settings page
- **Widget**: Themed booking interface
- **APIs**: WordPress REST API settings validation

### Telemetry Events
- `wordpress_plugin_configured` {brand_id, features_enabled}
- `widget_theme_loaded` {brand_id, theme_version}

### Automated Test References
- **Integration**: `tests/integration/wordpress-plugin-settings.test.ts`
- **E2E**: `tests/e2e/wordpress-plugin-configuration.spec.ts` (Playwright)

## Test Execution Order

1. **Setup**: Database seeding with fixtures
2. **Unit Tests**: Component and utility function validation
3. **Contract Tests**: API contract validation (failing initially)
4. **Integration Tests**: Multi-API flow validation
5. **E2E Tests**: Complete user journey validation
6. **Performance Tests**: Lighthouse and custom benchmarks

## Test Data Management

- **Seed Scripts**: `supabase/seed/test-data.sql`
- **Factories**: `tests/fixtures/` for dynamic test data
- **Cleanup**: Automatic teardown between test runs
- **Isolation**: Database transactions for test isolation

## Success Criteria

- ✅ All contract tests pass (APIs match specifications)
- ✅ All integration tests pass (end-to-end flows work)
- ✅ E2E tests pass on dashboard and WordPress environments
- ✅ Visual regression tests pass (no unexpected UI changes)
- ✅ Performance budgets met (Lighthouse scores ≥ 90)
- ✅ Accessibility audits pass (≥ 95 score)
