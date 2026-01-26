# CMS Drift Specification - Complete Analysis

**Date**: January 11, 2026
**Status**: CRITICAL ISSUES IDENTIFIED

## Executive Summary

**PROBLEM**: Admin CMS editors can modify content that either:
1. Does NOT affect the live site (content ignored)
2. APPEARS to not work (defaults mask CMS changes)
3. Causes rendering issues (blog styling broken)

---

## Issue 1: Surf Page - Video Cannot Be Changed

### Database State
```sql
-- surf_conditions section
videoUrl: "https://www.youtube.com/embed/9nhQiKGsgHg"
```

### Code State (`SurfPageClient.tsx` line 153)
```typescript
videoUrl: '',  // Changed from matching URL to empty
```

### The Problem
- Default was SAME video URL with different query params
- User changes videoUrl in CMS to different video
- Frontend still shows old video because it falls back to empty string (shows nothing) or uses default
- **ROOT CAUSE**: Default videoUrl removed but component needs CMS value to actually be used

### The Fix Required
Ensure `surfConditionsContent?.videoUrl` is ACTUALLY used and validated

---

## Issue 2: Blog Post Styling - Prose Not Applied

### Expected
```html
<div class="prose prose-lg max-w-none prose-headings:text-gray-900 ...">
  <p>Content with proper spacing</p>
</div>
```

### Actual (Production)
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
  <p class="text-xl text-gray-600 mb-8 font-medium">Long unbroken text...</p>
</div>
```

### The Problem
- TipTapRenderer has prose classes in code
- Production HTML does NOT show prose classes
- Text overflows container
- No typography styling applied

### The Fix Required
1. Verify build includes updated TipTapRenderer
2. Ensure prose classes are in DOM
3. Test actual rendering on production URL

---

## Issue 3: CMS Default Values Mask User Changes

### Current Pattern (BROKEN)
```typescript
const defaultSurfConditions = {
  videoUrl: 'https://www.youtube.com/embed/9nhQiKGsgHg?...'
}

<iframe src={surfConditionsContent?.videoUrl || defaultSurfConditions.videoUrl} />
```

### Why This Is Broken
- User changes videoUrl in CMS to new video
- If CMS fetch fails OR returns empty, shows default
- If CMS value is similar to default, user can't tell if CMS is working
- Creates illusion that CMS is non-functional

### The Fix Required
- Remove defaults that match production content
- Make defaults visibly different OR remove entirely
- Add loading states so users know when CMS is being fetched

---

## Verification Checklist

### Surf Page CMS
- [ ] Change videoUrl in admin to different YouTube video
- [ ] Verify new video appears on `/surf` page
- [ ] Change hero imageUrl in admin
- [ ] Verify new image appears on `/surf` hero

### Blog Styling
- [ ] Visit https://heiwahauz.netlify.app/blog/testing-blogpost
- [ ] Inspect element - verify prose classes present
- [ ] Verify text wraps properly (no overflow)
- [ ] Verify headings have proper hierarchy
- [ ] Verify links are styled orange

### Build Verification
- [ ] Run `npm run build` - succeeds
- [ ] Check build output includes TipTapRenderer changes
- [ ] Deploy to Netlify
- [ ] Wait for deployment to complete (check Netlify dashboard)
- [ ] Test on production URL

---

## Root Cause Analysis

### Architecture Issue
**Problem**: Client-side CMS fetching causes:
1. Initial render with defaults
2. Flash of default content
3. Hydration mismatches
4. No SSG benefits

**Solution**: ✅ FIXED - Converted to server-side fetching

### Default Values Issue
**Problem**: Hardcoded defaults that match production content make it impossible to verify CMS is working

**Solution**: PENDING - Remove or make defaults visibly different

### Build/Deploy Issue  
**Problem**: Changes committed but not verified on production before claiming fix complete

**Solution**: PENDING - Verify actual production state after each deployment

---

## Action Items

1. **VERIFY DEPLOYMENT STATUS** - Check Netlify dashboard
2. **TEST PRODUCTION** - Actually visit URLs and inspect
3. **FIX REMAINING ISSUES** - Based on actual production state
4. **RE-DEPLOY** - With all fixes
5. **VERIFY AGAIN** - On production with real user actions
