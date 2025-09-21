# Tasks: Produce Executable Specification for Heiwa Booking Suite

**Input**: Design documents from `/specs/001-produce-an-executable/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`, `wordpress-plugin/`
- **Database**: `supabase/migrations/`, `supabase/seed/`
- **Edge Functions**: `supabase/functions/`
- **Tests**: `tests/` with subdirs for contract, integration, e2e

## Phase 3.1: Bucket 1 - Traceability & Gaps

### Core Analysis
- [x] T001 Create traceability matrix in `/docs/spec/traceability.json`
- [x] T002 Analyze repo for implemented features vs spec requirements
- [x] T003 Generate spec/code diff report in `/docs/spec/gaps.md`
- [x] T004 Map user stories to automated tests (unit/integration/e2e)

## Phase 3.2: Bucket 2 - SQL Migrations + RLS Policies + pgTAP

### Database Schema
- [x] T005 [P] Create brand table migration in `supabase/migrations/20250101001_create_brand_table.sql`
- [x] T006 [P] Create property table migration in `supabase/migrations/20250101002_create_property_table.sql`
- [x] T007 [P] Create camp_week table migration in `supabase/migrations/20250101003_create_camp_week_table.sql`
- [x] T008 [P] Create room and bed tables migration in `supabase/migrations/20250101004_create_room_bed_tables.sql`
- [x] T009 [P] Create addon table migration in `supabase/migrations/20250101005_create_addon_table.sql`
- [x] T010 [P] Create customer table migration in `supabase/migrations/20250101006_create_customer_table.sql`
- [x] T011 [P] Create booking and related tables migration in `supabase/migrations/20250101007_create_booking_tables.sql`
- [x] T012 [P] Create payment and promo_code tables migration in `supabase/migrations/20250101008_create_payment_tables.sql`
- [x] T013 [P] Create owner and admin tables migration in `supabase/migrations/20250101009_create_owner_admin_tables.sql`
- [x] T014 [P] Create webhook_event table migration in `supabase/migrations/20250101010_create_webhook_event_table.sql`

### RLS Policies
- [x] T015 [P] Implement brand isolation RLS policies in `supabase/migrations/20250101011_brand_rls_policies.sql`
- [x] T016 [P] Implement property ownership RLS policies in `supabase/migrations/20250101012_property_rls_policies.sql`
- [x] T017 [P] Implement booking privacy RLS policies in `supabase/migrations/20250101013_booking_rls_policies.sql`
- [x] T018 [P] Implement payment security RLS policies in `supabase/migrations/20250101014_payment_security_rls_policies.sql`

### RPC Functions
- [x] T019 [P] Create get_available_beds RPC in `supabase/migrations/20250101015_get_available_beds_rpc.sql`
- [x] T020 [P] Create calculate_booking_price RPC in `supabase/migrations/20250101016_calculate_booking_price_rpc.sql`
- [x] T021 [P] Create validate_promo_code RPC in `supabase/migrations/20250101017_validate_promo_code_rpc.sql`
- [x] T022 [P] Create get_property_availability RPC in `supabase/migrations/20250101018_get_property_availability_rpc.sql`

### Database Indexes
- [x] T023 [P] Create performance indexes in `supabase/migrations/20250101019_performance_indexes.sql`

### pgTAP Tests
- [x] T024 [P] pgTAP schema tests in `supabase/tests/schema.test.sql`
- [x] T025 [P] pgTAP RLS policy tests in `supabase/tests/rls-policies.test.sql`
- [x] T026 [P] pgTAP RPC function tests in `supabase/tests/rpc-functions.test.sql`

### Seed Data
- [x] T027 [P] Create test seed data in `supabase/seed/test-data.sql`

## Phase 3.3: Bucket 3 - Edge Functions

### Availability Function
- [x] T028 [P] Create get-availability Edge Function in `supabase/functions/get-availability/index.ts`
- [x] T029 [P] Contract tests for get-availability in `supabase/functions/get-availability/__tests__/index.test.ts`

