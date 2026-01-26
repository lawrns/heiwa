# CMS DRIFT AUDIT - Site-Wide Analysis

**Date**: January 11, 2026
**Status**: CRITICAL - MULTIPLE UNUSED SECTIONS ACROSS SITE

---

## EXECUTIVE SUMMARY

**TOTAL DRIFT ISSUES**: 6+ pages affected
**ROOT CAUSE**: No validation between CMS section types and page rendering logic
**IMPACT**: Admins can create/edit content that NEVER appears on site

---

## 1. SURF PAGE - DRIFT CONFIRMED ✅ FIXED

### DB Sections: `{hero, intro, faq, surf_conditions, world_class_surfing}`
### Code Expects: `hero, intro, faq, local_break, surf_lessons, surf_conditions, world_class_surfing`

**DRIFT**:
- ❌ **features** - IN DB, NEVER RENDERED → **DEACTIVATED**
- ⚠️ **local_break** - CODE EXPECTS, NOT IN DB (has default fallback)
- ⚠️ **surf_lessons** - CODE EXPECTS, NOT IN DB (has default fallback)

---

## 2. ABOUT PAGE - DRIFT DETECTED

### DB Sections: `{features, seo, hero, intro, team}`
### Code Expects: UNKNOWN (need to check about page code)

**SUSPECTED DRIFT**:
- ❌ **features** - likely not rendered
- ❌ **seo** - metadata sections don't render as page content

---

## 3. FLOW PAGE - CLEAN

### DB Sections: `{hero, features, intro, activity_highlight×4, activity_grid×2, cta, faq}`
### Code Expects: `hero, intro, activity_highlight, activity_grid, cta`

**STATUS**: ✅ Appears clean (features might be drift, needs verification)

---

## 4. PLAY PAGE - DRIFT DETECTED

### DB Sections: `{faq, hero, intro, activity_highlight×2, activity_grid×2, cta, features}`
### Code Expects: `hero, intro, faq, activity_highlight, activity_grid, cta`

**DRIFT**:
- ❌ **features** - IN DB, code doesn't call getSection('features')

---

## 5. THE-SPOT PAGE - DRIFT DETECTED

### DB Sections: `{seo, features, facility_gallery×5}`
### Code Expects: `hero, intro, cta` (from grep results)

**CRITICAL DRIFT**:
- ❌ **seo** - metadata, not rendered
- ❌ **features** - not in code expectations
- ✅ **facility_gallery×5** - likely used
- ⚠️ **hero** - CODE EXPECTS, NOT IN DB
- ⚠️ **intro** - CODE EXPECTS, NOT IN DB
- ⚠️ **cta** - CODE EXPECTS, NOT IN DB

---

## 6. HOMEPAGE - APPEARS CLEAN

### DB Sections: `{hero, surf-weeks, about, rooms, facilities, hosts}`
### Status: Custom component structure, needs verification

---

## REQUIRED ACTIONS

### Phase 1: Database Cleanup ⚡ URGENT
1. ✅ Deactivate surf > features
2. Deactivate about > features, seo
3. Deactivate flow > features (if not used)
4. Deactivate play > features
5. Deactivate the-spot > seo, features

### Phase 2: Code Alignment
1. Remove unused getSection() calls
2. Add missing sections to DB OR remove code expectations
3. Document valid sections per page

### Phase 3: Prevention
1. Create page-specific section type validators
2. Update admin UI to only show valid types per page
3. Add runtime warnings for unused sections

---

## VALIDATION QUERY

```sql
-- Find all potentially unused sections
SELECT page_slug, section_type, content->>'title' as title
FROM page_sections 
WHERE is_active = true
  AND section_type IN ('features', 'seo')
ORDER BY page_slug;
```
