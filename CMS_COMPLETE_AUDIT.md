# Complete CMS Hardcoding Audit & Fix Strategy

**Date**: January 12, 2026
**Scope**: Site-wide identification of all hardcoded content that should be CMS-editable

---

## CRITICAL FINDING

**Problem**: Code has extensive hardcoded defaults that:
1. Mask CMS changes (user can't tell if CMS is working)
2. Prevent proper CMS functionality
3. Make admin editor misleading (shows content that may not be used)

**Solution**: Remove ALL hardcoded defaults. If CMS section missing, show empty state, not defaults.

---

## SURF PAGE - HARDCODED CONTENT IDENTIFIED

### 1. Local Break Section
**Hardcoded**: Title, description, features array, disclaimer
**Should be**: ALL from CMS `local_break` section
**Status**: Section exists in DB but code has fallbacks

### 2. Surf Lessons Section  
**Hardcoded**: Title, paragraphs array, images array
**Should be**: ALL from CMS `surf_lessons` section
**Status**: Section exists in DB but code has fallbacks

### 3. World-Class Surfing Section
**Hardcoded**: Default locations array with full descriptions
**Should be**: ALL from CMS `world_class_surfing` section
**Status**: Section exists in DB but code has fallbacks

### 4. FAQ Section
**Hardcoded**: Entire FAQ items array
**Should be**: ALL from CMS `faq` section
**Status**: Section exists in DB but code has fallbacks

---

## SITE-WIDE PAGES TO AUDIT

### About Page
- Check for hardcoded team member content
- Check for hardcoded features/benefits
- Check for hardcoded testimonials

### Contact Page
- Check for hardcoded contact information
- Check for hardcoded form fields
- Check for hardcoded office hours

### Flow Page
- Check for hardcoded activity descriptions
- Check for hardcoded pricing
- Check for hardcoded features

### Play Page
- Check for hardcoded activity content
- Check for hardcoded pricing
- Check for hardcoded features

### Homepage
- Check for hardcoded sections
- Check for hardcoded content blocks
- Check for hardcoded testimonials

### The-Spot Page
- Check for hardcoded facility descriptions
- Check for hardcoded features
- Check for hardcoded pricing

### Surf-Weeks Page
- Check for hardcoded content
- Check for hardcoded pricing
- Check for hardcoded features

---

## FIX STRATEGY

### Phase 1: Surf Page (Immediate)
1. Remove all hardcoded defaults from SurfPageClient.tsx
2. Update rendering logic to ONLY use CMS data
3. Show empty state if CMS section missing
4. Verify all content now editable in admin

### Phase 2: Other Pages (Systematic)
1. Audit each page for hardcoded content
2. Remove hardcoded defaults
3. Ensure all content comes from CMS
4. Update admin UI if needed

### Phase 3: Verification
1. Test each page in admin editor
2. Verify changes appear on live site
3. Confirm no hardcoded fallbacks remain

---

## IMPLEMENTATION RULES

**Rule 1**: NO hardcoded defaults
- If CMS data missing, show empty state
- Never fall back to hardcoded content
- This makes CMS functionality visible

**Rule 2**: All editable content in CMS
- Every text block should be editable
- Every image should be editable
- Every list item should be editable

**Rule 3**: Admin UI matches code
- If code renders it, admin should allow editing
- No orphaned CMS sections
- No missing CMS sections

---

## VERIFICATION CHECKLIST

For each page:
- [ ] Identify all hardcoded content
- [ ] Remove hardcoded defaults
- [ ] Ensure CMS sections exist for all content
- [ ] Update admin UI if needed
- [ ] Test on production
- [ ] Verify changes appear on live site