### Pricing Function
- [x] T030 [P] Create price-quote Edge Function in `supabase/functions/price-quote/index.ts`
- [x] T031 [P] Contract tests for price-quote in `supabase/functions/price-quote/__tests__/index.test.ts`

### Checkout Function
- [x] T032 [P] Create create-checkout Edge Function in `supabase/functions/create-checkout/index.ts`
- [x] T033 [P] Contract tests for create-checkout in `supabase/functions/create-checkout/__tests__/index.test.ts`

### Webhook Function
- [x] T034 [P] Create stripe-webhook Edge Function in `supabase/functions/stripe-webhook/index.ts`
- [x] T035 [P] Contract tests for stripe-webhook in `supabase/functions/stripe-webhook/__tests__/index.test.ts`

### Refund Function
- [x] T036 [P] Create refund-booking Edge Function in `supabase/functions/refund-booking/index.ts`
- [x] T037 [P] Contract tests for refund-booking in `supabase/functions/refund-booking/__tests__/index.test.ts`

### Reconciliation Function
- [x] T038 [P] Create reconcile-payments Edge Function in `supabase/functions/reconcile-payments/index.ts`
- [x] T039 [P] Contract tests for reconcile-payments in `supabase/functions/reconcile-payments/__tests__/index.test.ts`

## Phase 3.4: Bucket 4 - WordPress Plugin Hardening

### Plugin Security
- [x] T040 [P] Implement nonce validation in `wordpress-plugin/heiwa-booking-widget/includes/security.php`
- [x] T041 [P] Add input sanitization functions in `wordpress-plugin/heiwa-booking-widget/includes/sanitization.php`
- [x] T042 [P] Implement capability checks in `wordpress-plugin/heiwa-booking-widget/includes/permissions.php`

### Plugin Settings
- [x] T043 [P] Create settings page UI in `wordpress-plugin/heiwa-booking-widget/admin/settings-page.php`
- [x] T044 [P] Implement settings validation in `wordpress-plugin/heiwa-booking-widget/includes/settings.php`
- [x] T045 [P] Add brand token configuration in `wordpress-plugin/heiwa-booking-widget/includes/theming.php`

### REST API Integration
- [x] T046 [P] Create secure REST proxy in `wordpress-plugin/heiwa-booking-widget/includes/api-client.php`
- [x] T047 [P] Implement error handling in `wordpress-plugin/heiwa-booking-widget/includes/error-handling.php`

### Internationalization
- [x] T048 [P] Create EN/ES translation files in `wordpress-plugin/heiwa-booking-widget/languages/`
- [x] T049 [P] Implement i18n functions in `wordpress-plugin/heiwa-booking-widget/includes/i18n.php`

## Phase 3.5: Bucket 5 - Widget E2E + Visual Regression

### Playwright Setup
- [ ] T050 [P] Configure WordPress Docker test environment in `tests/e2e/docker-compose.wordpress.yml`
- [ ] T051 [P] Create Playwright WordPress config in `playwright.wordpress.config.ts`

### Widget E2E Tests
- [ ] T052 [P] Search and availability test in `tests/e2e/widget/search-availability.spec.ts`
- [ ] T053 [P] Pricing and promo codes test in `tests/e2e/widget/pricing-promos.spec.ts`
- [ ] T054 [P] Complete booking flow test in `tests/e2e/widget/complete-booking.spec.ts`
- [ ] T055 [P] Manage bookings test in `tests/e2e/widget/manage-bookings.spec.ts`
- [ ] T056 [P] Language switching test in `tests/e2e/widget/language-switching.spec.ts`

### Visual Regression
- [ ] T057 [P] Setup visual regression baseline in `tests/visual/widget-baseline.spec.ts`
- [ ] T058 [P] Create screenshot comparisons in `tests/visual/widget-regression.spec.ts`

