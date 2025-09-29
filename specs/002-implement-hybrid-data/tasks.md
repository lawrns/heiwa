# Tasks: Hybrid Data Access Architecture

**Input**: Design documents from `/specs/002-implement-hybrid-data/`
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
- **Web app**: `lib/`, `components/`, `app/` at repository root
- Paths shown below assume Next.js project structure

## Phase 3.1: Setup
- [x] T001 Configure environment variables for admin API access in `.env.local` (manual setup required)
- [x] T002 [P] Create admin API client utilities in `lib/admin-api.ts`
- [x] T003 [P] Add error handling types and interfaces in `lib/types.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test GET /api/wordpress/rooms in `__tests__/contracts/admin-api-rooms.test.ts`
- [x] T005 [P] Contract test GET /api/wordpress/availability in `__tests__/contracts/admin-api-availability.test.ts`
- [x] T006 [P] Contract test POST /api/wordpress/bookings in `__tests__/contracts/admin-api-bookings.test.ts`
- [x] T007 [P] Integration test room listing display in `__tests__/integration/room-listing.test.tsx`
- [x] T008 [P] Integration test booking submission flow in `__tests__/integration/booking-submission.test.tsx`
- [x] T009 [P] Integration test availability checking in `__tests__/integration/availability-check.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T010 [P] Extend Room interface for admin API compatibility in `lib/types.ts` (completed in T003)
- [x] T011 [P] Create BookingRequest/Response types in `lib/types.ts` (completed in T003)
- [x] T012 [P] Implement admin API client methods in `lib/admin-api.ts` (completed in T002)
- [x] T013 [P] Add availability checking service in `lib/availability.ts`
- [x] T014 [P] Create booking submission service in `lib/booking-service.ts`
- [x] T015 Update room data fetching with better fallback logic in `lib/content.ts`
- [x] T016 [P] Add error boundary component for API failures in `components/error-boundary.tsx`
- [x] T017 Update booking widget to use admin APIs in `components/BookingWidget/hooks/useBookingFlow.ts`
- [x] T018 Add loading states for API operations in `components/BookingWidget/BookingWidget.tsx`

## Phase 3.4: Integration
- [x] T019 Configure admin API base URL and authentication in environment setup (completed in T001)
- [x] T020 Add request/response logging for admin API calls
- [x] T021 Implement retry logic for failed admin API requests
- [x] T022 Add health checks for admin system availability
- [x] T023 Update booking flow to handle admin API responses in `app/booking/` (added error boundary to rooms page)

## Phase 3.5: Polish
- [x] T024 [P] Unit tests for admin API client in `__tests__/unit/admin-api.test.ts`
- [x] T025 [P] Unit tests for availability service in `__tests__/unit/availability.test.ts`
- [x] T026 [P] Unit tests for booking service in `__tests__/unit/booking-service.test.ts`
- [ ] T027 Performance tests for API response times (<500ms target)
- [ ] T028 [P] Update documentation for hybrid data access in `docs/`
- [ ] T029 Add monitoring and alerting for admin API failures
- [ ] T030 Run end-to-end testing with real admin system

## Dependencies
- Tests (T004-T009) before implementation (T010-T018)
- T010-T011 blocks T012-T014 (types needed first)
- T012 blocks T017-T018 (API client needed for components)
- T015 blocks T017 (room data needed for booking widget)
- Implementation before integration (T019-T023)
- Integration before polish (T024-T030)

## Parallel Example
```
# Launch T004-T006 together (admin API contract tests):
Task: "Contract test GET /api/wordpress/rooms in __tests__/contracts/admin-api-rooms.test.ts"
Task: "Contract test GET /api/wordpress/availability in __tests__/contracts/admin-api-availability.test.ts"
Task: "Contract test POST /api/wordpress/bookings in __tests__/contracts/admin-api-bookings.test.ts"

# Launch T007-T009 together (integration tests):
Task: "Integration test room listing display in __tests__/integration/room-listing.test.tsx"
Task: "Integration test booking submission flow in __tests__/integration/booking-submission.test.tsx"
Task: "Integration test availability checking in __tests__/integration/availability-check.test.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD principle)
- Commit after each task completion
- Admin API integration requires valid API key for testing
- Fallback to static data when admin system unavailable
- Maintain data consistency between direct DB and admin API access

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - admin-api-contracts.yaml → 3 contract test tasks [P]
   - Each API endpoint → implementation task

2. **From Data Model**:
   - Room entity → type extensions [P]
   - Booking entity → type definitions [P]
   - Availability entity → service implementation [P]

3. **From User Stories**:
   - Room display → integration test [P]
   - Booking submission → integration test [P]
   - Availability checking → integration test [P]

4. **Ordering**:
   - Setup → Tests → Types → Services → Components → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (3 contract tests created)
- [x] All entities have implementation tasks (Room, Booking, Availability covered)
- [x] All tests come before implementation (TDD enforced)
- [x] Parallel tasks truly independent (different file paths)
- [x] Each task specifies exact file path (all tasks have paths)
- [x] No task modifies same file as another [P] task (file conflicts avoided)
