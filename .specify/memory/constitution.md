<!-- Sync Impact Report:
Version change: none → 1.0.0 (initial constitution)
Added sections: All 7 principles added
Templates requiring updates:
- ✅ .specify/templates/plan-template.md - Constitution Check section updated to reference Heiwa principles
- ✅ .specify/templates/spec-template.md - No changes needed (already generic)
- ✅ .specify/templates/tasks-template.md - No changes needed (already generic)
Follow-up TODOs: None - all principles concrete and testable
-->

# Heiwa Booking Suite Constitution

## Core Principles

### I. Quality Gates
Unit coverage ≥ 70%, integration ≥ 60%, e2e (Playwright) runs for all core journeys, Lighthouse ≥ 90 Perf/Best/SEO, Accessibility ≥ 95. Definition of Done = code + tests + docs + telemetry + rollback plan. Every user story maps to ≥1 automated e2e test and an acceptance checklist.

### II. Testing Strategy
Unit: Vitest/Jest for domain utilities and React components. Integration: API + data flows via Firebase Emulator Suite. E2E: Playwright on dashboard and the WP widget (in a Dockerized WP test env). Visual regression: Playwright screenshots + trace. Contract tests where helpful (e.g., Firestore rules & Functions I/O).

### III. Security & Privacy
Firebase rules principle of least privilege; Rule tests must prove no over-read/over-write. Stripe webhooks validated; no card data stored. WordPress: sanitize/escape all inputs/outputs, nonce checks, CSRF/REST permissions; comply with WP coding standards (PHPCS). Secrets via environment managers; no secrets in repo.

### IV. Performance Budgets
LCP < 2.5s (desktop/mobile), TTI < 3.5s, CLS < 0.1. Widget payload < 120KB gz core; code-split; no layout shift on open. Server costs monitored; indexes for all hot Firestore queries.

### V. Accessibility & i18n
WCAG AA; full keyboard flows; ARIA labels; focus management on widget drawer. i18n: en/es; copy lives in translation files; currency & date localized.

### VI. Release & Ops
CI: lint, typecheck, build, test (unit/integration/e2e), Lighthouse CI, bundle-size check. CD: Preview per PR; production requires green gates. Observability: structured logs, error boundaries, Sentry (or equivalent), basic RUM. Feature flags for risky features; migration & rollback playbooks.

### VII. Architecture Consistency
Prefer Firebase (not Supabase) for auth/data/realtime. Domain-driven folders; API boundaries explicit; shared DTOs/types in /packages. One source of truth for pricing, availability, and policies.

## Project Scope

Admin dashboard (Next.js 15, TypeScript, Tailwind, shadcn/ui). Realtime data & auth on Firebase (Auth, Firestore, Functions, Storage, Emulators). Payments on Stripe. WordPress booking widget (plugin + embeddable widget; shortcode + block). Multi-brand theming (Heiwa House, Freedom Routes).

## Development Workflow

Research → Plan → Implement. NEVER JUMP STRAIGHT TO CODING! Always follow this sequence. Automated checks are MANDATORY - ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN! No errors. No formatting issues. No linting problems. Zero tolerance. Fix ALL issues before continuing.

## Governance

Constitution supersedes all other practices. Amendments require documentation, approval, migration plan. All PRs/reviews must verify compliance; Complexity must be justified. Use CLAUDE.md for runtime development guidance. Version increment follows semantic versioning: MAJOR for backward incompatible governance/principle removals, MINOR for new principle/section additions, PATCH for clarifications/wording fixes.

**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21