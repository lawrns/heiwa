# QA and Drift Evaluation Plan

## Executive Summary

This document outlines a comprehensive plan to address the recent QA oversight
regarding the FAQ functionality and to prevent similar issues in the future. The
goal is to ensure zero drift between the codebase, database, and production
environment, and to establish a rigorous QA process.

## 1. Drift Evaluation Strategy

### 1.1 Codebase Drift Analysis

- **Objective**: Ensure the local `main` branch matches the deployed commit on
  Netlify.
- **Action**:
  - Compare the Git commit hash of the local `main` branch with the deployed
    commit hash on Netlify.
  - Review the deployment logs on Netlify for any skipped builds or errors that
    might have resulted in an older version being served.
  - **Tooling**: Use `git log` and Netlify CLI (or dashboard) to verify.

### 1.2 Database Schema Verification

- **Objective**: Ensure the production Supabase database schema matches the
  local migration files.
- **Action**:
  - Run a schema diff tool (e.g., `pg-diff` or Supabase CLI) to compare the live
    database schema with the local migrations.
  - Verify all constraints (like the `page_slug` NOT NULL constraint) are
    present and correct.
  - Check for any "manual" changes made to the database that are not reflected
    in migrations.

### 1.3 Content Drift Analysis

- **Objective**: Ensure CMS content is synchronized and valid.
- **Action**:
  - Audit all content tables (`faq_items`, `page_content`, etc.) for missing
    required fields or invalid data.
  - Verify that all content referenced in the code (e.g., specific page slugs)
    exists in the database.

## 2. Comprehensive QA Plan

### 2.1 Automated Testing

- **Unit Tests**:
  - Run `npm run test` to execute all unit tests.
  - **Action**: Add specific unit tests for the `FAQManager` component and the
    API routes to ensure they handle `page_slug` correctly.
- **Integration Tests**:
  - Test the API endpoints (`/api/admin/faq`) directly to ensure they validate
    inputs and interact with the database correctly.
- **E2E Testing (Playwright)**:
  - Run `npx playwright test` to execute end-to-end tests.
  - **Action**: Create a new E2E test specifically for the "Add FAQ" flow,
    verifying that a user can add an FAQ and it appears on the correct page.

### 2.2 Manual Testing Checklist

Perform manual verification of the following key user journeys on the **Netlify
Preview URL** (and then Production):

1. **Admin Functions**:
   - [ ] Login as Admin.
   - [ ] Navigate to FAQ Manager.
   - [ ] Create a new FAQ with a specific page (e.g., 'flow').
   - [ ] Verify the FAQ appears in the list.
   - [ ] Edit the FAQ.
   - [ ] Delete the FAQ.
2. **Public Site Verification**:
   - [ ] Navigate to the 'Flow' page.
   - [ ] Verify the newly created FAQ appears.
   - [ ] Verify FAQs for other pages do NOT appear.
3. **Booking Flow**:
   - [ ] Complete a full booking flow to ensure no regressions.

### 2.3 Visual Regression Testing

- **Objective**: Detect unintended visual changes.
- **Action**:
  - Take screenshots of key pages (Home, Flow, Surf, Booking) on the new
    version.
  - Compare with screenshots from the previous stable version.

## 3. Immediate Action Items (Remediation)

1. **Fix the Bug**: (Completed)
   - Updated `FAQManager.tsx` to include `page_slug` selection.
   - Updated API routes to handle `page_slug`.
2. **Verify Fix**:
   - Run the build locally (`npm run build`).
   - Deploy to a preview environment.
   - Test the FAQ creation flow manually.
3. **Database Cleanup**:
   - Check for any invalid FAQ items in the database (rows with NULL `page_slug`
     if any managed to get in, though the constraint should have prevented it).
   - Run: `DELETE FROM faq_items WHERE page_slug IS NULL;` (if constraint was
     missing, but it was present so this might be empty).

## 4. Long-term Prevention

- **Strict Merge Checks**: Require passing CI (build + tests) before merging to
  main.
- **Automated Deployments**: Configure Netlify to automatically deploy `main`
  only after CI passes.
- **Pre-commit Hooks**: Add `husky` to run linting and type checking before
  commits.
- **Regular Drift Audits**: Schedule weekly automated checks of database schema
  vs. migrations.

## 5. Execution Log

- **Date**: 2025-11-30
- **Status**: Bug fixed in codebase. Build verification in progress. Plan
  documented.
