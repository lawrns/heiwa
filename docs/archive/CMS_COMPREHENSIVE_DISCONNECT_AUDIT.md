# 🔍 Comprehensive CMS Disconnect Audit

## Critical Field Mapping Issues

### 1. **Field Name Mismatches**

#### Problem: Pages use wrong field names
- **Pages expect**: `section_type`, `section_name`, `content.video_url`
- **Database has**: `section`, `video_url` (direct), `image_url` (direct)
- **Affected Pages**: `play`, `flow`, `surf`

#### Example from `app/play/page.tsx`:
```typescript
// ❌ WRONG - Uses section_type
const heroSection = cmsContent.find(s => s.section_type === 'hero')

// ❌ WRONG - Expects nested content.video_url
videoUrl={typeof heroSection?.content === 'object' && heroSection.content?.video_url || "/images/videos/play-activities.mp4"}
```

#### Database Reality:
```sql
-- page_content table has:
section: 'hero'  -- NOT section_type
video_url: '/images/videos/play-activities.mp4'  -- NOT content.video_url
image_url: '/images/activities/pool.jpg'  -- NOT content.image_url
```

---

## Page-by-Page Disconnects

### 🏠 **Homepage (`app/page.tsx`)**

#### ✅ FIXED:
- Hero section video_url (was hardcoded)
- Hero section image_url (was ignored)
- Hero section link_url/link_text (buttons were hardcoded)
- Hero section description (was not displayed)

#### ❌ STILL BROKEN:
- **Surf Weeks Section**: Uses `surfWeeksSection` but may not use all CMS fields
- **About Section**: Uses `aboutSection?.title` but hardcoded cards
- **Rooms Section**: Uses `roomsSection?.title` but hardcoded cards
- **Reviews Section**: Uses `reviewsSection?.title` but hardcoded GoogleReviews component
- **Facilities Section**: Not checked yet
- **Activities Around**: Completely hardcoded array

---

### 🎮 **Play Page (`app/play/page.tsx`)**

#### ❌ CRITICAL ISSUES:

1. **Field Name Mismatch**:
   ```typescript
   // Line 56: Uses section_type (WRONG)
   const heroSection = cmsContent.find(s => s.section_type === 'hero')
   // Should be: s.section === 'hero'
   ```

2. **Content Structure Mismatch**:
   ```typescript
   // Line 96: Expects content.video_url (WRONG)
   videoUrl={typeof heroSection?.content === 'object' && heroSection.content?.video_url || "/images/videos/play-activities.mp4"}
   // Database has: video_url directly, not nested
   ```

3. **Hardcoded Content**:
   - FAQ items (lines 61-86) - completely hardcoded
   - Activity highlights (lines 146-168) - hardcoded video URLs, images
   - Activity sections (lines 174-213) - hardcoded titles/descriptions
   - CTA section fallback (lines 268-288) - hardcoded

4. **Missing CMS Fields**:
   - `video_url` from database not used
   - `image_url` from database not used
   - `title` from database not used properly
   - `content` field exists but structure unclear

---

### 🧘 **Flow Page (`app/flow/page.tsx`)**

#### ❌ SAME ISSUES AS PLAY PAGE:

1. **Field Name Mismatch**: Uses `section_type` instead of `section`
2. **Content Structure**: Expects nested `content.video_url` but database has direct `video_url`
3. **Hardcoded Content**:
   - Activity highlights (lines 120-168) - all hardcoded
   - Activity sections (lines 174-213) - hardcoded
   - CTA section fallback (lines 247-267) - hardcoded

---

### 🏄 **Surf Page (`app/surf/page.tsx`)**

#### ❌ SAME ISSUES:

1. **Field Name Mismatch**: Uses `section_type` instead of `section`
2. **Content Structure**: Expects nested content but database has direct fields
3. **Massive Hardcoded Content**:
   - FAQ items (lines 73-106) - completely hardcoded
   - Local surfing section (lines 158-230) - hardcoded
   - Surf week promotional card (lines 233-295) - hardcoded
   - Seasonal chart - hardcoded
   - Surf spots section (lines 306-526) - hardcoded
   - Surf lessons section (lines 356-405) - hardcoded
   - CTA section (lines 550-611) - hardcoded

---

