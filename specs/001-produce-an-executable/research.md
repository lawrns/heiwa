# Research Findings: Heiwa Booking Suite Brownfield Close-Out

## Executive Summary
Brownfield close-out analysis reveals existing Supabase infrastructure requiring integration rather than replacement. Key findings: existing schema foundations, WordPress plugin scaffolding, and testing frameworks provide solid base for completion. Critical gaps identified in Edge Functions, RLS policies, and end-to-end testing infrastructure.

## Track A: Spec Lock & Gap Analysis

### Current State Analysis
**Decision**: Analyze existing codebase against specification requirements
**Rationale**: Brownfield project requires understanding what exists vs. what needs building
**Alternatives Considered**: Start fresh (rejected - violates 90% completion goal), Full rewrite (rejected - timeline constraints)

**Findings**:
- Supabase migrations exist: `/supabase/migrations/` contains initial schema
- WordPress plugin exists: `/wordpress-plugin/heiwa-booking-widget/` with basic structure
- Testing infrastructure exists: Playwright configs, Jest setup, but incomplete coverage
- Admin dashboard exists: Next.js structure with shadcn/ui components
- Missing: Edge Functions, comprehensive RLS policies, full E2E test suites, payment reconciliation

### Gap Analysis Results
**Identified Gaps**:
1. Database: Missing 8+ entities, incomplete RLS policies, no RPC functions
2. Edge Functions: None implemented (getAvailability, priceQuote, stripeWebhook, etc.)
3. WordPress: Plugin exists but lacks settings screen, secure API calls, theming
4. Payments: Stripe integration exists but no webhook handling or reconciliation
5. Testing: Unit coverage ~30%, no integration tests, incomplete E2E coverage

## Track B: Database & RLS (Supabase)

### Schema Analysis
**Decision**: Extend existing Supabase schema with missing entities and relationships
**Rationale**: Brownfield approach - build on existing foundations rather than replace
**Alternatives Considered**: Firebase migration (rejected - constitutional violation + timeline), Complete schema rewrite (rejected - unnecessary complexity)

**Required Additions**:
- brand, property, camp_week, room, bed, addon tables
- Enhanced customer, booking, payment, promo_code tables
- webhook_event logging table
- Comprehensive indexes for performance
- RLS policies for multi-tenancy (brand/owner isolation)
- RPC functions: priced_quote(), get_availability()

### RLS Policy Design
**Decision**: Implement strict tenancy model with brand and owner isolation
**Rationale**: Security first - prevent data leakage between property operators
**Implementation**: Row Level Security policies ensuring owners see only their properties, customers see only their bookings

## Track C: Edge Functions & APIs

### Function Architecture
**Decision**: Implement 6 core Edge Functions with Zod validation and structured logging
**Rationale**: Serverless compute for availability, pricing, and payment processing
**Alternatives Considered**: Next.js API routes (rejected - less scalable), Firebase Functions (rejected - constitutional violation)

**Functions to Implement**:
- `getAvailability`: Real-time room/bed availability queries
- `priceQuote`: Complex pricing calculations with promos/taxes
- `createCheckout`: Stripe session creation with booking state management
- `stripeWebhook`: Payment event processing and booking status updates
- `refundBooking`: Refund processing with Stripe integration
- `reconcilePayments`: Webhook anomaly detection and reconciliation

### API Design Patterns
**Decision**: RESTful endpoints with OpenAPI contracts and idempotency
**Rationale**: Clear contracts for frontend and WordPress integration
**Validation**: Zod schemas for all inputs/outputs, comprehensive error handling

## Track D: WordPress Plugin & Widget

### Plugin Architecture
**Decision**: Bootstrap existing plugin with secure REST proxy and settings screen
**Rationale**: Brownfield - extend existing plugin structure rather than rebuild
**Implementation**: PHP 8.1+, WordPress coding standards, nonce validation

**Components**:
- REST API proxy with authentication
- Settings screen for brand tokens, API keys, Stripe config
- Shortcode `[heiwa_booking]` and Gutenberg block
- Secure widget embedding without exposing service keys

### Widget Implementation
**Decision**: Code-split React widget with drawer UI and theming system
**Rationale**: Performance-first - lazy loading, no layout shifts, accessible
**Implementation**: TypeScript, EN/ES i18n, WCAG AA compliance, <120KB gzipped

## Track E: Payments Integration

### Stripe Integration Strategy
**Decision**: Implement complete payment lifecycle with webhook processing
**Rationale**: End-to-end payment handling required for booking completion
**Implementation**: Checkout sessions, webhook event handling, refund processing

**Flow**: Intent → Capture → Status Updates → Refunds → Reconciliation

## Track F: Testing Infrastructure

### Testing Strategy
**Decision**: Comprehensive test pyramid with Playwright E2E focus
**Rationale**: User stories require automated E2E validation for 90% completion
**Implementation**: Playwright for dashboard + WordPress, pgTAP for database, Vitest for units

**Test Scenarios**:
- Customer journey: Search → Select → Checkout → Confirmation
- Admin operations: CRUD → Real-time updates → CSV export
- Error handling: Payment failures, sold-out conditions, invalid promos
- Visual regression: Screenshots and trace artifacts

## Track G: CI/CD Pipeline

### Pipeline Design
**Decision**: GitHub Actions with comprehensive quality gates
**Rationale**: Automated enforcement of constitutional principles
**Implementation**: Multi-stage pipeline with preview deployments

**Stages**: lint → typecheck → build → unit → pgTAP + integration → Playwright → Lighthouse → bundle-size → deploy

## Track H: Observability

### Monitoring Strategy
**Decision**: Sentry + structured logging + alerting
**Rationale**: Production-ready observability for error tracking and performance
**Implementation**: Error boundaries, webhook failure alerts, slow query monitoring

## Risk Assessment

### High Risk Items
1. **Supabase vs Firebase**: Constitutional violation justified by brownfield constraints
2. **RLS Complexity**: Multi-tenant policies require thorough testing
3. **WordPress Security**: Plugin must meet WP standards and avoid vulnerabilities
4. **Stripe Webhooks**: Event ordering and reconciliation critical for payment integrity

### Mitigation Strategies
- Comprehensive pgTAP testing for RLS policies
- Security audit of WordPress plugin
- Extensive webhook testing with simulated failures
- Performance benchmarking against constitutional budgets

## Next Steps
Proceed to Phase 1 design with contracts, data models, and test specifications. All research complete - no remaining unknowns identified.