## Phase 3.6: Bucket 6 - Dashboard E2E + Fixtures

### Dashboard E2E Tests
- [ ] T059 [P] Admin authentication test in `tests/e2e/dashboard/admin-auth.spec.ts`
- [ ] T060 [P] CRUD operations test in `tests/e2e/dashboard/crud-operations.spec.ts`
- [ ] T061 [P] Real-time availability sync test in `tests/e2e/dashboard/realtime-sync.spec.ts`
- [ ] T062 [P] Dashboard reporting test in `tests/e2e/dashboard/reporting.spec.ts`
- [ ] T063 [P] Payment reconciliation test in `tests/e2e/dashboard/payment-reconciliation.spec.ts`

### Test Fixtures
- [ ] T064 [P] Create admin user fixtures in `tests/fixtures/admin-users.json`
- [ ] T065 [P] Create booking data fixtures in `tests/fixtures/booking-data.json`
- [ ] T066 [P] Create payment fixtures in `tests/fixtures/payment-data.json`

## Phase 3.7: Bucket 7 - Performance & Accessibility

### Performance Testing
- [ ] T067 [P] Setup Lighthouse CI configuration in `lighthouserc.json`
- [ ] T068 [P] Create performance budgets in `tests/performance/budgets.json`
- [ ] T069 [P] Implement performance tests in `tests/performance/widget-performance.spec.ts`

### Accessibility Testing
- [ ] T070 [P] Setup accessibility audit in `tests/accessibility/widget-a11y.spec.ts`
- [ ] T071 [P] Create WCAG AA compliance tests in `tests/accessibility/dashboard-a11y.spec.ts`
- [ ] T072 [P] Implement keyboard navigation tests in `tests/accessibility/keyboard-navigation.spec.ts`

## Phase 3.8: Bucket 8 - Observability & Alerting

### Error Boundaries
- [ ] T073 [P] Implement React error boundaries in `src/components/ErrorBoundary.tsx`
- [ ] T074 [P] Add Edge Function error handling in `supabase/functions/_shared/error-handler.ts`

### Logging
- [ ] T075 [P] Setup structured logging in `src/lib/logger.ts`
- [ ] T076 [P] Implement Edge Function logging in `supabase/functions/_shared/logger.ts`

### Monitoring
- [ ] T077 [P] Configure Sentry integration in `src/lib/sentry.ts`
- [ ] T078 [P] Setup alerting for webhook failures in `supabase/functions/_shared/alerting.ts`

## Phase 3.9: Bucket 9 - Documentation

### Runbooks
- [ ] T079 [P] Create deployment runbook in `docs/runbooks/deployment.md`
- [ ] T080 [P] Create monitoring runbook in `docs/runbooks/monitoring.md`
- [ ] T081 [P] Create incident response runbook in `docs/runbooks/incident-response.md`

### Rollback Procedures
- [ ] T082 [P] Create database rollback procedures in `docs/rollback/database-rollback.md`
- [ ] T083 [P] Create application rollback procedures in `docs/rollback/application-rollback.md`

### Release Checklist
- [ ] T084 [P] Create pre-release checklist in `docs/releases/pre-release-checklist.md`
- [ ] T085 [P] Create post-release validation in `docs/releases/post-release-validation.md`

## Dependencies

### Sequential Dependencies
- Traceability tasks (T001-T004) before any implementation
- Database schema (T005-T014) before RLS policies (T015-T018)
- RLS policies before RPC functions (T019-T022)
- Database setup before Edge Functions (T028+)
- Edge Functions before E2E tests
- All implementation before documentation

### Parallel Execution Groups
```
# Database Migrations (can run in any order):
T005, T006, T007, T008, T009, T010, T011, T012, T013, T014

# RLS Policies (after migrations):
T015, T016, T017, T018

# Edge Functions (after database):
T028, T030, T032, T034, T036, T038

# Contract Tests (after functions):
T029, T031, T033, T035, T037, T039

# E2E Tests (after all implementation):
T052, T053, T054, T055, T056, T059, T060, T061, T062, T063
```