### 🏡 **The Spot Page (`app/the-spot/page.tsx`)**

#### ❌ COMPLETELY DISCONNECTED:

- **NO CMS INTEGRATION AT ALL**
- All content hardcoded:
  - Hero section (lines 58-74)
  - Our Story section (lines 78-93)
  - Property overview (lines 96-108)
  - Yoga Dome section (lines 111-147)
  - Skatepark section (lines 150-186)
  - Pool section (lines 189-225)
  - Games section (lines 228-264)
  - CTA section (lines 267-278)

**Should use**: `page_content` table with `page_slug='the-spot'`

---

### 🏄‍♂️ **Surf Weeks Page (`app/surf-weeks/page.tsx`)**

#### ⚠️ PARTIAL CMS INTEGRATION:

- ✅ Fetches CMS content (`getSurfWeeksCMSContent()`)
- ❌ **BUT NEVER USES IT!** - `cmsContent` variable is never referenced
- All content hardcoded:
  - Hero section (lines 302-326) - hardcoded
  - Included features (lines 149-193) - hardcoded
  - Surf week steps (lines 196-237) - hardcoded
  - Pricing (lines 240-294) - hardcoded
  - FAQ (lines 609-666) - hardcoded

---

### 📞 **Contact Page (`app/contact/page.tsx`)**

#### ❌ COMPLETELY HARDCODED:

- Hero section (lines 69-84) - hardcoded
- Contact information (lines 99-138) - hardcoded
- Social links (lines 141-165) - hardcoded
- Form - functional but no CMS integration
- Map (lines 314-330) - hardcoded

**Should use**: `page_content` table with `page_slug='contact'`

---

### ℹ️ **About Page (`app/about/page.tsx`)**

- Just redirects to `/the-spot` - no CMS needed here

---

## API Endpoint Issues

### `/api/cms/page-content/route.ts`

#### ✅ CORRECT:
- Returns data with `section` field (not `section_type`)
- Returns `video_url` and `image_url` directly (not nested)

#### ❌ PROBLEM:
- Pages expect different structure than API returns
- Need to check if API transforms data correctly

---

## Database Schema vs Code Expectations

### `page_content` Table Structure:
```sql
section: varchar(50)        -- Pages use section_type ❌
title: text                -- ✅ Used correctly
content: text              -- ✅ Used but structure unclear
video_url: varchar(500)    -- Pages expect content.video_url ❌
image_url: varchar(500)    -- Pages expect content.image_url ❌
json_content: jsonb        -- ✅ Used but structure unclear
```

### `homepage_content` Table Structure:
```sql
section: varchar(50)        -- ✅ Used correctly
title: text                 -- ✅ Used correctly
subtitle: text              -- ✅ Used correctly
description: text           -- ✅ NOW USED (just fixed)
image_url: text             -- ✅ NOW USED (just fixed)
video_url: text             -- ✅ NOW USED (just fixed)
link_url: text              -- ✅ NOW USED (just fixed)
link_text: text             -- ✅ NOW USED (just fixed)
```

---

## Summary of All Disconnects

### Critical (Breaks Functionality):
1. ❌ Field name mismatch: `section_type` vs `section`
2. ❌ Content structure mismatch: nested `content.video_url` vs direct `video_url`
3. ❌ The Spot page: No CMS integration at all
4. ❌ Surf Weeks page: Fetches CMS but never uses it

### High Priority (Major Content Hardcoded):
5. ❌ FAQ sections: Hardcoded in play, flow, surf pages
6. ❌ Activity highlights: Hardcoded video URLs and images
7. ❌ CTA sections: Hardcoded fallbacks
8. ❌ Contact page: Completely hardcoded

### Medium Priority (Some CMS Usage):
9. ⚠️ Homepage sections: Some use CMS, some hardcoded
10. ⚠️ Activity sections: Hardcoded titles/descriptions

---

## Fix Priority Order

1. **Fix field name mismatches** (section_type → section)
2. **Fix content structure** (content.video_url → video_url)
3. **Connect The Spot page to CMS**
4. **Connect Surf Weeks page CMS data**
5. **Move FAQ sections to CMS**
6. **Move activity highlights to CMS**
7. **Connect Contact page to CMS**
8. **Review and fix all homepage sections**

