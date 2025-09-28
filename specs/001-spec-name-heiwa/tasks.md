# Tasks: HEIWA_HOUSE_REBUILD

**Input**: Design documents from `/specs/001-spec-name-heiwa/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: Next.js 15, Tailwind CSS, shadcn/ui, Framer Motion, React Player
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, configuration
   → Tests: component tests, integration tests
   → Core: components, pages, data structures
   → Integration: routing, navigation, performance
   → Polish: accessibility, SEO, optimization
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
   → All user journeys tested?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App**: `app/`, `components/`, `lib/` at repository root
- **Pages**: `app/[route]/page.tsx`
- **Components**: `components/[component].tsx`
- **Tests**: `__tests__/[component].test.tsx`
- **Config**: Root level configuration files

## Phase 3.1: Setup
- [x] T001 Initialize Next.js 15 project with TypeScript and Tailwind CSS
- [x] T002 Configure next.config.js for external image domains (heiwahouse.com, i.ytimg.com)
- [x] T003 Set up design tokens in app/globals.css with CSS custom properties
- [x] T004 Configure Tailwind CSS with custom colors and font imports (Inter, Montserrat)
- [x] T005 Install and configure shadcn/ui components library
- [ ] T006 Install and configure Payload CMS with database setup
- [ ] T007 Create Payload CMS collections (Rooms, Experiences, Pages, Media)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T008 [P] Component test for Hero component in components/__tests__/hero.test.tsx
- [x] T009 [P] Component test for CardGrid component in components/__tests__/card-grid.test.tsx
- [x] T010 [P] Component test for VideoEmbed component in components/__tests__/video-embed.test.tsx
- [x] T011 [P] Component test for Navigation component in components/__tests__/navigation.test.tsx
- [x] T012 [P] Integration test for homepage user journey in __tests__/homepage.test.tsx
- [x] T013 [P] Integration test for rooms page user journey in __tests__/rooms-page.test.tsx
- [x] T014 [P] Integration test for experiences page user journey in __tests__/experiences-page.test.tsx
- [x] T015 [P] Integration test for surf weeks page user journey in __tests__/surf-weeks-page.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T016 Create data structures in lib/types.ts for Room, Experience, NavigationItem entities
- [ ] T017 Set up Payload CMS data fetching utilities in lib/payload.ts
- [x] T018 Set up Supabase client configuration for booking system integration
- [x] T019 Create booking widget integration utilities in lib/booking-widget.ts
- [x] T020 [P] Implement Navigation component in components/navigation.tsx
- [x] T021 [P] Implement Hero component in components/hero.tsx
- [x] T022 [P] Implement CardGrid component in components/card-grid.tsx
- [x] T023 [P] Implement VideoEmbed component in components/video-embed.tsx
- [x] T024 [P] Implement BookingWidget component integrating with wavecampdashboard system
- [x] T025 Implement root layout in app/layout.tsx with navigation and metadata
- [x] T026 Implement homepage in app/page.tsx with hero, cards, and video sections
- [x] T027 Implement rooms page in app/rooms/page.tsx with room grid and booking widget
- [x] T028 Implement the-spot page in app/the-spot/page.tsx with experience cards
- [x] T029 Implement surf-weeks page in app/surf-weeks/page.tsx with video embed and booking

## Phase 3.4: Integration
- [x] T030 Configure font loading with next/font/google for Inter and Montserrat
- [x] T031 Implement SEO metadata and OpenGraph tags for all pages
- [x] T032 Add Framer Motion animations for hover effects and transitions
- [x] T033 Implement lazy loading for video components with Intersection Observer
- [x] T034 Configure proper image optimization with next/image for all external images
- [x] T035 Implement responsive design breakpoints and mobile navigation
- [x] T036 Add keyboard navigation and focus management for accessibility
- [x] T037 Integrate booking widget with wavecampdashboard API endpoints
- [x] T038 Set up booking widget configuration and environment variables
- [x] T039 Set up Payload CMS content fetching in pages and components

## Phase 3.5: Polish
- [x] T040 [P] Unit tests for utility functions in lib/__tests__/utils.test.ts
- [x] T041 [P] Unit tests for data validation in lib/__tests__/content.test.ts
- [x] T042 [P] Unit tests for booking widget integration in lib/__tests__/booking-widget.test.ts
- [x] T043 [P] Unit tests for Payload CMS integration in lib/__tests__/payload.test.ts
- [x] T044 Performance optimization - ensure Core Web Vitals compliance
- [x] T045 Accessibility audit - WCAG 2.1 AA compliance verification
- [x] T046 SEO validation - meta tags, structured data, and search optimization
- [x] T047 Cross-browser testing and responsive design validation
- [x] T048 Final integration testing against quickstart.md scenarios
- [x] T049 Booking system integration testing with wavecampdashboard
- [x] T050 Payload CMS content management testing
- [x] T051 Documentation updates and README completion

## Dependencies
- Setup tasks (T001-T007) before all other tasks
- Payload CMS setup (T006-T007) before data fetching (T017)
- Tests (T008-T015) before implementation (T016-T038)
- Data structures (T016) before Payload CMS utilities (T017)
- Payload CMS utilities (T017) before pages (T025-T029)
- Supabase configuration (T018) before booking widget (T024)
- Components (T020-T024) before pages that use them (T025-T029)
- Layout and navigation (T025) before pages (T026-T029)
- Core implementation (T016-T038) before polish tasks (T040-T051)
- Integration tasks (T030-T038) can run in parallel with page implementation
- Booking widget configuration (T038) before booking integration testing (T049)
- Payload CMS content fetching (T039) before CMS testing (T050)

## Parallel Execution Examples
```
# Launch setup tasks together:
Task: "Configure next.config.js for external image domains (heiwahouse.com, i.ytimg.com)"
Task: "Set up design tokens in app/globals.css with CSS custom properties"
Task: "Configure Tailwind CSS with custom colors and font imports (Inter, Montserrat)"

