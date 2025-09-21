# API Contracts Index

## Edge Functions

### Core Booking Flow
- **[get-availability.yaml](get-availability.yaml)**: Real-time availability queries for camp weeks, rooms, and beds
- **[price-quote.yaml](price-quote.yaml)**: Complex pricing calculations with promotions, taxes, and addons
- **[create-checkout.yaml](create-checkout.yaml)**: Stripe checkout session creation with booking draft
- **[stripe-webhook.yaml](stripe-webhook.yaml)**: Payment event processing and booking status updates

### Administrative Functions
- **[refund-booking.yaml](refund-booking.yaml)**: Admin-initiated refund processing with Stripe integration
- **[reconcile-payments.yaml](reconcile-payments.yaml)**: Webhook anomaly detection and reconciliation

## Database RPC Functions

### Availability & Pricing
- **[rpc-get-available-beds.sql](rpc-get-available-beds.sql)**: Check bed availability for date ranges
- **[rpc-calculate-booking-price.sql](rpc-calculate-booking-price.sql)**: Server-side price calculations with business rules
- **[rpc-validate-promo-code.sql](rpc-validate-promo-code.sql)**: Promo code validation with usage limits
- **[rpc-get-property-availability.sql](rpc-get-property-availability.sql)**: Property-level availability aggregation

### Business Logic
- **[rpc-create-booking-draft.sql](rpc-create-booking-draft.sql)**: Create draft booking with inventory hold
- **[rpc-confirm-booking-payment.sql](rpc-confirm-booking-payment.sql)**: Payment confirmation and booking activation
- **[rpc-cancel-booking.sql](rpc-cancel-booking.sql)**: Booking cancellation with refund eligibility

## WordPress Integration

### Widget API
- **[wordpress-widget-api.yaml](wordpress-widget-api.yaml)**: REST endpoints for WordPress widget communication
- **[wordpress-plugin-settings.yaml](wordpress-plugin-settings.yaml)**: Plugin configuration and brand theming

### Security Contracts
- **[wordpress-security.yaml](wordpress-security.yaml)**: Nonce validation, capability checks, input sanitization

## Admin Dashboard

### CRUD Operations
- **[admin-properties-api.yaml](admin-properties-api.yaml)**: Property management endpoints
- **[admin-camp-weeks-api.yaml](admin-camp-weeks-api.yaml)**: Camp week and availability management
- **[admin-bookings-api.yaml](admin-bookings-api.yaml)**: Booking administration and modifications

### Reporting & Analytics
- **[admin-reports-api.yaml](admin-reports-api.yaml)**: Dashboard data and CSV export
- **[admin-payments-api.yaml](admin-payments-api.yaml)**: Payment ledger and reconciliation

## Testing Contracts

### Contract Tests
- **[contract-tests/](contract-tests/)**: Failing test stubs for all API contracts
- **[pgTAP/](pgTAP/)**: Database function and RLS policy tests

### Integration Tests
- **[integration-scenarios/](integration-scenarios/)**: Multi-API integration test specifications

## Contract Standards

### Request/Response Format
- All APIs return JSON with consistent error format
- Timestamps in ISO 8601 format
- Currency amounts as decimal numbers (not cents)
- UUIDs for all entity identifiers

### Error Handling
```json
{
  "error": "ERROR_TYPE",
  "message": "Human readable message",
  "details": { /* optional context */ }
}
```

### Authentication
- Public endpoints: Supabase anon key
- Admin endpoints: Supabase service role key
- WordPress proxy: API key validation

### Validation
- Input validation using Zod schemas
- Business rule validation in application logic
- Database constraints for data integrity

## Implementation Priority

1. **Phase 1**: get-availability, price-quote (core user journey)
2. **Phase 2**: create-checkout, stripe-webhook (payment flow)
3. **Phase 3**: refund-booking, reconcile-payments (admin operations)
4. **Phase 4**: WordPress widget integration
5. **Phase 5**: Admin dashboard APIs