## Task Details

| ID | Title | Size | Est (h) | Owner | Dependencies | Acceptance Criteria | Stories | Test Files |
|----|-------|------|---------|-------|--------------|-------------------|---------|------------|
| T001 | Create traceability matrix | M | 4 | @product | None | JSON file links stories → AC → tests → files | US1-US12 | N/A |
| T002 | Analyze repo implementation gaps | M | 6 | @dev | T001 | Gap analysis report with completion percentages | US1-US12 | N/A |
| T003 | Generate spec/code diff report | S | 2 | @dev | T002 | Markdown report of missing features | US1-US12 | N/A |
| T004 | Map stories to automated tests | S | 3 | @qa | T003 | Updated traceability.json with test links | US1-US12 | N/A |
| T005 | Create brand table migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T006 | Create property table migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T007 | Create camp_week table migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T008 | Create room and bed tables migration | S | 2 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T009 | Create addon table migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T010 | Create customer table migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T011 | Create booking and related tables migration | M | 3 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T012 | Create payment and promo_code tables migration | M | 3 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T013 | Create owner and admin tables migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T014 | Create webhook_event table migration | S | 1 | @db | None | SQL migration with constraints | N/A | supabase/tests/schema.test.sql |
| T015 | Implement brand isolation RLS policies | M | 4 | @db | T005 | RLS policies prevent cross-brand access | US8 | supabase/tests/rls-policies.test.sql |
| T016 | Implement property ownership RLS policies | M | 4 | @db | T006 | Owners see only their properties | US8 | supabase/tests/rls-policies.test.sql |
| T017 | Implement booking privacy RLS policies | M | 4 | @db | T011 | Customers see only their bookings | US1-US5 | supabase/tests/rls-policies.test.sql |
| T018 | Implement payment security RLS policies | M | 4 | @db | T012 | Payment data properly secured | US2,US9 | supabase/tests/rls-policies.test.sql |
| T019 | Create get_available_beds RPC | M | 3 | @db | T008,T014 | Function returns available beds | US1 | supabase/tests/rpc-functions.test.sql |
| T020 | Create calculate_booking_price RPC | L | 6 | @db | T011,T012 | Complex pricing calculations | US2,US4 | supabase/tests/rpc-functions.test.sql |
| T021 | Create validate_promo_code RPC | M | 3 | @db | T012 | Promo code validation logic | US4 | supabase/tests/rpc-functions.test.sql |
| T022 | Create get_property_availability RPC | M | 3 | @db | T006,T007 | Property-level availability | US1 | supabase/tests/rpc-functions.test.sql |
| T023 | Create performance indexes | M | 4 | @db | T005-T014 | Query performance optimization | All | N/A |
| T024 | pgTAP schema tests | M | 4 | @qa | T005-T014 | All tables created correctly | N/A | supabase/tests/schema.test.sql |
| T025 | pgTAP RLS policy tests | L | 8 | @qa | T015-T018 | RLS policies work correctly | US8 | supabase/tests/rls-policies.test.sql |
| T026 | pgTAP RPC function tests | L | 8 | @qa | T019-T022 | RPC functions return correct data | US1-US4 | supabase/tests/rpc-functions.test.sql |
| T027 | Create test seed data | M | 4 | @db | T005-T014 | Realistic test data | All | N/A |
| T028 | Create get-availability Edge Function | L | 8 | @backend | T019,T022 | Real-time availability API | US1 | tests/contract/get-availability.test.ts |
| T029 | Contract tests for get-availability | M | 4 | @qa | T028 | API matches contract spec | US1 | tests/contract/get-availability.test.ts |
| T030 | Create price-quote Edge Function | L | 8 | @backend | T020,T021 | Complex pricing API | US2,US4 | tests/contract/price-quote.test.ts |
| T031 | Contract tests for price-quote | M | 4 | @qa | T030 | API matches contract spec | US2,US4 | tests/contract/price-quote.test.ts |
| T032 | Create create-checkout Edge Function | L | 8 | @backend | T011,T012 | Stripe checkout creation | US2 | tests/contract/create-checkout.test.ts |
| T033 | Contract tests for create-checkout | M | 4 | @qa | T032 | API matches contract spec | US2 | tests/contract/create-checkout.test.ts |
| T034 | Create stripe-webhook Edge Function | L | 8 | @backend | T014,T018 | Payment event processing | US2,US9 | tests/contract/stripe-webhook.test.ts |
| T035 | Contract tests for stripe-webhook | M | 4 | @qa | T034 | API matches contract spec | US2,US9 | tests/contract/stripe-webhook.test.ts |
| T036 | Create refund-booking Edge Function | L | 8 | @backend | T012,T018 | Refund processing API | US3,US10 | tests/contract/refund-booking.test.ts |
| T037 | Contract tests for refund-booking | M | 4 | @qa | T036 | API matches contract spec | US3,US10 | tests/contract/refund-booking.test.ts |
| T038 | Create reconcile-payments Edge Function | L | 8 | @backend | T014,T018 | Payment reconciliation | US9 | tests/contract/reconcile-payments.test.ts |
| T039 | Contract tests for reconcile-payments | M | 4 | @qa | T038 | API matches contract spec | US9 | tests/contract/reconcile-payments.test.ts |
| T040 | Implement nonce validation | M | 3 | @wp | None | WordPress security best practices | All | N/A |
| T041 | Add input sanitization functions | M | 3 | @wp | None | All inputs properly sanitized | All | N/A |
| T042 | Implement capability checks | M | 3 | @wp | None | Proper permission validation | All | N/A |
| T043 | Create settings page UI | M | 4 | @wp | None | Admin settings interface | US12 | N/A |
| T044 | Implement settings validation | M | 3 | @wp | T043 | Settings properly validated | US12 | N/A |
| T045 | Add brand token configuration | M | 4 | @wp | T043 | Theming configuration | US12 | N/A |
| T046 | Create secure REST proxy | L | 6 | @wp | T040-T042 | Secure API communication | US1-US5 | N/A |
| T047 | Implement error handling | M | 3 | @wp | T046 | Proper error responses | All | N/A |
| T048 | Create EN/ES translation files | M | 4 | @wp | None | Complete translations | US5 | N/A |
| T049 | Implement i18n functions | M | 3 | @wp | T048 | Dynamic language switching | US5 | N/A |
| T050 | Configure WordPress Docker test environment | M | 4 | @qa | None | WP test environment ready | All | N/A |
| T051 | Create Playwright WordPress config | M | 3 | @qa | T050 | WP-specific test config | All | N/A |
| T052 | Search and availability test | L | 8 | @qa | T028,T050,T051 | E2E search flow works | US1 | tests/e2e/widget/search-availability.spec.ts |
| T053 | Pricing and promo codes test | L | 8 | @qa | T030,T050,T051 | E2E pricing flow works | US2,US4 | tests/e2e/widget/pricing-promos.spec.ts |
| T054 | Complete booking flow test | L | 8 | @qa | T032,T034,T050,T051 | E2E booking completion | US2 | tests/e2e/widget/complete-booking.spec.ts |
| T055 | Manage bookings test | L | 8 | @qa | T036,T050,T051 | E2E booking management | US3 | tests/e2e/widget/manage-bookings.spec.ts |
| T056 | Language switching test | M | 4 | @qa | T049,T050,T051 | E2E language switching | US5 | tests/e2e/widget/language-switching.spec.ts |
| T057 | Setup visual regression baseline | M | 4 | @qa | None | Visual test baseline established | All | tests/visual/widget-baseline.spec.ts |
| T058 | Create screenshot comparisons | M | 4 | @qa | T057 | Visual regression detection | All | tests/visual/widget-regression.spec.ts |
| T059 | Admin authentication test | M | 4 | @qa | None | Admin login E2E | US6-US10 | tests/e2e/dashboard/admin-auth.spec.ts |
| T060 | CRUD operations test | L | 8 | @qa | None | Admin CRUD E2E | US6 | tests/e2e/dashboard/crud-operations.spec.ts |
| T061 | Real-time availability sync test | L | 6 | @qa | T028 | Real-time sync E2E | US6 | tests/e2e/dashboard/realtime-sync.spec.ts |
| T062 | Dashboard reporting test | L | 6 | @qa | None | Reporting E2E | US7 | tests/e2e/dashboard/reporting.spec.ts |
| T063 | Payment reconciliation test | L | 6 | @qa | T038 | Reconciliation E2E | US9 | tests/e2e/dashboard/payment-reconciliation.spec.ts |
| T064 | Create admin user fixtures | S | 2 | @qa | None | Test admin data | US6-US10 | N/A |
| T065 | Create booking data fixtures | M | 4 | @qa | T011 | Test booking data | US1-US5 | N/A |
| T066 | Create payment fixtures | M | 4 | @qa | T012 | Test payment data | US2,US9 | N/A |
| T067 | Setup Lighthouse CI configuration | M | 3 | @qa | None | Performance testing ready | All | lighthouserc.json |
| T068 | Create performance budgets | S | 2 | @qa | T067 | Budget definitions | All | tests/performance/budgets.json |
| T069 | Implement performance tests | M | 4 | @qa | T067,T068 | Performance validation | All | tests/performance/widget-performance.spec.ts |
| T070 | Setup accessibility audit | M | 3 | @qa | None | A11y testing ready | All | tests/accessibility/widget-a11y.spec.ts |
| T071 | Create WCAG AA compliance tests | M | 4 | @qa | T070 | WCAG AA validation | All | tests/accessibility/dashboard-a11y.spec.ts |
| T072 | Implement keyboard navigation tests | M | 4 | @qa | T070 | Keyboard navigation | US5 | tests/accessibility/keyboard-navigation.spec.ts |
| T073 | Implement React error boundaries | M | 3 | @frontend | None | Error boundary components | All | N/A |
| T074 | Add Edge Function error handling | M | 3 | @backend | None | Error handling middleware | All | supabase/functions/_shared/error-handler.ts |
| T075 | Setup structured logging | M | 3 | @backend | None | Logging infrastructure | All | src/lib/logger.ts |
| T076 | Implement Edge Function logging | M | 3 | @backend | T075 | Function logging | All | supabase/functions/_shared/logger.ts |
| T077 | Configure Sentry integration | M | 3 | @backend | None | Error tracking setup | All | src/lib/sentry.ts |
| T078 | Setup alerting for webhook failures | M | 3 | @backend | T034 | Webhook failure alerts | US9 | supabase/functions/_shared/alerting.ts |
| T079 | Create deployment runbook | M | 4 | @ops | None | Deployment procedures | All | docs/runbooks/deployment.md |
| T080 | Create monitoring runbook | M | 4 | @ops | T077,T078 | Monitoring procedures | All | docs/runbooks/monitoring.md |
| T081 | Create incident response runbook | M | 4 | @ops | T077,T078 | Incident procedures | All | docs/runbooks/incident-response.md |
| T082 | Create database rollback procedures | M | 4 | @db | T005-T023 | Rollback procedures | All | docs/rollback/database-rollback.md |
| T083 | Create application rollback procedures | M | 4 | @ops | None | Rollback procedures | All | docs/rollback/application-rollback.md |
| T084 | Create pre-release checklist | M | 4 | @ops | None | Release validation | All | docs/releases/pre-release-checklist.md |
| T085 | Create post-release validation | M | 4 | @ops | None | Post-release checks | All | docs/releases/post-release-validation.md |

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