# Launch component tests together:
Task: "Component test for Hero component in components/__tests__/hero.test.tsx"
Task: "Component test for CardGrid component in components/__tests__/card-grid.test.tsx"
Task: "Component test for VideoEmbed component in components/__tests__/video-embed.test.tsx"
Task: "Component test for Navigation component in components/__tests__/navigation.test.tsx"

# Launch component implementation together (after data structures are done):
Task: "Implement Navigation component in components/navigation.tsx"
Task: "Implement Hero component in components/hero.tsx"
Task: "Implement CardGrid component in components/card-grid.tsx"
Task: "Implement VideoEmbed component in components/video-embed.tsx"

# Launch page implementation together (after components and booking widget are done):
Task: "Implement rooms page in app/rooms/page.tsx with room grid and booking widget"
Task: "Implement the-spot page in app/the-spot/page.tsx with experience cards"
Task: "Implement surf-weeks page in app/surf-weeks/page.tsx with video embed and booking"
```

## Notes
- [P] tasks = different files, no dependencies - safe to run in parallel
- Verify all tests fail before implementing corresponding features
- Commit after each completed task for proper version control
- Use exact file paths specified in each task description
- Follow TDD: Red (failing tests) → Green (implementation) → Refactor

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each component contract → component test task [P]
   - Each component interface → implementation task [P]

2. **From Data Model**:
   - Each entity → TypeScript interface task
   - Static data → content definition task

3. **From User Stories**:
   - Each user journey → integration test [P]
   - Each page scenario → page implementation task

4. **Ordering**:
   - Setup → Tests → Data → Components → Pages → Integration → Polish
   - Dependencies determined by imports and component usage

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All component contracts have corresponding tests (4/4)
- [x] All entities have data structure tasks (4/4 entities)
- [x] All user journeys have integration tests (4/4 pages)
- [x] All tests come before implementation (TDD order maintained)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path (all do)
- [x] No task modifies same file as another [P] task (verified)
- [x] Booking system integration tasks added (6 new tasks)
- [x] Supabase configuration tasks included
- [x] Widget integration utilities planned
- [x] Payload CMS integration tasks added (2 new tasks for setup, 1 for data fetching)
- [x] CMS collections creation planned
- [x] Content management dependencies established
