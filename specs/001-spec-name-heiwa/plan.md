
# Implementation Plan: HEIWA_HOUSE_REBUILD

**Branch**: `001-spec-name-heiwa` | **Date**: 2025-09-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-spec-name-heiwa/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
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
Rebuild the Heiwa House WordPress site as a modern Next.js 15 application with professional accommodation layout, room grids, experience cards, and Surf Weeks video content, integrated with the existing Supabase-powered booking dashboard system. Technical approach uses Next.js App Router, Tailwind CSS with shadcn/ui components, Framer Motion for subtle animations, and React Player for YouTube embeds, with comprehensive SEO, accessibility, and performance optimization. Booking functionality leverages the existing wavecampdashboard system via React widget integration.

## Technical Context
**Language/Version**: TypeScript/JavaScript (Next.js 15)
**Primary Dependencies**: Next.js 15, Tailwind CSS, shadcn/ui, Framer Motion, React Player, Supabase Client, Payload CMS
**Storage**: Payload CMS (content management) + Supabase (via existing wavecampdashboard system for bookings)
**Testing**: Jest, React Testing Library, Playwright (E2E)
**Target Platform**: Web browsers (desktop + mobile)
**Project Type**: web (frontend application with CMS and booking integration)
**Performance Goals**: Fast page loads, smooth animations, responsive design
**Constraints**: SEO optimized, accessibility compliant, image optimization for performance, CMS-driven content, booking system integration
**Scale/Scope**: 4-page website with Payload CMS content management, integrated booking system, image galleries, and video embeds
**CMS Integration**: Payload CMS for content management (rooms, experiences, pages, media)
**Booking Integration**: Connect to existing wavecampdashboard system at `/downloads/heiwahouse/wavecampdashboard/` using React widget

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS - No specific constitutional requirements defined for this project. The constitution template is empty with placeholders only.

**Post-Design Review**: ✅ PASS - Design follows modern web development best practices. No violations of established patterns detected.

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
# Next.js 15 Web Application Structure
app/
├── layout.tsx              # Root layout with navigation
├── page.tsx                # Homepage
├── globals.css             # Global styles and design tokens
├── the-spot/
│   └── page.tsx            # The Spot page
├── rooms/
│   └── page.tsx            # Room Rentals page
└── surf-weeks/
    └── page.tsx            # Surf Weeks page

components/
├── ui/                     # shadcn/ui components
├── hero.tsx                # Hero component
├── card-grid.tsx           # Reusable card grid component
├── video-embed.tsx         # YouTube video embed component
└── navigation.tsx          # Site navigation component

lib/
├── utils.ts                # Utility functions
└── types.ts                # TypeScript type definitions

public/
├── images/                 # Local images (posters, etc.)
└── videos/                 # Local video files if needed

# Configuration files
next.config.js              # Next.js configuration
tailwind.config.js          # Tailwind CSS configuration
package.json                # Dependencies and scripts
```

**Structure Decision**: Web application using Next.js 15 App Router with standard project structure. Components are organized by feature and reusability, with UI components from shadcn/ui library. Static assets are served from public directory.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - ✅ No NEEDS CLARIFICATION items found - all technical decisions were specified
   - Researched best practices for all dependencies and integrations

2. **Generate and dispatch research agents**:
   ```
   ✅ Researched Next.js 15 App Router best practices
   ✅ Researched Tailwind CSS + shadcn/ui integration patterns
   ✅ Researched Framer Motion subtle animation implementations
   ✅ Researched React Player lazy loading strategies
   ✅ Researched next/image optimization for external domains
   ✅ Researched font loading optimization with next/font
   ✅ Researched accessibility implementation patterns
   ✅ Researched SEO strategies for accommodation websites
   ✅ Researched performance optimization techniques
   ✅ Researched testing strategies for Next.js applications
   ```

3. **Consolidate findings** in `research.md` using format:
   - ✅ All research completed and documented
   - Decisions made for each technology choice
   - Alternatives evaluated and rationales provided

**Output**: research.md with comprehensive research findings - **COMPLETE**

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - ✅ Created Room, Experience, NavigationItem, Page entities
   - ✅ Defined validation rules and relationships
   - ✅ Documented static site data management approach

2. **Generate API contracts** from functional requirements:
   - ✅ Created component contracts (Hero, CardGrid, VideoEmbed, Navigation)
   - ✅ Defined TypeScript interfaces for all components
   - ✅ Documented performance, accessibility, and SEO requirements

3. **Generate contract tests** from contracts:
   - ✅ Defined test scenarios in quickstart.md
   - ✅ Created end-to-end validation flows
   - ✅ Documented automated testing setup (Jest, Playwright)

4. **Extract test scenarios** from user stories:
   - ✅ Created 8 critical user journey scenarios
   - ✅ Included accessibility and performance validation
   - ✅ Added cross-browser and SEO testing scenarios

5. **Update agent file incrementally** (O(1) operation):
   - ✅ Executed `.specify/scripts/bash/update-agent-context.sh cursor`
   - ✅ Updated Cursor IDE context with project information
   - ✅ Added Next.js 15, Tailwind CSS, and component library details

**Output**: data-model.md ✅, /contracts/* ✅, quickstart.md ✅, agent-specific file ✅ - **COMPLETE**

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each component contract → implementation + test task pair [P]
- Each page entity → page creation task with SEO metadata
- Each user journey scenario → integration test task
- Data structure tasks for static content management
- Configuration tasks for Next.js, Tailwind, and external domains

**Ordering Strategy**:
- Foundation first: Project setup, configuration, design tokens
- Component development: Core components (Hero, CardGrid, VideoEmbed, Navigation)
- Page implementation: Homepage, then feature pages (rooms, the-spot, surf-weeks)
- TDD approach: Tests created before implementation where possible
- Parallel execution: Mark [P] for independent component/page tasks
- Integration last: Cross-page functionality and performance optimization

**Estimated Output**: 25-35 numbered, ordered tasks covering:
- Project setup and configuration (4-5 tasks)
- Component development (8-10 tasks)
- Page implementation (6-8 tasks)
- Testing and validation (4-6 tasks)
- Performance and SEO optimization (3-4 tasks)

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
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


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
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
