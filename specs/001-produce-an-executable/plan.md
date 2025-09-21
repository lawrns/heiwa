
# Implementation Plan: Produce Executable Specification for Heiwa Booking Suite

**Branch**: `001-produce-an-executable` | **Date**: 2025-09-21 | **Spec**: /Users/lukatenbosch/Downloads/heiwahouse/wavecampdashboard/specs/001-produce-an-executable/spec.md
**Input**: Feature specification from `/specs/001-produce-an-executable/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Complete brownfield close-out of Heiwa Booking Suite with executable specifications for Supabase + Stripe + WordPress integration. Deliver traceability matrix, database contracts, Edge Functions, WordPress plugin, testing infrastructure, and CI/CD pipeline to achieve 90% completion verification.

## Technical Context
**Language/Version**: TypeScript/Node.js (Next.js 15), PHP 8.1+ (WordPress), SQL (Supabase/PostgreSQL)
**Primary Dependencies**: Supabase (PostgreSQL, Edge Functions), Stripe (payments), WordPress (plugin API), Playwright (testing), Zod (validation)
**Storage**: Supabase PostgreSQL with RLS, Edge Functions for serverless compute
**Testing**: Playwright (E2E), Vitest/Jest (unit/integration), pgTAP (database), Docker (WP test env)
**Target Platform**: Web (Next.js dashboard + WordPress widget), Serverless (Supabase Edge Functions)
**Project Type**: web (frontend + backend + WordPress integration)
**Performance Goals**: LCP < 2.5s, TTI < 3.5s, CLS < 0.1, Widget < 120KB gz, Lighthouse ≥ 90
**Constraints**: WCAG AA accessibility, EN/ES i18n, RLS security, Stripe PCI compliance, WordPress coding standards
**Scale/Scope**: Multi-brand theming, real-time availability, payment processing, admin operations, 13 core entities

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Gates
- [x] Unit coverage ≥ 70%, integration ≥ 60%, e2e (Playwright) runs planned for all core journeys
- [x] Lighthouse ≥ 90 Perf/Best/SEO, Accessibility ≥ 95 targets established
- [x] Definition of Done includes code + tests + docs + telemetry + rollback plan
- [x] Every user story will map to ≥1 automated e2e test and acceptance checklist

### Testing Strategy
- [x] Unit tests: Vitest/Jest for domain utilities and React components
- [x] Integration tests: API + data flows via Supabase (adapted from Firebase Emulator Suite)
- [x] E2E tests: Playwright on dashboard and WP widget (Dockerized WP test env)
- [x] Visual regression: Playwright screenshots + trace
- [x] Contract tests where helpful (Supabase RLS & Edge Functions I/O)

### Security & Privacy
- [x] Stripe webhooks validated; no card data stored
- [x] WordPress: sanitize/escape all inputs/outputs, nonce checks, CSRF/REST permissions
- [x] WP coding standards (PHPCS) compliance
- [x] Secrets via environment managers; no secrets in repo
- [x] Supabase RLS follows principle of least privilege; tests prove no over-read/over-write

### Performance Budgets
- [x] LCP < 2.5s (desktop/mobile), TTI < 3.5s, CLS < 0.1
- [x] Widget payload < 120KB gz core; code-split; no layout shift on open
- [x] Server costs monitored; indexes for all hot Supabase queries

### Accessibility & i18n
- [x] WCAG AA compliance; full keyboard flows; ARIA labels; focus management on widget drawer
- [x] i18n: en/es; copy lives in translation files; currency & date localized

### Release & Ops
- [x] CI: lint, typecheck, build, test (unit/integration/e2e), Lighthouse CI, bundle-size check
- [x] CD: Preview per PR; production requires green gates
- [x] Observability: structured logs, error boundaries, Sentry (or equivalent), basic RUM
- [x] Feature flags for risky features; migration & rollback playbooks

### Architecture Consistency
- [ ] Firebase (not Supabase) for auth/data/realtime - VIOLATION: User requires Supabase implementation
- [x] Domain-driven folders; API boundaries explicit; shared DTOs/types in /packages
- [x] One source of truth for pricing, availability, and policies

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- **Database Layer**: Each entity → migration + model task [P]
- **Edge Functions**: Each contract → implementation + contract test [P]
- **WordPress Plugin**: Component scaffolding + security implementation
- **Testing**: Each quickstart scenario → E2E test task
- **Admin Dashboard**: CRUD operations + real-time updates
- **Integration**: Cross-system data flow validation

**Ordering Strategy**:
- **Track A (Spec Lock)**: Gap analysis and traceability matrix first
- **Track B (Database)**: Schema migrations → RLS policies → RPC functions
- **Track C (Edge Functions)**: Core APIs (availability, pricing) → Payment flow → Admin operations
- **Track D (WordPress)**: Plugin bootstrap → Widget → Settings integration
- **Track E (Payments)**: Stripe integration → Webhook handling → Reconciliation
- **Track F (Testing)**: Contract tests → Integration tests → E2E tests → Visual regression
- **Track G (CI/CD)**: Pipeline setup → Quality gates → Deployment automation
- **Track H (Observability)**: Error boundaries → Logging → Alerting
- TDD enforcement: Tests before implementation within each track
- Parallel execution [P] for independent files/tasks

**Task Categories**:
1. **Database & Schema** (8-10 tasks): Migrations, RLS policies, RPC functions, pgTAP tests
2. **Edge Functions** (12-15 tasks): 6 core functions + contract tests + integration tests
3. **WordPress Integration** (6-8 tasks): Plugin setup, widget implementation, security
4. **Admin Dashboard** (8-10 tasks): CRUD operations, real-time sync, reporting
5. **Payment Systems** (6-8 tasks): Stripe integration, webhooks, reconciliation
6. **Testing Infrastructure** (10-12 tasks): E2E suites, visual regression, performance
7. **DevOps & Observability** (5-7 tasks): CI/CD, monitoring, alerting

**Estimated Output**: 55-70 numbered, ordered tasks in tasks.md with dependency chains

**Quality Gates per Track**:
- **A**: Traceability matrix complete, spec/code diff documented
- **B**: All tables migrated, RLS policies tested, RPC functions operational
- **C**: All Edge Functions deployed, contract tests passing
- **D**: WordPress plugin security-audited, widget fully functional
- **E**: Payment flow end-to-end, reconciliation automated
- **F**: 70%+ coverage, all E2E journeys passing, Lighthouse ≥90
- **G**: CI green on all gates, preview deployments working
- **H**: Errors monitored, alerts configured, RUM implemented

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Supabase instead of Firebase | Brownfield close-out requires Supabase integration for existing PostgreSQL schema and Edge Functions | Firebase migration would require complete data migration and Edge Function rewrite, violating 90% completion timeline |
| Existing Supabase dependencies | Current codebase has Supabase setup, migrations, and integrations | Firebase adoption would require full architectural rewrite and delay close-out by months |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Heiwa Booking Suite Constitution v1.0.0 - See `.specify/memory/constitution.md`*
